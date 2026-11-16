from fastapi import APIRouter, HTTPException
from backend.app.models.schemas import (
    CrowdPredictionRequest,
    CrowdPredictionResponse
)
from backend.app.services.prediction_service import PredictionService
from backend.app.config import ROUTES_DATA, STOPS_DATA

router = APIRouter(tags=["Crowd Prediction"])
prediction_service = PredictionService()

@router.post("/predict-crowd", response_model=CrowdPredictionResponse)
def predict_crowd(req: CrowdPredictionRequest):
    """
    Predict BMTC bus crowd level ('Low', 'Medium', 'High')
    using the trained ML pipeline without data leakage.
    """
    # Input validation
    if req.route not in ROUTES_DATA:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid route '{req.route}'. Available routes: {list(ROUTES_DATA.keys())}"
        )
    if req.bus_stop not in STOPS_DATA:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid stop '{req.bus_stop}'. Available stops: {list(STOPS_DATA.keys())}"
        )
    if not (0 <= req.hour <= 23):
        raise HTTPException(status_code=400, detail="Hour must be between 0 and 23.")

    try:
        response = prediction_service.predict_crowd(req)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
