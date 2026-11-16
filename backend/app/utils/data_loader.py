import os
import json
import joblib
from backend.app.config import (
    METADATA_PATH,
    BENCHMARK_RESULTS_PATH,
    MODELS_DIR,
    STOPS_DATA,
    ROUTES_DATA
)

class DataLoader:
    _instance = None
    
    def __init__(self):
        self.metadata = {}
        self.benchmark_results = []
        self.models = {}
        self.best_model_name = "Gradient Boosting"
        self._load_metadata()
        self._load_benchmarks()
        self._load_models()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = DataLoader()
        return cls._instance

    def _load_metadata(self):
        if os.path.exists(METADATA_PATH):
            try:
                with open(METADATA_PATH, "r") as f:
                    self.metadata = json.load(f)
            except Exception as e:
                print(f"[DataLoader] Error loading metadata: {e}")
        else:
            print(f"[DataLoader] Warning: metadata.json not found at {METADATA_PATH}")

    def _load_benchmarks(self):
        if os.path.exists(BENCHMARK_RESULTS_PATH):
            try:
                with open(BENCHMARK_RESULTS_PATH, "r") as f:
                    self.benchmark_results = json.load(f)
                    for item in self.benchmark_results:
                        if item.get("is_best"):
                            self.best_model_name = item.get("model_name", "Gradient Boosting")
            except Exception as e:
                print(f"[DataLoader] Error loading benchmark results: {e}")
        else:
            print(f"[DataLoader] Warning: Benchmark JSON not found at {BENCHMARK_RESULTS_PATH}")

    def _load_models(self):
        model_filenames = {
            "Gradient Boosting": "gradient_boosting.joblib",
            "Random Forest": "random_forest.joblib",
            "Decision Tree": "decision_tree.joblib",
            "XGBoost": "xgboost.joblib",
            "SVM": "svm.joblib",
            "KNN": "knn.joblib",
            "Logistic Regression": "logistic_regression.joblib",
        }

        for name, filename in model_filenames.items():
            path = os.path.join(MODELS_DIR, filename)
            if os.path.exists(path):
                try:
                    self.models[name] = joblib.load(path)
                    print(f"[DataLoader] Loaded model: {name}")
                except Exception as e:
                    print(f"[DataLoader] Failed to load {name}: {e}")
            else:
                print(f"[DataLoader] Missing model file: {path}")

    def get_model(self, model_name: str = "Gradient Boosting"):
        if model_name in self.models:
            return self.models[model_name]
        if self.best_model_name in self.models:
            return self.models[self.best_model_name]
        if self.models:
            return next(iter(self.models.values()))
        raise RuntimeError("No ML models could be loaded.")

    def get_metadata(self):
        return self.metadata

    def get_benchmarks(self):
        return self.benchmark_results
