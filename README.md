

**Tech Stack:** FastAPI (Python), pmdarima (SARIMA), Prophet, XGBoost, PyTorch (LSTM), Next.js (UI), Joblib (artifacts)

---



## Project Name
**ForecastIQ**





## Problem

Forecast the next 8 weeks of sales for each US state from historical weekly sales data.

## Solution

ForecastIQ is an end-to-end forecasting service that:

- Ingests an Excel dataset of sales by State and Date
- Fixes missing weeks and missing values
- Creates time-series features for ML/DL models
- Trains four forecasting algorithms for each state
- Compares models using a time-aware validation strategy
- Automatically selects the best model per state using MAPE
- Serves 8-week predictions via a REST API consumed by the UI

## Key Result

Best model is automatically selected per state using MAPE across four algorithms:

- SARIMA
- Prophet
- XGBoost
- LSTM

---

# System Architecture

```text
Excel Dataset
      ↓
Preprocessing
      ↓
Feature Engineering
      ↓
Train Models per State
      ↓
Validation & Selection
      ↓
Artifacts Storage
      ↓
FastAPI Service
      ↓
Next.js UI
