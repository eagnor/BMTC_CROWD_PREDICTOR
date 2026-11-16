"""
AI-Based BMTC Crowd Predictor for Students  -  TRAINING SCRIPT
================================================================
IMPORTANT: The dataset is SYNTHETIC (made up by a simulation).
It is NOT real BMTC passenger data. Never present it as real data.

What this script does (and what it does NOT do):
  * Splits the 10,000 rows into 8,000 (train) and 2,000 (test).
  * Trains 7 models on the 8,000 training rows ONLY.
  * Saves the models + the two CSV files + metadata + summary.
  * It NEVER evaluates anything on the 2,000 test rows (no accuracy here!).
    Testing happens later, independently.

Run it with:   python train_models.py
"""

import hashlib
import json
import os
import platform
import time
from datetime import datetime

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

# XGBoost is optional. If it is missing we skip it and tell the user how to install it.
try:
    from xgboost import XGBClassifier
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

# ----------------------------------------------------------------------------
# 1. SETTINGS (everything in one place so it is easy to read)
# ----------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_CSV = os.path.join(BASE_DIR, "data", "manyata_synthetic_bmtc_crowd_dataset.csv")
TRAIN_CSV = os.path.join(BASE_DIR, "training_data.csv")
TEST_CSV = os.path.join(BASE_DIR, "testing_data.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
METADATA_JSON = os.path.join(BASE_DIR, "metadata.json")
SUMMARY_TXT = os.path.join(BASE_DIR, "training_summary.txt")

RANDOM_SEED = 42
TARGET = "crowd_level"
CLASS_LABELS = ["Low", "Medium", "High"]

# Features known BEFORE the bus arrives (no leakage):
CATEGORICAL_FEATURES = ["route", "bus_stop", "day_of_week"]
NUMERIC_FEATURES = ["hour", "is_weekend"]
FEATURES = CATEGORICAL_FEATURES + NUMERIC_FEATURES

# Columns that must NEVER be used as inputs (crowd_level is calculated from them):
EXCLUDED_COLUMNS = [
    "simulated_passengers_onboard",   # leakage: target is derived from this
    "simulated_occupancy_percent",    # leakage: target is derived from this
    "bus_capacity_assumed",           # only used to compute occupancy -> not a prediction input
    "destination_area",               # same value in every row (Manyata Tech Park) -> no information
]

# XGBoost only understands numbers as class labels, so ONLY the XGBoost model
# is trained on these numbers. Decode its predictions with this mapping.
XGB_LABEL_MAP = {"Low": 0, "Medium": 1, "High": 2}


# ----------------------------------------------------------------------------
# 2. HELPERS
# ----------------------------------------------------------------------------
def make_preprocessor(scale_numbers):
    """
    Build the 'data preparation' step.
      * One-Hot Encoding turns text (route, bus_stop, day_of_week) into 0/1 columns.
      * StandardScaler puts 'hour' on a similar scale (needed by LogReg, KNN, SVM).
        Tree-based models don't need scaling, so we leave numbers alone for them.
    This object is placed INSIDE the pipeline, so it is fitted on training data only.
    """
    numeric_step = StandardScaler() if scale_numbers else "passthrough"
    return ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
            ("numeric", numeric_step, NUMERIC_FEATURES),
        ]
    )


