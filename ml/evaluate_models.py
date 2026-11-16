import os
import json
import time
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
TEST_CSV = os.path.join(BASE_DIR, "datasets", "testing_data.csv")
OUT_CSV = os.path.join(BASE_DIR, "model_comparison_results.csv")
OUT_JSON = os.path.join(BASE_DIR, "model_comparison_results.json")

FEATURES = ["route", "bus_stop", "day_of_week", "hour", "is_weekend"]
TARGET = "crowd_level"
CLASS_LABELS = ["Low", "Medium", "High"]

MODEL_FILES = {
    "Gradient Boosting": "gradient_boosting.joblib",
    "Random Forest": "random_forest.joblib",
    "Decision Tree": "decision_tree.joblib",
    "XGBoost": "xgboost.joblib",
    "SVM": "svm.joblib",
    "KNN": "knn.joblib",
    "Logistic Regression": "logistic_regression.joblib",
}

XGB_INV_MAP = {0: "Low", 1: "Medium", 2: "High"}

def evaluate_all():
    print(f"Loading test data from {TEST_CSV}...")
    df_test = pd.read_csv(TEST_CSV)
    X_test = df_test[FEATURES]
    y_test = df_test[TARGET]

    results = []

    for name, filename in MODEL_FILES.items():
        filepath = os.path.join(MODELS_DIR, filename)
        if not os.path.exists(filepath):
            print(f"Warning: {filename} not found, skipping {name}")
            continue

        print(f"Evaluating {name}...")
        start_time = time.time()
        model = joblib.load(filepath)
        load_time = time.time() - start_time

        infer_start = time.time()
        raw_preds = model.predict(X_test)
        infer_duration = time.time() - infer_start

        if name == "XGBoost":
            # Map numeric preds back to text labels if necessary
            if isinstance(raw_preds[0], (int, np.integer)):
                y_pred = [XGB_INV_MAP.get(int(p), str(p)) for p in raw_preds]
            else:
                y_pred = raw_preds
        else:
            y_pred = raw_preds

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, labels=CLASS_LABELS, average="macro", zero_division=0)
        rec = recall_score(y_test, y_pred, labels=CLASS_LABELS, average="macro", zero_division=0)
        f1 = f1_score(y_test, y_pred, labels=CLASS_LABELS, average="macro", zero_division=0)
        cm = confusion_matrix(y_test, y_pred, labels=CLASS_LABELS)

        per_sample_latency_ms = (infer_duration / len(X_test)) * 1000.0

        results.append({
            "model_name": name,
            "accuracy": round(float(acc) * 100, 2),
            "macro_precision": round(float(prec) * 100, 2),
            "macro_recall": round(float(rec) * 100, 2),
            "macro_f1": round(float(f1) * 100, 2),
            "accuracy_raw": float(acc),
            "macro_f1_raw": float(f1),
            "confusion_matrix": cm.tolist(),
            "class_labels": CLASS_LABELS,
            "latency_ms": round(per_sample_latency_ms, 3),
            "is_best": False
        })

    # Sort by macro F1 descending
    results.sort(key=lambda x: x["macro_f1"], reverse=True)
    if results:
        results[0]["is_best"] = True

    # Save to CSV
    csv_rows = []
    for r in results:
        csv_rows.append({
            "Model": r["model_name"],
            "Accuracy (%)": r["accuracy"],
            "Macro Precision (%)": r["macro_precision"],
            "Macro Recall (%)": r["macro_recall"],
            "Macro F1 (%)": r["macro_f1"],
            "Latency per sample (ms)": r["latency_ms"],
            "Selected Best": "YES" if r["is_best"] else "NO"
        })
    df_out = pd.DataFrame(csv_rows)
    df_out.to_csv(OUT_CSV, index=False)
    print(f"Saved results to {OUT_CSV}")

    # Save full JSON (including confusion matrix)
    with open(OUT_JSON, "w") as f:
        json.dump(results, f, indent=2)
    print(f"Saved JSON results to {OUT_JSON}")

    print("\n--- Model Benchmark Summary ---")
    print(df_out.to_string(index=False))

if __name__ == "__main__":
    evaluate_all()
