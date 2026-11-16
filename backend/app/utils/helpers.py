import math
from datetime import datetime
from typing import Tuple, List, Optional
from backend.app.config import (
    STOPS_DATA,
    ROUTES_DATA,
    PEAK_HOURS_MORNING,
    PEAK_HOURS_EVENING,
    DAYS_OF_WEEK
)

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2.0) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def is_weekend_day(day_name: str) -> int:
    """Return 1 if Saturday or Sunday, else 0."""
    return 1 if day_name.strip().capitalize() in ["Saturday", "Sunday"] else 0

def get_traffic_multiplier(hour: int, is_weekend: bool) -> float:
    """Returns traffic speed deceleration multiplier for Manyata corridor."""
    if is_weekend:
        return 1.1 if 16 <= hour <= 21 else 1.0
    # Weekday peak hours: morning college/IT rush (8-10 AM) and evening rush (17-20 PM)
    if hour in PEAK_HOURS_MORNING:
        return 1.45
    elif hour in PEAK_HOURS_EVENING:
        return 1.55
    elif 11 <= hour <= 16:
        return 1.15
    else:
        return 0.95

def estimate_travel_time(origin: str, dest: str, route_no: str, hour: int) -> Tuple[int, List[str]]:
    """
    Calculate realistic journey duration between two stops on a route,
    accounting for distance, intermediate stops, and time-of-day traffic.
    """
    route_info = ROUTES_DATA.get(route_no)
    if not route_info:
        return 15, []

    stops = route_info["stops_sequence"]
    if origin not in stops or dest not in stops:
        return 15, []

    idx_start = stops.index(origin)
    idx_end = stops.index(dest)

    if idx_start == idx_end:
        return 0, []

    # Handle forward or reverse order
    if idx_start < idx_end:
        sub_sequence = stops[idx_start:idx_end + 1]
    else:
        sub_sequence = list(reversed(stops[idx_end:idx_start + 1]))

    # Calculate approximate road distance using stop coordinates
    total_km = 0.0
    for i in range(len(sub_sequence) - 1):
        s1 = STOPS_DATA.get(sub_sequence[i])
        s2 = STOPS_DATA.get(sub_sequence[i + 1])
        if s1 and s2:
            d = haversine_distance_km(s1["lat"], s1["lng"], s2["lat"], s2["lng"])
            total_km += max(d * 1.35, 1.2) # Urban road curvature factor

    base_speed = route_info["avg_speed_kmph"]
    traffic_factor = get_traffic_multiplier(hour, is_weekend=False)
    effective_speed = max(base_speed / traffic_factor, 10.0)

    # Travel time + 1.5 minute dwell time per intermediate stop
    travel_hours = total_km / effective_speed
    dwell_minutes = (len(sub_sequence) - 1) * 1.5
    total_mins = math.ceil(travel_hours * 60 + dwell_minutes)
    intermediate = sub_sequence[1:-1] if len(sub_sequence) > 2 else []

    return max(total_mins, 5), intermediate

def generate_crowd_explanation(
    route: str,
    bus_stop: str,
    hour: int,
    day_of_week: str,
    crowd_level: str,
    confidence: float
) -> str:
    """Generate human-readable explanation for students regarding the prediction."""
    is_weekend = is_weekend_day(day_of_week) == 1
    time_str = f"{hour:02d}:00"

    if crowd_level == "High":
        if hour in PEAK_HOURS_MORNING:
            return (
                f"High rush predicted around {time_str} on {day_of_week}. "
                f"{bus_stop} serves heavy morning influx of engineering students and Manyata Tech Park "
                f"employees arriving via route {route}. Standing room only expected."
            )
        elif hour in PEAK_HOURS_EVENING:
            return (
                f"Peak evening congestion predicted at {time_str}. Multiple college batches and office shifts "
                f"conclude simultaneously near {bus_stop}, leading to heavy boarding on {route}."
            )
        else:
            return (
                f"Elevated passenger density predicted at {bus_stop} ({time_str}, {day_of_week}) "
                f"due to key interchange activities and corridor bottlenecks on route {route}."
            )
    elif crowd_level == "Medium":
        if is_weekend:
            return (
                f"Moderate weekend travel activity observed at {bus_stop} around {time_str}. "
                f"Seats may be partially occupied, but manageable student boarding is expected."
            )
        else:
            return (
                f"Moderate demand anticipated at {bus_stop} around {time_str}. "
                f"Standard student commute load with fair seat availability on route {route}."
            )
    else: # Low
        if hour < 7 or hour > 21:
            return (
                f"Light crowd predicted at {bus_stop} during off-peak hours ({time_str}). "
                f"Ample seats available; fast and peaceful travel expected on route {route}."
            )
        else:
            return (
                f"Comfortable off-peak conditions predicted on route {route} at {bus_stop} around {time_str}. "
                f"Great travel window for students avoiding crowd congestion."
            )
