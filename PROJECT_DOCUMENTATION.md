# ForecastIQ — Production-Ready Time Series Forecasting System

**Author:** Kavya  
**Date:** 2026-05-07  
**Version:** 1.0  
**Tech stack:** FastAPI (Python) · pmdarima (SARIMA) · Prophet · XGBoost · PyTorch (LSTM) · Next.js (UI) · Joblib (artifacts)

---

## 1) Cover Page

**Project name:** ForecastIQ  
**Tagline:** Production-Ready Time Series Forecasting System (Per-State Model Selection + Forecast API)

---

## 2) Executive Summary

**Problem:** Forecast the next 8 weeks of sales for each US state from historical weekly sales data.  

**Solution (plain English):** ForecastIQ is an end-to-end forecasting service that:
- ingests an Excel dataset of sales by **State** and **Date**
- fixes missing weeks and missing values
- creates time-series features for ML/DL models
- trains **four** forecasting algorithms for **each** state
- compares models using a time-aware validation strategy
- automatically selects the best model per state using **MAPE**
- serves 8-week predictions via a REST API consumed by the UI

**Key result:** **Best model auto-selected per state using MAPE across 4 algorithms (SARIMA, Prophet, XGBoost, LSTM).**

---

## 3) System Architecture Diagram

```mermaid
flowchart LR
  A[Excel Dataset<br/>data/sales_data.xlsx] --> B[Preprocessing<br/>Weekly aggregation + reindex + imputation]
  B --> C[Feature Engineering<br/>lags + rolling + calendar + holidays]
  C --> D[Train Models per State<br/>SARIMA · Prophet · XGBoost · LSTM]
  D --> E[Validation & Selection<br/>Time split (last 8 weeks) + MAPE]
  E --> F[Artifacts<br/>artifacts/models/{state}_model.joblib<br/>leaderboard.joblib]
  F --> G[FastAPI Service<br/>/api/v1/*]
  G --> H[Next.js UI<br/>Dashboard + State Detail]
```

---

## 4) Dataset & Problem Statement

### Dataset
- **File:** `data/sales_data.xlsx`
- **Required columns:** `State`, `Date`, `Total`
- **Granularity:** weekly sales per state (ForecastIQ aggregates to weekly if the Excel contains multiple rows per week/state)

### Problem Statement
Forecast the **next 8 weeks** of sales for each state and expose predictions via API.

### Missing dates / missing values handling
Implemented in `app/data/loader.py`:
- Group to weekly frequency (`W-MON`)
- Reindex each state to a complete weekly index between min and max date
- Impute missing values:
  - linear interpolation
  - then forward fill (ffill)
  - then backward fill (bfill)

### Outlier handling
Implemented in `app/data/features.py`:
- IQR-based capping (upper/lower bounds set to \(Q3 \pm 3 \times IQR\))

---

## 5) Feature Engineering Table

Implemented in `app/data/features.py`.

| Feature | Type | Description |
|---|---|---|
| `lag_1w` | Lag | Sales 1 week ago |
| `lag_7w` | Lag | Sales 7 weeks ago |
| `lag_30w` | Lag | Sales 30 weeks ago |
| `rolling_mean_4` | Rolling | 4-week moving average (shifted) |
| `rolling_std_4` | Rolling | 4-week volatility (shifted) |
| `rolling_mean_12` | Rolling | 12-week moving average (shifted) |
| `rolling_std_12` | Rolling | 12-week volatility (shifted) |
| `week_of_year` | Calendar | Seasonal signal (ISO week) |
| `month` | Calendar | Month of year |
| `quarter` | Calendar | Quarter of year |
| `day_of_week` | Calendar | Day-of-week index (from timestamp) |
| `is_holiday` | Binary | US federal holiday flag (via `holidays.US()`) |

**No leakage guarantee:** rolling statistics are computed on `Total.shift(1)` so they only use past values.

---

## 6) Model Details (one section per model)

### 6.1 SARIMA (AutoARIMA)
- **Why:** Strong baseline for seasonal weekly data; captures trend + seasonality without feature engineering.
- **Implementation:** `app/models/sarima.py` using `pmdarima.auto_arima`.
- **Key choices:**
  - `seasonal=True`
  - `m=52` (weekly seasonality)
- **Strengths:** interpretable; generates confidence intervals.
- **Limitations:** can be slow for long series; assumes linear-ish dynamics; struggles with abrupt regime changes.