def build_models():
    """Return {model_name: (pipeline, needs_numeric_labels, hyperparameter_text)}."""
    models = {
        "Logistic Regression": (
            Pipeline([("prep", make_preprocessor(True)),
                      ("model", LogisticRegression(max_iter=1000, random_state=RANDOM_SEED))]),
            False, "max_iter=1000"),
        "Decision Tree": (
            Pipeline([("prep", make_preprocessor(False)),
                      ("model", DecisionTreeClassifier(max_depth=10, random_state=RANDOM_SEED))]),
            False, "max_depth=10"),
        "Random Forest": (
            Pipeline([("prep", make_preprocessor(False)),
                      ("model", RandomForestClassifier(n_estimators=200, random_state=RANDOM_SEED, n_jobs=-1))]),
            False, "n_estimators=200"),
        "KNN": (
            Pipeline([("prep", make_preprocessor(True)),
                      ("model", KNeighborsClassifier(n_neighbors=5))]),
            False, "n_neighbors=5"),
        "SVM": (
            Pipeline([("prep", make_preprocessor(True)),
                      ("model", SVC(kernel="rbf", C=1.0, gamma="scale", random_state=RANDOM_SEED))]),
            False, "kernel=rbf, C=1.0, gamma=scale"),
        "Gradient Boosting": (
            Pipeline([("prep", make_preprocessor(False)),
                      ("model", GradientBoostingClassifier(n_estimators=100, learning_rate=0.1,
                                                           random_state=RANDOM_SEED))]),
            False, "n_estimators=100, learning_rate=0.1"),
    }
    if XGBOOST_AVAILABLE:
        models["XGBoost"] = (
            Pipeline([("prep", make_preprocessor(False)),
                      ("model", XGBClassifier(n_estimators=200, learning_rate=0.1, max_depth=6,
                                              eval_metric="mlogloss", random_state=RANDOM_SEED,
                                              n_jobs=-1))]),
            True, "n_estimators=200, learning_rate=0.1, max_depth=6")
    return models


