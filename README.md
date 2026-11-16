# AI-Based BMTC Crowd Predictor for Students

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4+-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

A modern, full-stack transportation intelligence platform designed for college students and commuters travelling to and from **Manyata Tech Park** and surrounding North Bangalore areas using Bangalore Metropolitan Transport Corporation (BMTC) buses.

---

## Key Features

1. **AI-Driven Crowd Prediction:**
   - Multi-class classification (`LOW CROWD`, `MEDIUM CROWD`, `HIGH CROWD`)
   - Class confidence scores and probability distribution
   - Contextual natural language explanations tailored for college students
   - Automatic less-crowded alternative suggestions
2. **Intelligent Route Planner:**
   - Origin and Destination stop selection with intermediate stop timelines
   - Travel duration and arrival estimates
   - Multi-option route ranking (Speed vs. Comfort/Crowd)
3. **Scheduled Bus Arrival (ETA):**
   - BMTC scheduled headway frequencies (8-15 min peak, 15-25 min off-peak)
   - Transparent disclosure of scheduled headway estimates vs. live GPS
4. **Interactive Corridor Map:**
   - Interactive Leaflet / OpenStreetMap centered on Manyata Tech Park
   - Real geographic coordinates for all corridor transit hubs
   - Color-coded route polylines and clickable stop details
5. **Empirical Model Benchmarking:**
   - Comprehensive benchmark across 7 ML algorithms: Gradient Boosting, Decision Tree, XGBoost, Random Forest, KNN, SVM, Logistic Regression
   - Interactive 3x3 Confusion Matrix viewer for all evaluated models
   - Verification of zero data leakage protocols
6. **Student Viva Voce Preparation Guide:**
   - Complete technical questions & model answers for college project examinations

---

## Machine Learning Benchmark (Holdout Test Set)

Evaluated strictly on **2,000 holdout testing records** (80/20 stratified split, random_state=42):

| Algorithm | Test Accuracy | Macro Precision | Macro Recall | Macro F1 | Latency / Sample | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Gradient Boosting** | **71.80%** | **73.47%** | **72.73%** | **73.08%** | **0.009 ms** | **Best Model** |
| Decision Tree | 70.90% | 72.56% | 72.04% | 72.28% | 0.002 ms | Evaluated |
| XGBoost | 70.00% | 71.51% | 71.25% | 71.35% | 0.004 ms | Evaluated |
| Random Forest | 65.60% | 67.34% | 67.08% | 67.20% | 0.018 ms | Evaluated |
| KNN | 65.20% | 66.25% | 67.06% | 66.57% | 0.098 ms | Evaluated |
| SVM (RBF) | 50.75% | 53.10% | 47.38% | 48.04% | 0.144 ms | Evaluated |
| Logistic Regression | 42.15% | 40.33% | 37.41% | 35.91% | 0.001 ms | Evaluated |

---

## Project Structure

```
bmtc-crowd-predictor/
├── frontend/
│   ├── public/
│   │   ├── bus-icon.svg
│   │   └── assets/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── CrowdBadge.jsx
│   │   │   ├── RouteCard.jsx
│   │   │   ├── ETACard.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── RoutePlanner.jsx
│   │   │   ├── CrowdPrediction.jsx
│   │   │   ├── BusETA.jsx
│   │   │   ├── RouteMap.jsx
│   │   │   ├── ModelComparison.jsx
│   │   │   └── About.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routes/
│   │   │   ├── routes_api.py
│   │   │   ├── prediction_api.py
│   │   │   ├── eta_api.py
│   │   │   └── recommendation_api.py
│   │   ├── services/
│   │   │   ├── prediction_service.py
│   │   │   ├── eta_service.py
│   │   │   └── recommendation_service.py
│   │   ├── models/
│   │   │   └── schemas.py
│   │   └── utils/
│   │       ├── data_loader.py
│   │       └── helpers.py
│   ├── tests/
│   │   └── test_api.py
│   ├── requirements.txt
│   └── venv/
│
├── ml/
│   ├── datasets/
│   │   ├── manyata_synthetic_bmtc_crowd_dataset.csv
│   │   ├── training_data.csv
│   │   └── testing_data.csv
│   ├── models/
│   │   ├── gradient_boosting.joblib
│   │   ├── decision_tree.joblib
│   │   ├── random_forest.joblib
│   │   ├── xgboost.joblib
│   │   ├── svm.joblib
│   │   ├── knn.joblib
│   │   └── logistic_regression.joblib
│   ├── train_model.py
│   ├── evaluate_models.py
│   ├── metadata.json
│   ├── training_summary.txt
│   └── model_comparison_results.csv
│
├── docs/
│   ├── architecture.md
│   ├── methodology.md
│   └── viva_notes.md
│
└── README.md
```

---

## Quickstart & Setup Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Activate virtual environment (already set up in venv)
source venv/bin/activate

# Start the FastAPI server
uvicorn backend.app.main:app --reload --port 8000
```
Backend API will be running at: `http://localhost:8000`
Interactive Swagger API Documentation: `http://localhost:8000/docs`

### 3. Frontend Setup
In a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start the Vite development server
npm run dev
```
Open your browser at: `http://localhost:5173`

### 4. Running Tests
```bash
# Run backend pytest suite
cd backend
source venv/bin/activate
PYTHONPATH=.. pytest tests/test_api.py -v
```

---

## Academic & Data Disclosures
1. **Synthetic Dataset Notice:** The machine learning model results (e.g. Gradient Boosting 73.08% Macro F1) are based on a 10,000-record synthetic Manyata corridor simulation. They reflect model capability on simulated commute patterns and do not represent validated official BMTC ticketing records.
2. **ETA Methodology:** Bus arrival ETAs are estimated using published BMTC corridor headway frequencies and distance calculations adjusted for peak traffic hours. The application does not claim live unverified satellite GPS tracking.
