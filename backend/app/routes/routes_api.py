from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

from backend.app.config import (
    ROUTES_DATA,
    STOPS_DATA,
    PROJECT_NAME,
    DATA_DISCLOSURE
)
from backend.app.models.schemas import (
    RouteInfo,
    StopInfo,
    ModelInfoResponse,
    HealthResponse
)
from backend.app.utils.data_loader import DataLoader

router = APIRouter(tags=["Routes & Metadata"])

@router.get("/health", response_model=HealthResponse)
def get_health():
    loader = DataLoader.get_instance()
    return HealthResponse(
        status="healthy",
        project=PROJECT_NAME,
        version="1.0.0",
        loaded_models_count=len(loader.models),
        available_routes_count=len(ROUTES_DATA),
        available_stops_count=len(STOPS_DATA)
    )

@router.get("/routes", response_model=List[RouteInfo])
def get_routes():
    """Returns all verified BMTC corridor routes serving Manyata Tech Park."""
    return [RouteInfo(**r) for r in ROUTES_DATA.values()]

@router.get("/routes/{route_no}", response_model=RouteInfo)
def get_route(route_no: str):
    """Returns details for a specific route."""
    cleaned = route_no.strip()
    if cleaned in ROUTES_DATA:
        return RouteInfo(**ROUTES_DATA[cleaned])
    raise HTTPException(status_code=404, detail=f"Route {route_no} not found.")

@router.get("/stops", response_model=List[StopInfo])
def get_stops():
    """Returns all BMTC bus stops with geo-coordinates in the Manyata corridor."""
    return [StopInfo(**s) for s in STOPS_DATA.values()]

@router.get("/timetable")
def get_timetable():
    """Returns full corridor timetable summary and operating frequencies."""
    timetables = []
    for r_code, r_data in ROUTES_DATA.items():
        timetables.append({
            "route_no": r_code,
            "route_name": r_data["route_name"],
            "first_bus": "05:30 AM",
            "last_bus": "10:45 PM",
            "peak_headway_mins": r_data["peak_frequency_mins"],
            "offpeak_headway_mins": r_data["offpeak_frequency_mins"],
            "stops_sequence": r_data["stops_sequence"],
            "service_type": r_data["bus_type"],
            "data_source": "BMTC Official Scheduled Frequency (Corridor Model)"
        })
    return {
        "status": "success",
        "corridor": "Manyata Tech Park & Hebbal / Yelahanka / Nagawara",
        "timetables": timetables,
        "disclaimer": DATA_DISCLOSURE
    }

@router.get("/model-info", response_model=ModelInfoResponse)
def get_model_info():
    """Returns machine learning model benchmark results, metrics, and training details."""
    loader = DataLoader.get_instance()
    meta = loader.get_metadata()
    benchmarks = loader.get_benchmarks()

    best_f1 = 0.0
    for b in benchmarks:
        if b.get("is_best"):
            best_f1 = b.get("macro_f1", 0.0)

    return ModelInfoResponse(
        project=meta.get("project", PROJECT_NAME),
        best_model_name=loader.best_model_name,
        best_macro_f1=best_f1,
        models=benchmarks,
        dataset_records=meta.get("total_records", 10000),
        train_records=meta.get("train_test_split", {}).get("train_records", 8000),
        test_records=meta.get("train_test_split", {}).get("test_records", 2000),
        features_used=meta.get("feature_names", ["route", "bus_stop", "day_of_week", "hour", "is_weekend"]),
        excluded_columns=meta.get("excluded_columns", ["simulated_passengers_onboard", "simulated_occupancy_percent"]),
        data_warning=meta.get("data_warning", DATA_DISCLOSURE),
        training_timestamp=meta.get("created_at", "2026-11-12T00:26:02")
    )
