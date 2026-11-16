import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["available_routes_count"] >= 3
    assert data["available_stops_count"] >= 8

def test_routes():
    res = client.get("/api/routes")
    assert res.status_code == 200
    routes = res.json()
    assert len(routes) >= 3
    route_nos = [r["route_no"] for r in routes]
    assert "500-D" in route_nos
    assert "290-E" in route_nos
    assert "290-B" in route_nos

def test_stops():
    res = client.get("/api/stops")
    assert res.status_code == 200
    stops = res.json()
    assert len(stops) >= 8
    stop_names = [s["name"] for s in stops]
    assert "Manyata Tech Park" in stop_names
    assert "Hebbal" in stop_names

def test_timetable():
    res = client.get("/api/timetable")
    assert res.status_code == 200
    data = res.json()
    assert "timetables" in data
    assert len(data["timetables"]) >= 3

def test_model_info():
    res = client.get("/api/model-info")
    assert res.status_code == 200
    info = res.json()
    assert info["best_model_name"] == "Gradient Boosting"
    assert info["best_macro_f1"] >= 70.0
    assert len(info["models"]) >= 7

def test_predict_crowd():
    payload = {
        "route": "500-D",
        "bus_stop": "Veerannapalya",
        "day_of_week": "Monday",
        "hour": 9,
        "is_weekend": 0
    }
    res = client.post("/api/predict-crowd", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["crowd_level"] in ["Low", "Medium", "High"]
    assert "confidence_percent" in data
    assert "explanation" in data
    assert data["route"] == "500-D"

def test_estimate_eta():
    payload = {
        "origin_stop": "Hebbal",
        "destination_stop": "Manyata Tech Park",
        "route": "500-D",
        "current_hour": 9,
        "current_minute": 15
    }
    res = client.post("/api/estimate-eta", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["next_bus_eta_mins"] > 0
    assert data["journey_duration_mins"] > 0
    assert len(data["upcoming_departures"]) > 0

def test_recommend_bus():
    payload = {
        "origin_stop": "Hebbal",
        "destination_stop": "Manyata Tech Park",
        "day_of_week": "Monday",
        "hour": 9,
        "minute": 0
    }
    res = client.post("/api/recommend-bus", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["recommended_option"] is not None
    assert len(data["all_options"]) > 0
