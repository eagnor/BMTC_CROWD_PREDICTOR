from fastapi import APIRouter, HTTPException
from backend.app.models.schemas import ETARequest, ETAResponse
from backend.app.services.eta_service import ETAService
from backend.app.config import STOPS_DATA

router = APIRouter(tags=["Bus ETA"])
eta_service = ETAService()

@router.post("/estimate-eta", response_model=ETAResponse)
def estimate_eta(req: ETARequest):
    """
    Estimate upcoming BMTC bus arrivals, travel durations,
    and predicted boarding crowd levels.
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
        return eta_service.get_route_eta(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ETA calculation error: {str(e)}")
