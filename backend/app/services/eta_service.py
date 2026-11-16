from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

from backend.app.config import (
    ROUTES_DATA,
    STOPS_DATA,
    PEAK_HOURS_MORNING,
    PEAK_HOURS_EVENING,
    DAYS_OF_WEEK
)
from backend.app.models.schemas import (
    ETARequest,
    ETAResponse,
    ETAScheduleItem,
    CrowdPredictionRequest
)
from backend.app.utils.helpers import estimate_travel_time
from backend.app.services.prediction_service import PredictionService

class ETAService:
    def __init__(self):
        self.prediction_service = PredictionService()

    def get_route_eta(self, req: ETARequest) -> ETAResponse:
        now = datetime.now()
        hour = req.current_hour if req.current_hour is not None else now.hour
        minute = req.current_minute if req.current_minute is not None else now.minute
        day_str = DAYS_OF_WEEK[now.weekday()]

        # Identify route
        route_no = req.route
        if not route_no:
            # Auto-find route connecting origin and destination
            for r_code, r_data in ROUTES_DATA.items():
                stops = r_data["stops_sequence"]
                if req.origin_stop in stops and req.destination_stop in stops:
                    route_no = r_code
                    break
            if not route_no:
                route_no = "500-D" # Fallback corridor

        route_info = ROUTES_DATA.get(route_no, ROUTES_DATA["500-D"])
        is_peak = (hour in PEAK_HOURS_MORNING) or (hour in PEAK_HOURS_EVENING)
        frequency = route_info["peak_frequency_mins"] if is_peak else route_info["offpeak_frequency_mins"]

        # Calculate time until next scheduled bus
        # Bus departs origin terminal at intervals: 00, frequency, 2*frequency, etc.
        mins_into_cycle = minute % frequency
        mins_to_next_bus = frequency - mins_into_cycle
        if mins_to_next_bus == 0:
            mins_to_next_bus = frequency

        # Estimate journey duration between origin_stop and destination_stop
        duration_mins, intermediate = estimate_travel_time(
            origin=req.origin_stop,
            dest=req.destination_stop,
            route_no=route_no,
            hour=hour
        )

        # Calculate predicted crowd for the boarding stop
        pred_res = self.prediction_service.predict_crowd(CrowdPredictionRequest(
            route=route_no,
            bus_stop=req.origin_stop,
            day_of_week=day_str,
            hour=hour
        ))

        base_time = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        arrival_dest_time = base_time + timedelta(minutes=(mins_to_next_bus + duration_mins))

        # Generate next 4 upcoming scheduled departures
        upcoming_list: List[ETAScheduleItem] = []
        for i in range(4):
            offset_mins = mins_to_next_bus + (i * frequency)
            dep_dt = base_time + timedelta(minutes=offset_mins)
            dest_arr_dt = dep_dt + timedelta(minutes=duration_mins)

            # Predict crowd at this future hour
            future_crowd = self.prediction_service.predict_crowd(CrowdPredictionRequest(
                route=route_no,
                bus_stop=req.origin_stop,
                day_of_week=day_str,
                hour=dep_dt.hour
            )).crowd_level

            upcoming_list.append(ETAScheduleItem(
                departure_time=dep_dt.strftime("%I:%M %p"),
                estimated_arrival_origin=dep_dt.strftime("%I:%M %p"),
                eta_mins_to_origin=offset_mins,
                journey_duration_mins=duration_mins,
                estimated_destination_arrival=dest_arr_dt.strftime("%I:%M %p"),
                predicted_crowd=future_crowd
            ))

        return ETAResponse(
            origin_stop=req.origin_stop,
            destination_stop=req.destination_stop,
            route=route_no,
            route_name=route_info["route_name"],
            current_time=f"{hour:02d}:{minute:02d}",
            next_bus_eta_mins=mins_to_next_bus,
            journey_duration_mins=duration_mins,
            estimated_arrival_time=arrival_dest_time.strftime("%I:%M %p"),
            predicted_crowd_level=pred_res.crowd_level,
            data_source="BMTC Scheduled Corridor Timetable (Frequency Model)",
            is_live_gps=False,
            schedule_disclaimer="Estimated scheduled ETA based on standard BMTC timetable headway. Real-time GPS tracking is unverified.",
            upcoming_departures=upcoming_list,
            intermediate_stops=intermediate
        )
