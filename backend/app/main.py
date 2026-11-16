import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import PROJECT_NAME, API_PREFIX, DATA_DISCLOSURE
from backend.app.utils.data_loader import DataLoader
from backend.app.routes import routes_api, prediction_api, eta_api, recommendation_api

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"Starting {PROJECT_NAME} backend...")
    loader = DataLoader.get_instance()
    print(f"Data & ML Models initialized. Loaded models: {list(loader.models.keys())}")
    yield
    print("Shutting down BMTC Crowd Predictor backend...")

app = FastAPI(
    title="BMTC Crowd Predictor API",
    description="Machine Learning Powered BMTC Bus Crowd Prediction & Route Recommendation for Manyata Tech Park Students",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(routes_api.router, prefix=API_PREFIX)
app.include_router(prediction_api.router, prefix=API_PREFIX)
app.include_router(eta_api.router, prefix=API_PREFIX)
app.include_router(recommendation_api.router, prefix=API_PREFIX)

@app.get("/")
def root():
    return {
        "message": f"Welcome to {PROJECT_NAME} API",
        "docs_url": "/docs",
        "api_endpoints": {
            "health": f"{API_PREFIX}/health",
            "routes": f"{API_PREFIX}/routes",
            "stops": f"{API_PREFIX}/stops",
            "timetable": f"{API_PREFIX}/timetable",
            "model_info": f"{API_PREFIX}/model-info",
            "predict_crowd": f"{API_PREFIX}/predict-crowd",
            "estimate_eta": f"{API_PREFIX}/estimate-eta",
            "recommend_bus": f"{API_PREFIX}/recommend-bus"
        },
        "disclaimer": DATA_DISCLOSURE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
