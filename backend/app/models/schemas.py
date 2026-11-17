from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class StopInfo(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    area: str
    landmark: str

class RouteInfo(BaseModel):
    route_no: str
    route_name: str
    origin: str
    destination: str
    stops_sequence: List[str]
    bus_type: str
    peak_frequency_mins: int
    offpeak_frequency_mins: int
    avg_speed_kmph: int
    color: str
    description: str

class CrowdPredictionRequest(BaseModel):
    route: str = Field(..., description="BMTC Route No, e.g., '500-D', '290-E', '290-B'")
    bus_stop: str = Field(..., description="Bus Stop name, e.g., 'Veerannapalya', 'Hebbal'")
    day_of_week: str = Field(..., description="Day of week, e.g., 'Monday'")
    hour: int = Field(..., ge=0, le=23, description="Hour of the day (0-23)")
    is_weekend: Optional[int] = Field(None, ge=0, le=1, description="1 if weekend, 0 otherwise. Auto-detected if omitted.")
    model_name: Optional[str] = Field("Gradient Boosting", description="Trained model to use for inference")

class AlternativeOption(BaseModel):
    route: str
    bus_stop: str
    predicted_crowd: str
    confidence: float
    estimated_arrival_mins: int
    reason: str

class CrowdPredictionResponse(BaseModel):
    route: str
    bus_stop: str
    day_of_week: str
    hour: int
    is_weekend: int
    crowd_level: str
    confidence_percent: float
    probabilities: Dict[str, float]
    model_used: str
    predicted_at: str
    explanation: str
    data_notice: str
    suggested_alternative: Optional[AlternativeOption] = None

class ETARequest(BaseModel):
    origin_stop: str
    destination_stop: str
    route: Optional[str] = None
    current_hour: Optional[int] = None
    current_minute: Optional[int] = None

class ETAScheduleItem(BaseModel):
    departure_time: str
    estimated_arrival_origin: str
    eta_mins_to_origin: int
    journey_duration_mins: int
    estimated_destination_arrival: str
    predicted_crowd: str

class SmartTravelRecommendation(BaseModel):
    recommended_departure_time: str
    predicted_crowd: str
    route: str
    estimated_arrival_time: str
    waiting_time_mins: int
    reason: str
    has_less_crowded_bus: bool
    notice: Optional[str] = None

class ETAResponse(BaseModel):
    origin_stop: str
    destination_stop: str
    route: str
    route_name: str
    current_time: str
    next_bus_eta_mins: int
    journey_duration_mins: int
    estimated_arrival_time: str
    predicted_crowd_level: str
    data_source: str
    is_live_gps: bool = False
    schedule_disclaimer: str
    upcoming_departures: List[ETAScheduleItem]
    intermediate_stops: List[str]
    smart_recommendation: Optional[SmartTravelRecommendation] = None

class RouteRecommendationRequest(BaseModel):
    origin_stop: str
    destination_stop: str
    day_of_week: Optional[str] = None
    hour: Optional[int] = None
    minute: Optional[int] = None

class RouteOptionDetails(BaseModel):
    route: str
    route_name: str
    color: str
    predicted_crowd: str
    crowd_confidence: float
    eta_minutes: int
    travel_time_minutes: int
    total_time_minutes: int
    intermediate_stops: List[str]
    score: float
    recommendation_badge: Optional[str] = None
    reason: str

class RouteRecommendationResponse(BaseModel):
    origin_stop: str
    destination_stop: str
    day_of_week: str
    hour: int
    recommended_option: Optional[RouteOptionDetails] = None
    all_options: List[RouteOptionDetails]
    summary: str
    disclaimer: str

class ModelMetric(BaseModel):
    model_name: str
    accuracy: float
    macro_precision: float
    macro_recall: float
    macro_f1: float
    latency_ms: float
    is_best: bool
    confusion_matrix: List[List[int]]
    class_labels: List[str]

class ModelInfoResponse(BaseModel):
    project: str
    best_model_name: str
    best_macro_f1: float
    models: List[ModelMetric]
    dataset_records: int
    train_records: int
    test_records: int
    features_used: List[str]
    excluded_columns: List[str]
    data_warning: str
    training_timestamp: str

class HealthResponse(BaseModel):
    status: str
    project: str
    version: str
    loaded_models_count: int
    available_routes_count: int
    available_stops_count: int