### 6.2 Prophet
- **Why:** Robust decomposition of trend + seasonality; handles holidays naturally.
- **Implementation:** `app/models/prophet_model.py`.
- **Key choices:**
  - `yearly_seasonality=True`, `weekly_seasonality=True`
  - `add_country_holidays('US')`
- **Strengths:** practical for business time series; holiday effects.
- **Limitations:** may underfit complex nonlinear interactions; interval calibration can vary.

### 6.3 XGBoost (with lag features)
- **Why:** Powerful nonlinear model; benefits heavily from engineered time-series features.
- **Implementation:** `app/models/xgboost_model.py` + features from `app/data/features.py`.
- **Key choices:**
  - `n_estimators=1000`, `learning_rate=0.05`
  - early stopping when validation is provided
  - autoregressive prediction loop (feeds predictions back as future lags)
- **Strengths:** strong accuracy with good features; fast inference.
- **Limitations:** no native prediction intervals in this setup; relies on feature quality.

### 6.4 LSTM (Deep Learning)
- **Why:** Sequence model capable of learning temporal patterns from feature sequences.
- **Implementation:** `app/models/lstm.py` (PyTorch).
- **Key choices:**
  - sequence length \(=12\)
  - `hidden_size=64`, `num_layers=2`
  - scaling with `MinMaxScaler`
  - autoregressive rollout for multi-step forecasting
- **Strengths:** can model complex temporal structure.
- **Limitations:** requires enough data; slower training; intervals not implemented.

---

## 7) Train/Validation Strategy

Implemented in `app/data/features.py` (`train_val_split`) and orchestrated in `app/models/trainer.py`.

- **Chronological split (no leakage):**
  - Train = all except the last 8 weeks
  - Validation = last 8 weeks

```
[────────────── Train ──────────────][── Validation (8 weeks) ──]
```

- **Model selection criterion:** lowest **MAPE** on validation.
- **Retraining:** after best model is chosen, it is retrained on **full state data** before being saved for serving.

---

## 8) Model Comparison & Results

### What is stored
After training, ForecastIQ writes:
- `artifacts/models/{State}_model.joblib` — selected model + context
- `artifacts/models/leaderboard.joblib` — metrics for all models per state

### How comparison is exposed
The forecast endpoint returns both:
- `metrics`: best model metrics for that state
- `all_results`: all models’ metrics for that state (SARIMA/Prophet/XGBoost/LSTM)

This enables the UI (and reviewers) to verify that each state was evaluated across the full model set.

### Example leaderboard snapshot (high level)
Use the API:
- `GET /api/v1/models/leaderboard`

This returns a dictionary like:
- `leaderboard["California"]["best_model"]`
- `leaderboard["California"]["metrics"]`
- `leaderboard["California"]["all_results"]`

---

## 9) API Documentation

Base prefix: `/api/v1`

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check |
| `/train` | POST | Trigger training (background) |
| `/models/leaderboard` | GET | All state → best model results |
| `/forecasts/{state}` | GET | 8-week forecast + metrics + model comparison |

### 9.1 `GET /health`
**Request**

```bash
curl http://127.0.0.1:8000/api/v1/health
```

**Response**

```json
{ "status": "healthy" }
```

### 9.2 `POST /train`
**Request**

```bash
curl -X POST http://127.0.0.1:8000/api/v1/train
```

**Response**

```json
{ "message": "Training job started in the background", "job_id": "job_1" }
```

### 9.3 `GET /models/leaderboard`
**Request**

```bash
curl http://127.0.0.1:8000/api/v1/models/leaderboard
```

**Response (example shape)**

```json
{
  "California": {
    "best_model": "XGBoost",
    "metrics": { "rmse": 982.0, "mae": 743.0, "mape": 5.21 },
    "all_results": {
      "SARIMA": { "rmse": 1200.0, "mae": 900.0, "mape": 7.10 },
      "Prophet": { "rmse": 1100.0, "mae": 850.0, "mape": 6.40 },
      "XGBoost": { "rmse": 982.0, "mae": 743.0, "mape": 5.21 },
      "LSTM": { "rmse": 1400.0, "mae": 1050.0, "mape": 8.00 }
    }
  }
}
```

