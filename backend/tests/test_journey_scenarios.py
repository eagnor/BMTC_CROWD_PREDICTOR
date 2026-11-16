from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.config import ROUTES_DATA

client = TestClient(app)

def test_scenarios():
    print("=== Testing Journey Scenarios ===")
    
    # 1. Routes API
    res = client.get("/api/routes")
    routes = res.json()
    print(f"Loaded {len(routes)} routes.")

    scenarios = [
        ("Hebbal", "Manyata Tech Park", ["500-D"]),
        ("Thanisandra", "Manyata Tech Park", ["290-E", "290-B"]),
        ("Yelahanka", "Thanisandra", ["290-E"]),
        ("RK Hegde Nagar", "Nagawara", ["290-B"]),
        ("Hebbal", "Yelahanka", []),
    ]

    for origin, dest, expected_routes in scenarios:
        direct = [
            r["route_no"] for r in routes
            if origin in r["stops_sequence"] and dest in r["stops_sequence"]
        ]
        print(f"\nJourney: {origin} -> {dest}")
        print(f"  Matched routes: {direct} (Expected: {expected_routes})")
        assert set(direct) == set(expected_routes), f"Mismatch for {origin} -> {dest}"

        # If direct routes exist, test ETA for each
        for r_no in direct:
            eta_res = client.post("/api/estimate-eta", json={
                "origin_stop": origin,
                "destination_stop": dest,
                "route": r_no
            })
            assert eta_res.status_code == 200, f"ETA failed for {r_no}: {eta_res.text}"
            data = eta_res.json()
            print(f"  Route {r_no} ETA:")
            print(f"    Journey duration: {data['journey_duration_mins']} mins")
            print(f"    Next bus in: {data['next_bus_eta_mins']} mins")
            print(f"    Arrival: {data['estimated_arrival_time']}")
            print(f"    Overall crowd: {data['predicted_crowd_level']}")
            print(f"    Upcoming departures count: {len(data['upcoming_departures'])}")
            for dep in data["upcoming_departures"][:2]:
                print(f"      - {dep['departure_time']} (Leaves in {dep['eta_mins_to_origin']}m) -> Arrives {dep['estimated_destination_arrival']} | Crowd: {dep['predicted_crowd']}")

    print("\nALL JOURNEY SCENARIOS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    test_scenarios()