def sha256_of_file(path):
    """A 'fingerprint' of a file. If even one character changes, the fingerprint changes."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        h.update(f.read())
    return h.hexdigest()


# ----------------------------------------------------------------------------
# 3. MAIN
# ----------------------------------------------------------------------------
def main():
    os.makedirs(MODELS_DIR, exist_ok=True)

    # ---- Step 1: Load and inspect the data ----------------------------------
    df = pd.read_csv(RAW_CSV)
    print("=" * 60)
    print("STEP 1: INSPECTING THE DATASET (synthetic data!)")
    print("=" * 60)
    print(f"Total records : {len(df)}")
    print(f"Columns       : {list(df.columns)}")
    missing = int(df.isna().sum().sum())
    duplicates = int(df.duplicated().sum())
    print(f"Missing values: {missing}")
    print(f"Exact duplicate rows: {duplicates}")
    class_counts = df[TARGET].value_counts().reindex(CLASS_LABELS)
    class_pct = (class_counts / len(df) * 100).round(2)
    print("Class distribution (whole dataset):")
    for label in CLASS_LABELS:
        print(f"   {label:<7}: {class_counts[label]} ({class_pct[label]}%)")
    assert len(df) == 10000, "Expected exactly 10,000 records"
    assert missing == 0, "Dataset has missing values - please handle them first"
    print(f"Categorical features: {CATEGORICAL_FEATURES}")
    print(f"Numerical features  : {NUMERIC_FEATURES}")
    print(f"Excluded (leakage / useless): {EXCLUDED_COLUMNS}")

    # ---- Step 2: Split 80% / 20% BEFORE doing anything else -------------------
    print("\n" + "=" * 60)
    print("STEP 2: SPLITTING DATA (8,000 train / 2,000 test)")
    print("=" * 60)
    X = df[FEATURES]
    y = df[TARGET]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_SEED, stratify=y
    )
    assert len(X_train) == 8000 and len(X_test) == 2000
    assert set(X_train.index).isdisjoint(set(X_test.index)), "Train/test overlap!"
    assert TARGET not in FEATURES
    print(f"Training records: {len(X_train)}")
    print(f"Testing records : {len(X_test)}")

    # Save the FULL original rows (all original columns, unchanged) for each side.
    df.loc[X_train.index].to_csv(TRAIN_CSV, index=False)
    df.loc[X_test.index].to_csv(TEST_CSV, index=False)
    test_fingerprint = sha256_of_file(TEST_CSV)
    print(f"Saved: training_data.csv and testing_data.csv")
    print(f"Test file fingerprint (SHA-256): {test_fingerprint}")

    train_counts = y_train.value_counts().reindex(CLASS_LABELS)
    test_counts = y_test.value_counts().reindex(CLASS_LABELS)

    # ---- Step 3: Train every model on the 8,000 TRAINING rows only ---------------
    print("\n" + "=" * 60)
    print("STEP 3: TRAINING MODELS (training rows only)")
    print("=" * 60)
    if not XGBOOST_AVAILABLE:
        print("NOTE: XGBoost is not installed -> skipping it.")
        print("      Install it with:  pip install xgboost   and run this script again.")

    models = build_models()
    training_times = {}
    model_files = {}
    hyperparams = {}
    y_train_numeric = y_train.map(XGB_LABEL_MAP)

    for name, (pipeline, needs_numeric_labels, params) in models.items():
        print(f"\nTraining {name} ...")
        start = time.perf_counter()
        pipeline.fit(X_train, y_train_numeric if needs_numeric_labels else y_train)
        seconds = time.perf_counter() - start
        training_times[name] = round(seconds, 4)
        hyperparams[name] = params

        filename = name.lower().replace(" ", "_") + ".joblib"
        joblib.dump(pipeline, os.path.join(MODELS_DIR, filename))
        model_files[name] = f"models/{filename}"
        print(f"  Training complete: {name} | time = {seconds:.3f} seconds | saved -> models/{filename}")

    # ---- Step 4: Check every saved model can be loaded again -------------------
    # We only check that LOADING works (not accuracy, and we use NO test labels).
    print("\n" + "=" * 60)
    print("STEP 4: CHECKING THAT SAVED MODELS CAN BE LOADED")
    print("=" * 60)
    one_row = X_train.iloc[:1]   # a TRAINING row, just to confirm predict() runs
    for name, path in model_files.items():
        loaded = joblib.load(os.path.join(BASE_DIR, path))
        _ = loaded.predict(one_row)
        print(f"  OK: {name} loads and can predict")

    assert sha256_of_file(TEST_CSV) == test_fingerprint, "testing_data.csv changed!"

    # ---- Step 5: Write metadata.json -----------------------------------------
    metadata = {
        "project": "AI-Based BMTC Crowd Predictor for Students",
        "data_warning": "SYNTHETIC dataset. This is NOT real BMTC passenger data.",
        "created_at": datetime.now().isoformat(timespec="seconds"),
        "source_file": "data/manyata_synthetic_bmtc_crowd_dataset.csv",
        "total_records": int(len(df)),
        "target_variable": TARGET,
        "class_labels": CLASS_LABELS,
        "feature_names": FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "numerical_features": NUMERIC_FEATURES,
        "excluded_columns": EXCLUDED_COLUMNS,
        "excluded_reason": {
            "simulated_passengers_onboard": "crowd_level is derived from it (data leakage)",
            "simulated_occupancy_percent": "crowd_level is derived from it (data leakage)",
            "bus_capacity_assumed": "only used to calculate occupancy; not a pre-trip input",
            "destination_area": "constant value in every row, carries no information",
        },
        "random_seed": RANDOM_SEED,
        "train_test_split": {
            "function": "train_test_split(test_size=0.20, random_state=42, stratify=y)",
            "train_records": int(len(X_train)),
            "test_records": int(len(X_test)),
            "stratified_by": TARGET,
            "train_class_counts": {k: int(v) for k, v in train_counts.items()},
            "test_class_counts": {k: int(v) for k, v in test_counts.items()},
            "train_file": "training_data.csv",
            "test_file": "testing_data.csv",
            "test_file_sha256": test_fingerprint,
            "test_data_used_for_training_or_tuning": False,
        },
        "preprocessing": {
            "categorical_encoding": "OneHotEncoder(handle_unknown='ignore') on route, bus_stop, day_of_week",
            "scaling": "StandardScaler on hour and is_weekend for Logistic Regression, KNN, SVM only; "
                       "other models use unscaled numbers",
            "implementation": "sklearn Pipeline + ColumnTransformer saved INSIDE each model file; "
                              "fitted on the 8,000 training records only",
            "how_to_predict": "Give the loaded model a DataFrame with the 5 feature columns "
                              "(raw text values, no manual encoding): model.predict(df[feature_names])",
        },
        "models": {
            name: {
                "file": model_files[name],
                "hyperparameters": hyperparams[name],
                "training_time_seconds": training_times[name],
                "predicts_labels_as": "numbers (0=Low, 1=Medium, 2=High)" if name == "XGBoost"
                                      else "text (Low / Medium / High)",
            }
            for name in model_files
        },
        "xgboost_label_mapping": XGB_LABEL_MAP if XGBOOST_AVAILABLE else None,
        "xgboost_included": XGBOOST_AVAILABLE,
        "library_versions": get_versions(),
    }
    with open(METADATA_JSON, "w") as f:
        json.dump(metadata, f, indent=2)

    # ---- Step 6: Write training_summary.txt ------------------------------------
    lines = []
    lines.append("TRAINING SUMMARY - AI-Based BMTC Crowd Predictor for Students")
    lines.append("NOTE: Dataset is SYNTHETIC. It is NOT real BMTC passenger data.")
    lines.append("=" * 64)
    lines.append(f"Created at              : {metadata['created_at']}")
    lines.append(f"Total records           : {len(df)}")
    lines.append(f"Training records        : {len(X_train)}")
    lines.append(f"Testing records         : {len(X_test)}")
    lines.append(f"Missing values          : {missing}")
    lines.append(f"Exact duplicate rows    : {duplicates} (kept, to preserve exactly 10,000 records)")
    lines.append("")
    lines.append("Class distribution (whole dataset / train / test):")
    for label in CLASS_LABELS:
        lines.append(f"  {label:<7}: {class_counts[label]:>5} ({class_pct[label]}%)  |  "
                     f"train {train_counts[label]:>5}  |  test {test_counts[label]:>5}")
    lines.append("")
    lines.append(f"Input features used     : {FEATURES}")
    lines.append(f"Target                  : {TARGET}")
    lines.append(f"Excluded (leakage)      : {EXCLUDED_COLUMNS}")
    lines.append("")
    lines.append("Training time per model:")
    for name, secs in training_times.items():
        lines.append(f"  {name:<20}: {secs:.3f} seconds   ({hyperparams[name]})")
    if not XGBOOST_AVAILABLE:
        lines.append("  XGBoost             : SKIPPED (not installed; run 'pip install xgboost')")
    lines.append("")
    lines.append("CONFIRMATIONS")
    lines.append("  [x] All models were trained ONLY on the 8,000 training records.")
    lines.append("  [x] The 2,000 testing records were NOT used for training, fitting, tuning or evaluation.")
    lines.append("  [x] Preprocessing (encoder/scaler) was fitted ONLY on the training records.")
    lines.append("  [x] No accuracy or other performance score was calculated in this script.")
    lines.append("  [x] No row appears in both training and testing sets (checked by row index).")
    lines.append(f"  [x] testing_data.csv SHA-256: {test_fingerprint}")
    lines.append("      (Re-compute it later; if it matches, the file is untouched.)")
    with open(SUMMARY_TXT, "w") as f:
        f.write("\n".join(lines) + "\n")

    print("\n" + "=" * 60)
    print("ALL DONE! Training finished. Test data was never used.")
    print("=" * 60)


def get_versions():
    import sklearn
    v = {"python": platform.python_version(), "scikit-learn": sklearn.__version__,
         "pandas": pd.__version__, "joblib": joblib.__version__}
    if XGBOOST_AVAILABLE:
        import xgboost
        v["xgboost"] = xgboost.__version__
    return v


if __name__ == "__main__":
    main()
