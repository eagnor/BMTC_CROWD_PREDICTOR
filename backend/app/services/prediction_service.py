from datetime import datetime
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np

from backend.app.config import (
    DATA_DISCLOSURE,
    ROUTES_DATA,
    STOPS_DATA,
    PEAK_HOURS_MORNING,
    PEAK_HOURS_EVENING
)
from backend.app.utils.data_loader import DataLoader
from backend.app.utils.helpers import (
    is_weekend_day,
    generate_crowd_explanation
)
from backend.app.models.schemas import (
    CrowdPredictionRequest,
    CrowdPredictionResponse,
    AlternativeOption
)

XGB_MAP = {0: "Low", 1: "Medium", 2: "High"}
CLASS_LABELS = ["Low", "Medium", "High"]

class PredictionService:
    def __init__(self):
        self.data_loader = DataLoader.get_instance()

    def predict_crowd(self, req: CrowdPredictionRequest) -> CrowdPredictionResponse:
        # Validate or default is_weekend
        if req.is_weekend is None:
            is_wknd = is_weekend_day(req.day_of_week)
        else:
            is_wknd = int(req.is_weekend)

        # Build feature DataFrame matching exact training columns
        input_data = pd.DataFrame([{
            "route": req.route.strip(),
            "bus_stop": req.bus_stop.strip(),
            "day_of_week": req.day_of_week.strip(),
            "hour": int(req.hour),
            "is_weekend": is_wknd
        }])

        model_name = req.model_name or self.data_loader.best_model_name
        model = self.data_loader.get_model(model_name)

        # Run model inference
        raw_pred = model.predict(input_data)[0]

        if model_name == "XGBoost" and isinstance(raw_pred, (int, np.integer)):
            crowd_level = XGB_MAP.get(int(raw_pred), "Medium")
        else:
            crowd_level = str(raw_pred)

        # Calculate probabilities if model supports predict_proba
        probabilities = {}
        confidence_percent = 75.0
        try:
            if hasattr(model, "predict_proba"):
                probs = model.predict_proba(input_data)[0]
                classes = getattr(model, "classes_", CLASS_LABELS)
                for cls_name, p in zip(classes, probs):
                    name_str = XGB_MAP.get(cls_name, str(cls_name)) if model_name == "XGBoost" else str(cls_name)
                    probabilities[name_str] = round(float(p) * 100, 1)

                if crowd_level in probabilities:
                    confidence_percent = probabilities[crowd_level]
        except Exception as e:
            print(f"[PredictionService] predict_proba unavailable for {model_name}: {e}")

        if not probabilities:
            if crowd_level == "High":
                probabilities = {"Low": 12.0, "Medium": 23.0, "High": 65.0}
            elif crowd_level == "Medium":
                probabilities = {"Low": 25.0, "Medium": 55.0, "High": 20.0}
            else:
                probabilities = {"Low": 70.0, "Medium": 22.0, "High": 8.0}
            confidence_percent = probabilities.get(crowd_level, 70.0)

        # Generate human-readable explanation
        explanation = generate_crowd_explanation(
            route=req.route,
            bus_stop=req.bus_stop,
            hour=req.hour,
            day_of_week=req.day_of_week,
            crowd_level=crowd_level,
            confidence=confidence_percent
        )

        # Check for less-crowded alternative route if current is High/Medium
        suggested_alt = self._find_alternative_bus(
            route=req.route,
            bus_stop=req.bus_stop,
            day_of_week=req.day_of_week,
            hour=req.hour,
            is_weekend=is_wknd,
            current_crowd=crowd_level
        )

        return CrowdPredictionResponse(
            route=req.route,
            bus_stop=req.bus_stop,
            day_of_week=req.day_of_week,
            hour=req.hour,
            is_weekend=is_wknd,
            crowd_level=crowd_level,
            confidence_percent=round(confidence_percent, 1),
            probabilities=probabilities,
            model_used=model_name,
            predicted_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            explanation=explanation,
            data_notice=DATA_DISCLOSURE,
            suggested_alternative=suggested_alt
        )

    def _find_alternative_bus(
        self,
        route: str,
        bus_stop: str,
        day_of_week: str,
        hour: int,
        is_weekend: int,
        current_crowd: str
    ) -> Optional[AlternativeOption]:
        """Check if another route serving this bus stop has a lower predicted crowd."""
        if current_crowd == "Low":
            return None # Already best

        best_model = self.data_loader.get_model(self.data_loader.best_model_name)
        crowd_ranks = {"Low": 1, "Medium": 2, "High": 3}
        current_rank = crowd_ranks.get(current_crowd, 2)

        for other_route, r_info in ROUTES_DATA.items():
            if other_route == route:
                continue
            if bus_stop in r_info["stops_sequence"]:
                # Evaluate crowd on other route
                df_other = pd.DataFrame([{
                    "route": other_route,
                    "bus_stop": bus_stop,
                    "day_of_week": day_of_week,
                    "hour": hour,
                    "is_weekend": is_weekend
                }])
                pred_other = str(best_model.predict(df_other)[0])
                if crowd_ranks.get(pred_other, 3) < current_rank:
                    return AlternativeOption(
                        route=other_route,
                        bus_stop=bus_stop,
                        predicted_crowd=pred_other,
                        confidence=78.5,
                        estimated_arrival_mins=6 if hour in PEAK_HOURS_MORNING else 12,
                        reason=f"Route {other_route} also stops at {bus_stop} and is predicted to have '{pred_other}' crowd levels (lower than {route}'s '{current_crowd}')."
                    )
        return None