### 9.4 `GET /forecasts/{state}`
**Note:** `{state}` currently expects the **state name** matching the artifact filenames (example: `California`, `Texas`), because trained artifacts are stored as `artifacts/models/Texas_model.joblib`.

**Request**

```bash
curl http://127.0.0.1:8000/api/v1/forecasts/California
```

**Response (example shape)**

```json
{
  "state": "California",
  "selected_model": "XGBoost",
  "metrics": { "rmse": 982.0, "mae": 743.0, "mape": 5.21 },
  "all_results": {
    "SARIMA": { "rmse": 1200.0, "mae": 900.0, "mape": 7.10 },
    "Prophet": { "rmse": 1100.0, "mae": 850.0, "mape": 6.40 },
    "XGBoost": { "rmse": 982.0, "mae": 743.0, "mape": 5.21 },
    "LSTM": { "rmse": 1400.0, "mae": 1050.0, "mape": 8.00 }
  },
  "forecast": [
    {
      "week": 1,
      "week_start": "2026-05-11",
      "point_forecast": 28120.0,
      "ci_80_lower": null,
      "ci_80_upper": null,
      "ci_95_lower": null,
      "ci_95_upper": null
    }
  ]
}
```

---

## 10) UI Walkthrough

### Dashboard (`/`)
- **State Forecast Status table:** shows per-state best model + performance metrics (MAPE/RMSE/MAE) and training status.
- **Leaderboard panel:** quick view of model performance distribution (useful for monitoring).

### State Forecast Detail (`/state-forecast-detail`)
- **State selector:** selecting a state triggers an API call to `/api/v1/forecasts/{state}`.
- **Metric cards:** MAPE/RMSE/MAE displayed for the selected state’s best model.
- **Forecast chart:** displays the 8-week forecast; CI bands show when the selected model supports intervals.
- **Model comparison:** displays metrics for all 4 models using `all_results`.
- **Raw predictions table:** week-by-week forecasts for export.

---

## 11) How to Run (Setup Guide)

### 11.1 Backend (FastAPI)

From repo root (`forecastiq/`):

```bash
pip install -r requirements.txt
python run.py
```

Backend runs at:
- `http://127.0.0.1:8000`

Sanity checks:

```bash
curl http://127.0.0.1:8000/api/v1/health
curl http://127.0.0.1:8000/api/v1/forecasts/California
```

### 11.2 Frontend (Next.js UI)

From `forecastiq/forecastiq/`:

1) Create/Update `forecastiq/.env` with:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

2) Run:

```bash
npm install
npx next dev -p 4030
```

Open:
- `http://localhost:4030`

**What you should see when it works:**
- Dashboard loads
- State detail dropdown changes the state and updates values after the API response

---

## 12) Folder Structure

```
forecastiq/
├── app/
│   ├── api/routes.py        # REST endpoints
│   ├── core/config.py       # Settings
│   ├── data/                # Loader + feature engineering
│   ├── models/              # SARIMA, Prophet, XGBoost, LSTM
│   └── utils/evaluation.py  # RMSE, MAE, MAPE
├── artifacts/models/        # Saved state models + leaderboard
└── data/sales_data.xlsx     # Excel dataset
```

Frontend:

```
forecastiq/forecastiq/
├── src/app/                 # Next.js routes (dashboard, detail, docs)
├── src/lib/forecastApi.ts   # Fetches backend forecast endpoint
└── src/app/data/statesData.ts
```

---

## 13) Design Decisions & Trade-offs

- **FastAPI vs Flask:** FastAPI provides cleaner typing, automatic docs, and modern async patterns suitable for “production-shaped” services.
- **Joblib persistence:** simple and practical for storing model objects + metadata per state.
- **MAPE for selection:** interpretable percentage error; limitation is sensitivity when actuals approach zero (mitigated by skipping zeros in MAPE calculation).
- **Autoregressive rollout for XGBoost/LSTM:** enables multi-step forecasting while using lag/rolling features, at the cost of error accumulation.

---

## 14) Known Limitations & Future Improvements

- **Prediction intervals for XGBoost/LSTM:** currently not provided; next step is quantile regression, conformal intervals, or residual-based bootstrapping.
- **Dockerization:** not included yet; can add Dockerfile + docker-compose for reproducible deployment.
- **Model monitoring:** add drift checks and automatic retraining triggers based on performance thresholds.
- **Optional ensembles:** stacking/weighted ensemble per state may improve accuracy for volatile states.

