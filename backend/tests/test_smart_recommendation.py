import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_smart_recommendation_fields_complete():
    """Verify smart_recommendation is present and contains all required fields."""
    res = client.post("/api/estimate-eta", json={
        "origin_stop": "Hebbal",
        "destination_stop": "Manyata Tech Park",
        "route": "500-D",
        "current_hour": 8,
        "current_minute": 0
    })
    assert res.status_code == 200
    data = res.json()
    assert "smart_recommendation" in data
    rec = data["smart_recommendation"]
    assert rec is not None
    assert "recommended_departure_time" in rec
    assert "predicted_crowd" in rec
    assert "route" in rec
    assert "estimated_arrival_time" in rec
    assert "waiting_time_mins" in rec
    assert "reason" in rec
    assert "has_less_crowded_bus" in rec
    assert isinstance(rec["waiting_time_mins"], int)
    assert rec["predicted_crowd"] in ["Low", "Medium", "High"]

def test_smart_recommendation_when_all_immediate_are_high():
    """
    At 8:00 AM on 500-D, immediate departures are High.
    The algorithm must evaluate up to 2 hours ahead and find a Medium/Low departure.
    """
    res = client.post("/api/estimate-eta", json={
        "origin_stop": "Hebbal",
        "destination_stop": "Manyata Tech Park",
        "route": "500-D",
        "current_hour": 8,
        "current_minute": 0
    })
    assert res.status_code == 200
    data = res.json()
    # Check all immediate 4 are High
    assert all(d["predicted_crowd"] == "High" for d in data["upcoming_departures"])
    
    rec = data["smart_recommendation"]
    assert rec["has_less_crowded_bus"] is True
    assert rec["predicted_crowd"] in ["Low", "Medium"]
    assert rec["waiting_time_mins"] > data["upcoming_departures"][0]["eta_mins_to_origin"]
    assert "lower passenger demand" in rec["reason"]

def test_smart_recommendation_when_all_within_two_hours_are_high():
    """
    At 5:00 PM (hour 17) on 500-D, peak rush lasts through hours 17 and 18.
    All departures in the 2-hour window are High.
    Must output notice and retain actual High prediction for best available departure.
    """
    res = client.post("/api/estimate-eta", json={
        "origin_stop": "Hebbal",
        "destination_stop": "Manyata Tech Park",
        "route": "500-D",
        "current_hour": 17,
        "current_minute": 0
    })
    assert res.status_code == 200
    data = res.json()
    rec = data["smart_recommendation"]
    assert rec["has_less_crowded_bus"] is False
    assert rec["notice"] == "No Low or Medium Crowd buses are predicted within the next 2 hours."
    assert rec["predicted_crowd"] == "High"
    assert rec["waiting_time_mins"] == data["upcoming_departures"][0]["eta_mins_to_origin"]

def test_smart_recommendation_immediate_low_crowd():
    """
    At 12:00 PM on 290-E, immediate departures are Low crowd.
    Must recommend the immediate low crowd bus with appropriate reason.
    """
    res = client.post("/api/estimate-eta", json={
        "origin_stop": "Yelahanka",
        "destination_stop": "Manyata Tech Park",
        "route": "290-E",
        "current_hour": 12,
        "current_minute": 0
    })
    assert res.status_code == 200
    data = res.json()
    rec = data["smart_recommendation"]
    assert rec["has_less_crowded_bus"] is True
    assert rec["predicted_crowd"] == "Low"
    assert rec["recommended_departure_time"] == data["upcoming_departures"][0]["departure_time"]
