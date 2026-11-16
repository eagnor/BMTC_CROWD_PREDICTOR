from fastapi import APIRouter, HTTPException
from backend.app.models.schemas import (
    RouteRecommendationRequest,
    RouteRecommendationResponse
)
from backend.app.services.recommendation_service import RecommendationService
from backend.app.config import STOPS_DATA

router = APIRouter(tags=["Bus Recommendation"])
rec_service = RecommendationService()

@router.post("/recommend-bus", response_model=RouteRecommendationResponse)
def recommend_bus(req: RouteRecommendationRequest):
    """
    Evaluates all corridor routes connecting origin to destination,
    ranks them by travel time and predicted crowd congestion,
    and recommends the optimal option for students.
    """
    if req.origin_stop not in STOPS_DATA:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid origin stop '{req.origin_stop}'. Available stops: {list(STOPS_DATA.keys())}"
        )
    if req.destination_stop not in STOPS_DATA:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid destination stop '{req.destination_stop}'. Available stops: {list(STOPS_DATA.keys())}"
        )
    if req.origin_stop == req.destination_stop:
        raise HTTPException(status_code=400, detail="Origin and destination stops cannot be identical.")

    try:
        return rec_service.recommend_route(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")
