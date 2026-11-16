# BMTC Crowd Predictor: Comprehensive Viva Voce Preparation Guide

## Project Title
**AI-Based BMTC Crowd Predictor & Commute Recommendation System for Students**

---

## 1. Executive Summary & Problem Context
- **Target Audience:** College students, interns, and young professionals commuting to educational institutions and corporate campuses around **Manyata Embassy Business Park** (Hebbal, Nagawara, Thanisandra, Veerannapalya corridors in North Bangalore).
- **Core Challenge:** Extreme peak-hour overcrowding, bunching, unpredictable bus arrival headways, and seat unavailability on BMTC services.
- **Solution:** A full-stack web application powered by machine learning that forecasts bus crowd levels (Low, Medium, High), estimates scheduled arrival headways, compares travel options, and provides transparent model benchmark insights.

---

## 2. Dataset Overview & Academic Disclosure
- **Dataset File:** `ml/datasets/manyata_synthetic_bmtc_crowd_dataset.csv`
- **Total Records:** 10,000 simulated commuter records
- **Class Labels & Distribution:**
  - `Medium` Crowd: 4,036 instances (40.36%)
  - `Low` Crowd: 3,668 instances (36.68%)
  - `High` Crowd: 2,296 instances (22.96%)
- **Academic Transparency Notice:** The dataset is synthetic, designed to simulate BMTC Manyata corridor loading patterns. It must be explicitly disclosed during demonstration that the model was evaluated on synthetic holdout data and not on validated live electronic ticket machine (ETM) feeds.

---

## 3. Anti-Data Leakage Protocol (Crucial Viva Point)
Examiners frequently probe candidate projects on data leakage:
- **What is Data Leakage?** When information from outside the training dataset (or features that could only be known during/after the prediction event) is mistakenly fed into the model.
- **Leakage Columns Excluded in our Project:**
  1. `simulated_passengers_onboard`: Target crowd level was categorized based on passenger count. Training on it would allow the model to cheat, yielding a misleading 99%+ accuracy.
  2. `simulated_occupancy_percent`: A mathematical transformation of passenger load.
  3. `bus_capacity_assumed`: Used solely to compute occupancy; not a passenger pre-trip variable.
  4. `destination_area`: Static string ("Manyata Tech Park") carrying zero variance or predictive information.
- **Allowed Pre-Trip Features (Known Before Boarding):**
  1. `route` (Categorical): e.g. 500-D, 290-E, 290-B
  2. `bus_stop` (Categorical): e.g. Hebbal, Veerannapalya, Nagawara
  3. `day_of_week` (Categorical): Monday through Sunday
  4. `hour` (Numerical): 0 to 23
  5. `is_weekend` (Binary): 0 or 1

---

## 4. Machine Learning Pipeline Architecture
- **Train/Test Split:** Stratified 80/20 split (8,000 train records, 2,000 holdout test records) preserving class proportions (`Low: 734`, `Medium: 807`, `High: 459`).
- **Feature Transformers:** Encapsulated inside `sklearn.compose.ColumnTransformer`:
  - `OneHotEncoder(handle_unknown='ignore')` applied to categorical features.
  - `StandardScaler()` applied to numeric features for distance/linear algorithms (KNN, SVM, Logistic Regression). Tree-based models used unscaled numbers.
- **Pipeline Integrity:** The preprocessor was fitted strictly on training data (`X_train`), preventing test data snooping.

---

## 5. Model Evaluation & Benchmark Summary
Evaluated on the exact 2,000 holdout test records:

| Model | Accuracy | Macro Precision | Macro Recall | Macro F1 | Latency / Sample |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Gradient Boosting** | **71.80%** | **73.47%** | **72.73%** | **73.08%** | **0.009 ms** |
| **Decision Tree** | 70.90% | 72.56% | 72.04% | 72.28% | 0.002 ms |
| **XGBoost** | 70.00% | 71.51% | 71.25% | 71.35% | 0.004 ms |
| **Random Forest** | 65.60% | 67.34% | 67.08% | 67.20% | 0.018 ms |
| **KNN** | 65.20% | 66.25% | 67.06% | 66.57% | 0.098 ms |
| **SVM (RBF)** | 50.75% | 53.10% | 47.38% | 48.04% | 0.144 ms |
| **Logistic Regression**| 42.15% | 40.33% | 37.41% | 35.91% | 0.001 ms |

### Why Macro F1 over Accuracy?
Accuracy treats all samples equally. In an imbalanced dataset, a model that simply predicts majority classes could report 60% accuracy while failing on the rarest class (`High` crowd: 22.9%). Macro F1 treats all three classes with equal weight, ensuring the model is punished if it fails to warn students about high rush.

---

## 6. Bus Arrival (ETA) & Recommendation Engineering
1. **ETA Computation:** Uses BMTC published frequency headways (8-10 min peak, 15-20 min off-peak) combined with haversine road distance and a peak-hour traffic multiplier (1.45x morning rush, 1.55x evening rush).
2. **Recommendation Utility Function:**
   $$\text{Score} = 100 + \text{Crowd Bonus/Penalty} - (0.8 \times \text{Total Commute Minutes})$$
   Where:
   - Low crowd: $+30$ points
   - Medium crowd: $+5$ points
   - High crowd: $-30$ points

---

## 7. Top 10 Frequently Asked Viva Questions & Model Answers

### Q1: Why did you choose Gradient Boosting as your production model?
**Answer:** Gradient Boosting achieved the highest Macro F1 score (73.08%) on the test set. Unlike single decision trees or linear models, gradient boosting constructs an ensemble of shallow trees sequentially, where each new tree minimizes the pseudo-residuals of the existing ensemble. It effectively isolates high-rush boundary conditions at specific bottleneck stops during morning college hours.

### Q2: Why is Logistic Regression performing poorly (~35.9% Macro F1)?
**Answer:** Commute rush is highly non-linear. An hour feature (e.g. 9:00 AM) indicates high rush on a Monday but low crowd on a Sunday. Linear models draw linear hyperplanes in feature space and cannot model this complex feature interaction without heavy polynomial feature engineering.

### Q3: What is the purpose of `handle_unknown='ignore'` in OneHotEncoder?
**Answer:** In production inference, if an unexpected category or casing appears, `handle_unknown='ignore'` ensures the encoder outputs all zeros for that categorical feature rather than crashing with a `ValueError`.

### Q4: Why is there an `is_weekend` feature when `day_of_week` is already present?
**Answer:** While `is_weekend` is derived from `day_of_week`, explicitly providing it allows shallow decision trees to split immediately on weekend vs weekday operational timetables without needing separate branches for Saturday and Sunday.

### Q5: Can this system be deployed for real-world BMTC usage?
**Answer:** Yes. The backend API is decoupled and container-ready. To transition to real-world deployment, the synthetic training set can be replaced with historical BMTC Electronic Ticketing Machine (ETM) logs, and the ETA engine can integrate GTFS-Realtime vehicle location feeds.
