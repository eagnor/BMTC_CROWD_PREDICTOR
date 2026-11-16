# System Architecture: AI-Based BMTC Crowd Predictor

## 1. System Overview
The **BMTC Crowd Predictor** is a modern, decoupled full-stack transportation intelligence platform designed for students commuting to and from Manyata Tech Park and surrounding North Bangalore areas (Hebbal, Veerannapalya, Nagawara, Thanisandra, RK Hegde Nagar, Jakkur, Yelahanka).

The application pairs an interactive React frontend with an asynchronous Python FastAPI backend, supported by a Scikit-Learn machine learning pipeline.

---

## 2. Architectural Layers

```
+-----------------------------------------------------------------------------------+
|                                  USER / CLIENT                                    |
|                       (Desktop & Mobile Web Browsers)                             |
+-----------------------------------------------------------------------------------+
                                          |
                                    HTTP / JSON
                                          v
+-----------------------------------------------------------------------------------+
|                           FRONTEND LAYER (React + Vite)                           |
|  - Dashboard: Real-time commuter statistics, quick route search, arrival tracker  |
|  - Route Planner: Origin-to-destination search, duration, intermediate timeline   |
|  - Crowd Predictor: Multi-model crowd inference (Low, Medium, High)               |
|  - Bus ETA & Timetable: Scheduled headways, arrival counts, transparent disclosure|
|  - Interactive Corridor Map: Leaflet / OpenStreetMap with verified GPS markers    |
|  - ML Benchmark: 7 algorithm metrics (Acc, Prec, Rec, Macro F1), Confusion Matrix |
|  - Project Documentation: System design, data disclosures & viva prep guide       |
+-----------------------------------------------------------------------------------+
                                          |
                                 RESTful API Endpoints
                                          v
+-----------------------------------------------------------------------------------+
|                           BACKEND LAYER (FastAPI)                                 |
|  - Routes Router (/api/routes, /api/stops, /api/timetable, /api/model-info)       |
|  - Prediction Router (/api/predict-crowd)                                         |
|  - ETA Router (/api/estimate-eta)                                                 |
|  - Recommendation Router (/api/recommend-bus)                                     |
|  - CORS Middleware & Pydantic Validation                                          |
+-----------------------------------------------------------------------------------+
                                          |
                     +--------------------+--------------------+
                     |                                         |
                     v                                         v
+-----------------------------------------+   +-------------------------------------+
|         SERVICE LOGIC ENGINES           |   |       MACHINE LEARNING PIPELINE     |
|  - PredictionService: Feature prep,     |   |  - Scikit-Learn Pipeline            |
|    inference, natural language reasoning|   |  - OneHotEncoder (handle_unknown)   |
|  - ETAService: Headway interval model,  |   |  - ColumnTransformer                |
|    traffic multipliers, stop dwell time |   |  - Gradient Boosting Classifier     |
|  - RecommendationService: Multi-criteria|   |    (Macro F1: 73.08% on Holdout)    |
|    scoring, crowd penalty, speed rank   |   |  - Models: RF, DT, XGBoost, KNN,    |
+-----------------------------------------+   |    SVM, Logistic Regression         |
                                              +-------------------------------------+
                                                               |
                                              +-------------------------------------+
                                              |           DATA STORAGE              |
                                              |  - manyata_synthetic_bmtc_dataset   |
                                              |  - testing_data.csv (2,000 rows)    |
                                              |  - training_data.csv (8,000 rows)   |
                                              |  - metadata.json & model joblibs    |
                                              +-------------------------------------+
```

---

## 3. Data Flow

1. **Crowd Prediction Flow:**
   - User specifies `route`, `bus_stop`, `day_of_week`, `hour`, and optional `model_name`.
   - Frontend invokes `POST /api/predict-crowd`.
   - FastAPI parses inputs with Pydantic (`CrowdPredictionRequest`).
   - `PredictionService` prepares input DataFrame matching the exact 5 pre-trip training features.
   - The selected pre-trained model runs inference and extracts class probabilities.
   - Service identifies if an alternative route serving the stop has lower congestion.
   - Formats response with prediction, probabilities, explanation, timestamp, and disclosure.

2. **Route Recommendation Flow:**
   - User inputs boarding stop and destination.
   - `POST /api/recommend-bus` identifies all corridor routes serving the pair.
   - Evaluates each option's predicted crowd level, headway wait time, and travel duration.
   - Ranks options using multi-factor utility scoring (penalizing High rush and long travel times).
   - Recommends the optimal choice with detailed reasoning.

3. **Bus Arrival (ETA) Flow:**
   - `POST /api/estimate-eta` evaluates the published timetable frequency (headway) for the selected route.
   - Calculates time until next scheduled bus and journey duration using road distance and peak-hour traffic multipliers.
   - Generates the next 4 scheduled departure slots.
   - Explicitly discloses that ETAs reflect scheduled frequency headway and not live unverified GPS.

---

## 4. Key Security & Design Principles
- **Separation of Concerns:** Independent frontend and backend deployment capability.
- **Zero Data Leakage:** Prediction features strictly restricted to pre-trip information.
- **Academic Transparency:** Explicit disclosure of synthetic data and scheduled frequency ETA calculations.
