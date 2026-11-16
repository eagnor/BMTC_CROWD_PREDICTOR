# Machine Learning Methodology: BMTC Crowd Predictor

## 1. Problem Formulation
Bus crowd level prediction is modeled as a **multi-class classification problem**:
Given a set of pre-trip spatio-temporal features, predict the target variable:
$$\text{Crowd Level} \in \{\text{Low}, \text{Medium}, \text{High}\}$$

---

## 2. Dataset Description
- **Dataset File:** `ml/datasets/manyata_synthetic_bmtc_crowd_dataset.csv`
- **Total Records:** 10,000 synthetic commuter trips
- **Corridor Area:** Manyata Embassy Business Park & Outer Ring Road (North Bangalore)
- **Target Distribution:**
  - `Medium`: 4,036 trips (40.36%)
  - `Low`: 3,668 trips (36.68%)
  - `High`: 2,296 trips (22.96%)
- **Disclosure:** The dataset is generated via simulation to mimic real BMTC passenger surges. It is not real-world ticketed transaction data.

---

## 3. Anti-Data Leakage Protocol
A critical vulnerability in transportation machine learning is the use of post-trip or concurrent sensor readings that leak target information.
In our implementation, the following columns were **strictly excluded**:
1. `simulated_passengers_onboard`: Target crowd level was derived from passenger counts. Including it introduces direct circular leakage.
2. `simulated_occupancy_percent`: Mathematically equivalent to the target threshold.
3. `bus_capacity_assumed`: Intermediate calculation variable; unknown before boarding.
4. `destination_area`: Uniform constant across all rows ("Manyata Tech Park"); zero predictive entropy.

### Permitted Feature Set (Known Before Boarding):
- `route` (Categorical): BMTC corridor route number (`500-D`, `290-E`, `290-B`)
- `bus_stop` (Categorical): Boarding transit hub (`Hebbal`, `Veerannapalya`, `Nagawara`, etc.)
- `day_of_week` (Categorical): `Monday` through `Sunday`
- `hour` (Numerical): Departure hour (0 to 23)
- `is_weekend` (Numerical Binary): 1 if Saturday or Sunday, else 0

---

## 4. Train / Test Split
To ensure realistic generalization testing:
- **Split Ratio:** 80% Training (8,000 records) and 20% Holdout Testing (2,000 records).
- **Stratification:** Stratified by `crowd_level` to preserve identical class ratios across both splits.
- **Random Seed:** Fixed seed (`random_state=42`) for full reproducibility.
- **Integrity Check:** All preprocessing transformers and scalers were fitted strictly on the 8,000 training records. The 2,000 test records were never used during feature fitting or hyperparameter tuning.

---

## 5. Preprocessing Pipeline
Implemented using Scikit-Learn `ColumnTransformer` embedded inside a `Pipeline`:
- **Categorical Step:** `OneHotEncoder(handle_unknown='ignore')` applied to `route`, `bus_stop`, `day_of_week`.
- **Numerical Step:**
  - Tree-based models (Gradient Boosting, Decision Tree, Random Forest, XGBoost): passthrough unscaled numerical values.
  - Distance & linear models (KNN, SVM, Logistic Regression): normalized via `StandardScaler()`.

---

## 6. Empirical Benchmark Results (Holdout Test Set)

| Algorithm | Test Accuracy (%) | Macro Precision (%) | Macro Recall (%) | Macro F1 (%) | Latency / Sample (ms) | Rank |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Gradient Boosting** | **71.80%** | **73.47%** | **72.73%** | **73.08%** | **0.009** | **1 (Best)** |
| **Decision Tree** | 70.90% | 72.56% | 72.04% | 72.28% | 0.002 | 2 |
| **XGBoost** | 70.00% | 71.51% | 71.25% | 71.35% | 0.004 | 3 |
| **Random Forest** | 65.60% | 67.34% | 67.08% | 67.20% | 0.018 | 4 |
| **KNN** | 65.20% | 66.25% | 67.06% | 66.57% | 0.098 | 5 |
| **SVM (RBF Kernel)** | 50.75% | 53.10% | 47.38% | 48.04% | 0.144 | 6 |
| **Logistic Regression**| 42.15% | 40.33% | 37.41% | 35.91% | 0.001 | 7 |

---

## 7. Model Selection Rationale
Gradient Boosting achieved the highest Macro F1 score (73.08%). Its iterative residual gradient descent effectively models the non-linear relationship between key peak hours (e.g. 8:00 AM - 10:00 AM on weekdays) and localized bottleneck stops (Veerannapalya and Nagawara).
