from datetime import datetime
from typing import List, Optional, Dict, Any

from backend.app.config import (
    ROUTES_DATA,
    STOPS_DATA,
    PEAK_HOURS_MORNING,
    PEAK_HOURS_EVENING,
    DAYS_OF_WEEK,
    DATA_DISCLOSURE
)
from backend.app.models.schemas import (
    RouteRecommendationRequest,
    RouteRecommendationResponse,
    RouteOptionDetails,
    CrowdPredictionRequest
)
from backend.app.utils.helpers import estimate_travel_time, is_weekend_day
from backend.app.services.prediction_service import PredictionService

class RecommendationService:
    def __init__(self):
        self.prediction_service = PredictionService()

    def recommend_route(self, req: RouteRecommendationRequest) -> RouteRecommendationResponse:
        now = datetime.now()
        day_str = req.day_of_week or DAYS_OF_WEEK[now.weekday()]
        hour = req.hour if req.hour is not None else now.hour
        minute = req.minute if req.minute is not None else now.minute
        is_wknd = is_weekend_day(day_str)

        origin = req.origin_stop.strip()
        destination = req.destination_stop.strip()

        viable_routes = []

        # 1. Check direct corridor routes serving both origin and destination
        for route_no, r_data in ROUTES_DATA.items():
            stops = r_data["stops_sequence"]
            if origin in stops and destination in stops:
                viable_routes.append({
                    "route_no": route_no,
                    "is_direct": True,
                    "transfer_at": None,
                    "route_info": r_data
                })

        # 2. If no direct routes exist or only 1 exists, check routes serving origin or nearby
        if len(viable_routes) == 0:
            # Check routes serving origin, connect via Manyata Tech Park hub
            for route_no, r_data in ROUTES_DATA.items():
                stops = r_data["stops_sequence"]
                if origin in stops:
                    viable_routes.append({
                        "route_no": route_no,
                        "is_direct": False,
                        "transfer_at": "Manyata Tech Park",
                        "route_info": r_data
                    })

        options_list: List[RouteOptionDetails] = []

        for item in viable_routes:
            r_no = item["route_no"]
            r_info = item["route_info"]

            # Predict crowd at origin stop
            pred_res = self.prediction_service.predict_crowd(CrowdPredictionRequest(
                route=r_no,
                bus_stop=origin,
                day_of_week=day_str,
                hour=hour,
                is_weekend=is_wknd
            ))

            is_peak = (hour in PEAK_HOURS_MORNING) or (hour in PEAK_HOURS_EVENING)
            frequency = r_info["peak_frequency_mins"] if is_peak else r_info["offpeak_frequency_mins"]
            mins_to_bus = frequency - (minute % frequency)
            if mins_to_bus == 0:
                mins_to_bus = frequency

            target_stop = destination if item["is_direct"] else "Manyata Tech Park"
            travel_time, inter_stops = estimate_travel_time(origin, target_stop, r_no, hour)
            total_time = mins_to_bus + travel_time

            # Scoring algorithm: Higher is better
            # Baseline 100 points
            # Crowd penalty: Low (+25), Medium (+5), High (-30)
            # Duration penalty: -1 point per minute of total time
            score = 100.0
            if pred_res.crowd_level == "Low":
                score += 30.0
            elif pred_res.crowd_level == "Medium":
                score += 5.0
            else:
                score -= 30.0

            score -= (total_time * 0.8)

            reason_str = ""
            if item["is_direct"]:
                if pred_res.crowd_level == "Low":
                    reason_str = f"Direct route to {destination} with comfortable seat availability (predicted Low crowd)."
                elif pred_res.crowd_level == "Medium":
                    reason_str = f"Direct route to {destination} with moderate occupancy and frequent arrivals (every {frequency} mins)."
                else:
                    reason_str = f"Direct route to {destination}, but expect high student & office commuter rush."
            else:
                reason_str = f"Corridor connection via Manyata Tech Park hub (transfer required to reach {destination})."

            options_list.append(RouteOptionDetails(
                route=r_no,
                route_name=r_info["route_name"],
                color=r_info["color"],
                predicted_crowd=pred_res.crowd_level,
                crowd_confidence=pred_res.confidence_percent,
                eta_minutes=mins_to_bus,
                travel_time_minutes=travel_time,
                total_time_minutes=total_time,
                intermediate_stops=inter_stops,
                score=round(score, 1),
                recommendation_badge=None,
                reason=reason_str
            ))

        # Sort options by score descending
        options_list.sort(key=lambda o: o.score, reverse=True)

        recommended_option = None
        if options_list:
            recommended_option = options_list[0]
            recommended_option.recommendation_badge = "BEST CHOICE"

            # Check if fastest vs least crowded distinction exists
            fastest_option = min(options_list, key=lambda o: o.total_time_minutes)
            if fastest_option.route != recommended_option.route:
                fastest_option.recommendation_badge = "FASTEST"

            least_crowded = next((o for o in options_list if o.predicted_crowd == "Low"), None)
            if least_crowded and least_crowded.route != recommended_option.route:
                least_crowded.recommendation_badge = "LEAST CROWDED"

        summary_text = (
            f"Evaluated {len(options_list)} BMTC travel option(s) from {origin} to {destination} for {day_str} {hour:02d}:00. "
        )
        if recommended_option:
            summary_text += (
                f"We recommend Route {recommended_option.route} because of its balanced crowd profile "
                f"('{recommended_option.predicted_crowd}') and quick ETA ({recommended_option.eta_minutes} mins)."
            )

        return RouteRecommendationResponse(
            origin_stop=origin,
            destination_stop=destination,
            day_of_week=day_str,
            hour=hour,
            recommended_option=recommended_option,
            all_options=options_list,
            summary=summary_text,
            disclaimer=DATA_DISCLOSURE
        )
