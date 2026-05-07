export interface Param {
  name: string;
  type: string;
  required: boolean;
  description: string;
  example?: string;
}

export interface EndpointDef {
  id: string;
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  category: 'Forecasts' | 'Models' | 'Data' | 'System';
  summary: string;
  description: string;
  params: Param[];
  responseSchema: string;
  curlExample: string;
  pythonExample: string;
  rateLimit: string;
  statusCodes: { code: number; meaning: string }[];
}

export const endpoints: EndpointDef[] = [
  {
    id: 'ep-get-forecast',
    method: 'GET',
    path: '/api/v1/forecasts/{state}',
    category: 'Forecasts',
    summary: 'Get forecast for a state',
    description:
      'Returns the 8-week ahead point forecast and confidence intervals for the specified US state. Uses the best-performing model selected during the last training run.',
    params: [
      { name: 'state', type: 'string', required: true, description: 'Two-letter US state code (ISO 3166-2)', example: 'CA' },
      { name: 'horizon', type: 'integer', required: false, description: 'Number of weeks to forecast (1–52)', example: '8' },
      { name: 'include_history', type: 'boolean', required: false, description: 'Include historical actuals and fitted values', example: 'true' },
      { name: 'model', type: 'string', required: false, description: 'Override model selection: xgboost | prophet | arima | lstm', example: 'xgboost' },
    ],
    responseSchema: `{
  "state": "CA",
  "model": "xgboost",
  "generated_at": "2026-05-06T10:14:22Z",
  "horizon_weeks": 8,
  "predictions": [
    {
      "week": 1,
      "week_start": "2026-05-12",
      "week_end": "2026-05-18",
      "point_forecast": 26840,
      "ci_80_lower": 25120,
      "ci_80_upper": 28560,
      "ci_95_lower": 24340,
      "ci_95_upper": 29340
    }
  ],
  "metrics": {
    "mape": 5.21,
    "rmse": 982,
    "mae": 743,
    "coverage_95": 0.948
  }
}`,
    curlExample: `curl -X GET \\
  "https://forecastiq.internal.io/api/v1/forecasts/CA?horizon=8&include_history=true" \\
  -H "Authorization: Bearer $FORECASTIQ_API_KEY"\ -H"Content-Type: application/json"`,
    pythonExample: `import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://forecastiq.internal.io/api/v1"

response = requests.get(
    f"{BASE_URL}/forecasts/CA",
    params={
        "horizon": 8,
        "include_history": True,
    },
    headers={"Authorization": f"Bearer {API_KEY}"},
)

data = response.json()
predictions = data["predictions"]
print(f"Model: {data['model']}, MAPE: {data['metrics']['mape']}%")

for pred in predictions:
    print(
        f"Week {pred['week']} ({pred['week_start']}): "
        f"{pred['point_forecast']:,} units "
        f"[{pred['ci_95_lower']:,} – {pred['ci_95_upper']:,}]"
    )`,
    rateLimit: '120 req/min',
    statusCodes: [
      { code: 200, meaning: 'Forecast returned successfully' },
      { code: 404, meaning: 'State code not found or no forecast available' },
      { code: 422, meaning: 'Invalid parameter value (e.g. horizon > 52)' },
      { code: 429, meaning: 'Rate limit exceeded — retry after 60s' },
    ],
  },
  {
    id: 'ep-batch-forecast',
    method: 'POST',
    path: '/api/v1/forecasts/batch',
    category: 'Forecasts',
    summary: 'Batch forecast for multiple states',
    description:
      'Submits a batch prediction job for multiple states in a single request. Returns a job ID that can be polled for results. Useful for pipeline integrations that need all-state forecasts.',
    params: [
      { name: 'states', type: 'string[]', required: true, description: 'Array of state codes to forecast', example: '["CA", "TX", "FL"]' },
      { name: 'horizon', type: 'integer', required: false, description: 'Forecast horizon in weeks (default: 8)', example: '8' },
      { name: 'async', type: 'boolean', required: false, description: 'If true, returns job_id immediately; if false, waits for completion', example: 'true' },
    ],
    responseSchema: `{
  "job_id": "batch-20260506-a3f9b2",
  "status": "queued",
  "states_requested": ["CA", "TX", "FL"],
  "estimated_completion_seconds": 45,
  "poll_url": "/api/v1/jobs/batch-20260506-a3f9b2",
  "created_at": "2026-05-06T14:44:00Z"
}`,
    curlExample: `curl -X POST \\
  "https://forecastiq.internal.io/api/v1/forecasts/batch" \\
  -H "Authorization: Bearer $FORECASTIQ_API_KEY"\ -H"Content-Type: application/json" \\
  -d '{
    "states": ["CA", "TX", "FL", "NY", "IL"],
    "horizon": 8,
    "async": true
  }'`,
    pythonExample: `import requests, time

API_KEY = "your_api_key_here"
BASE_URL = "https://forecastiq.internal.io/api/v1"
headers = {"Authorization": f"Bearer {API_KEY}"}

# Submit batch job
resp = requests.post(
    f"{BASE_URL}/forecasts/batch",
    json={"states": ["CA", "TX", "FL", "NY", "IL"], "horizon": 8, "async": True},
    headers=headers,
)
job = resp.json()
print(f"Job submitted: {job['job_id']}")

# Poll until complete
while True:
    status = requests.get(
        f"{BASE_URL}/jobs/{job['job_id']}", headers=headers
    ).json()
    if status["status"] == "completed":
        print(f"Batch complete — {len(status['results'])} states")
        break
    time.sleep(5)`,
    rateLimit: '10 req/min',
    statusCodes: [
      { code: 202, meaning: 'Batch job accepted and queued' },
      { code: 400, meaning: 'Malformed request body or invalid state codes' },
      { code: 429, meaning: 'Rate limit exceeded — max 10 batch jobs/min' },
    ],
  },
  {
    id: 'ep-list-states',
    method: 'GET',
    path: '/api/v1/forecasts/states',
    category: 'Forecasts',
    summary: 'List all states with forecast status',
    description:
      'Returns a paginated list of all US states with their current forecast status, best model, MAPE, last training timestamp, and data completeness score. Used by the dashboard table.',
    params: [
      { name: 'page', type: 'integer', required: false, description: 'Page number (default: 1)', example: '1' },
      { name: 'limit', type: 'integer', required: false, description: 'Results per page (max: 50)', example: '20' },
      { name: 'status', type: 'string', required: false, description: 'Filter by status: serving | stale | training', example: 'serving' },
      { name: 'sort_by', type: 'string', required: false, description: 'Sort field: mape | rmse | last_trained | state', example: 'mape' },
    ],
    responseSchema: `{
  "total": 49,
  "page": 1,
  "limit": 20,
  "states": [
    {
      "state": "CA",
      "best_model": "xgboost",
      "mape": 5.21,
      "rmse": 982,
      "mae": 743,
      "coverage_95": 0.948,
      "status": "serving",
      "last_trained": "2026-05-06T10:14:22Z",
      "data_completeness": 0.992,
      "forecast_horizon_weeks": 8
    }
  ]
}`,
    curlExample: `curl -X GET \\
  "https://forecastiq.internal.io/api/v1/forecasts/states?limit=20&sort_by=mape" \\
  -H "Authorization: Bearer $FORECASTIQ_API_KEY"`,
    pythonExample: `import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://forecastiq.internal.io/api/v1"

all_states = []
page = 1

while True:
    resp = requests.get(
        f"{BASE_URL}/forecasts/states",
        params={"page": page, "limit": 20, "sort_by": "mape"},
        headers={"Authorization": f"Bearer {API_KEY}"},
    ).json()
    all_states.extend(resp["states"])
    if len(all_states) >= resp["total"]:
        break
    page += 1

stale = [s for s in all_states if s["status"] == "stale"]
print(f"Stale states ({len(stale)}): {[s['state'] for s in stale]}")`,
    rateLimit: '120 req/min',
    statusCodes: [
      { code: 200, meaning: 'State list returned successfully' },
      { code: 400, meaning: 'Invalid sort_by or status filter value' },
    ],
  },
  {
    id: 'ep-model-status',
    method: 'GET',
    path: '/api/v1/models/{state}',
    category: 'Models',
    summary: 'Get model comparison for a state',
    description:
      'Returns training metrics for all four algorithms (ARIMA, Prophet, XGBoost, LSTM) evaluated for the specified state, including the auto-selected best model and selection rationale.',
    params: [
      { name: 'state', type: 'string', required: true, description: 'Two-letter US state code', example: 'CA' },
      { name: 'run_id', type: 'string', required: false, description: 'Specific training run ID (defaults to latest)', example: 'run-20260506-ca-01' },
    ],
    responseSchema: `{
  "state": "CA",
  "run_id": "run-20260506-ca-01",
  "best_model": "xgboost",
  "selection_criterion": "lowest_mape_validation",
  "trained_at": "2026-05-06T10:14:22Z",
  "models": [
    {
      "name": "xgboost",
      "mape": 5.21,
      "rmse": 982,
      "mae": 743,
      "train_time_seconds": 14.2,
      "is_best": true,
      "hyperparams": {
        "n_estimators": 400,
        "max_depth": 6,
        "learning_rate": 0.05,
        "lag_features": [1, 7, 30]
      }
    }
  ]
}`,
    curlExample: `curl -X GET \\
  "https://forecastiq.internal.io/api/v1/models/CA" \\
  -H "Authorization: Bearer $FORECASTIQ_API_KEY"`,
    pythonExample: `import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://forecastiq.internal.io/api/v1"

resp = requests.get(
    f"{BASE_URL}/models/CA",
    headers={"Authorization": f"Bearer {API_KEY}"},
)
data = resp.json()

print(f"Best model: {data['best_model']}")
for model in data["models"]:
    marker = " ← BEST" if model["is_best"] else ""
    print(
        f"  {model['name']:10s} MAPE={model['mape']:.2f}% "
        f"RMSE={model['rmse']:,}{marker}"
    )`,
    rateLimit: '120 req/min',
    statusCodes: [
      { code: 200, meaning: 'Model comparison returned' },
      { code: 404, meaning: 'No training run found for this state' },
    ],
  },
  {
    id: 'ep-trigger-training',
    method: 'POST',
    path: '/api/v1/models/{state}/train',
    category: 'Models',
    summary: 'Trigger model retraining for a state',
    description:
      'Initiates a full retraining pipeline for the specified state: data ingestion, feature engineering (lags, rolling stats, calendar features), model training for all 4 algorithms, evaluation, and best model selection.',
    params: [
      { name: 'state', type: 'string', required: true, description: 'Two-letter US state code', example: 'CA' },
      { name: 'force', type: 'boolean', required: false, description: 'Force retrain even if model is fresh (< 7 days old)', example: 'false' },
      { name: 'models', type: 'string[]', required: false, description: 'Subset of models to train (default: all four)', example: '["xgboost", "prophet"]' },
    ],
    responseSchema: `{
  "job_id": "train-20260506-ca-02",
  "state": "CA",
  "status": "queued",
  "models_to_train": ["arima", "prophet", "xgboost", "lstm"],
  "estimated_duration_seconds": 180,
  "queued_at": "2026-05-06T14:44:00Z",
  "notify_on_complete": true
}`,
    curlExample: `curl -X POST \\
  "https://forecastiq.internal.io/api/v1/models/CA/train" \\
  -H "Authorization: Bearer $FORECASTIQ_API_KEY"\ -H"Content-Type: application/json" \\
  -d '{"force": false}'`,
    pythonExample: `import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://forecastiq.internal.io/api/v1"

# Trigger retraining for stale states
stale_states = ["NV", "WY"]

for state in stale_states:
    resp = requests.post(
        f"{BASE_URL}/models/{state}/train",
        json={"force": True},
        headers={"Authorization": f"Bearer {API_KEY}"},
    )
    job = resp.json()
    print(
        f"Triggered retraining for {state}: "
        f"job_id={job['job_id']}, "
        f"ETA={job['estimated_duration_seconds']}s"
    )`,
    rateLimit: '5 req/min',
    statusCodes: [
      { code: 202, meaning: 'Training job queued successfully' },
      { code: 409, meaning: 'Training already in progress for this state' },
      { code: 429, meaning: 'Rate limit exceeded — max 5 training triggers/min' },
    ],
  },
  {
    id: 'ep-feature-importance',
    method: 'GET',
    path: '/api/v1/models/{state}/features',
    category: 'Models',
    summary: 'Get feature importance for XGBoost model',
    description:
      'Returns gain-based feature importance scores for the XGBoost model trained on the specified state. Includes lag features (t-1, t-7, t-30), rolling statistics, and calendar features.',
    params: [
      { name: 'state', type: 'string', required: true, description: 'Two-letter US state code', example: 'CA' },
      { name: 'importance_type', type: 'string', required: false, description: 'Importance metric: gain | cover | frequency', example: 'gain' },
    ],
    responseSchema: `{
  "state": "CA",
  "model": "xgboost",
  "importance_type": "gain",
  "features": [
    { "feature": "lag_t1", "importance": 0.312, "category": "lag" },
    { "feature": "lag_t7", "importance": 0.241, "category": "lag" },
    { "feature": "rolling_mean_4w", "importance": 0.187, "category": "rolling" },
    { "feature": "lag_t30", "importance": 0.098, "category": "lag" },
    { "feature": "rolling_std_4w", "importance": 0.072, "category": "rolling" },
    { "feature": "week_of_year", "importance": 0.041, "category": "calendar" },
    { "feature": "month", "importance": 0.024, "category": "calendar" },
    { "feature": "is_holiday", "importance": 0.016, "category": "calendar" },
    { "feature": "day_of_week", "importance": 0.009, "category": "calendar" }
  ]
}`,
    curlExample: `curl -X GET \\
  "https://forecastiq.internal.io/api/v1/models/CA/features?importance_type=gain" \\
  -H "Authorization: Bearer $FORECASTIQ_API_KEY"`,
    pythonExample: `import requests
import pandas as pd

API_KEY = "your_api_key_here"
BASE_URL = "https://forecastiq.internal.io/api/v1"

resp = requests.get(
    f"{BASE_URL}/models/CA/features",
    params={"importance_type": "gain"},
    headers={"Authorization": f"Bearer {API_KEY}"},
)
data = resp.json()

df = pd.DataFrame(data["features"])
df = df.sort_values("importance", ascending=False)
print(df.to_string(index=False))`,
    rateLimit: '120 req/min',
    statusCodes: [
      { code: 200, meaning: 'Feature importance returned' },
      { code: 404, meaning: 'No XGBoost model found for this state' },
    ],
  },
  {
    id: 'ep-ingest-data',
    method: 'POST',
    path: '/api/v1/data/ingest',
    category: 'Data',
    summary: 'Ingest new sales data',
    description:
      'Accepts new weekly sales records for one or more states. Validates date continuity, handles missing value imputation, and queues affected states for retraining if data freshness threshold is exceeded.',
    params: [
      { name: 'records', type: 'object[]', required: true, description: 'Array of sales records with state, week_start, and units_sold fields', example: '[{"state":"CA","week_start":"2026-05-05","units_sold":25840}]' },
      { name: 'impute_missing', type: 'boolean', required: false, description: 'Auto-impute missing weeks using linear interpolation', example: 'true' },
      { name: 'trigger_retrain', type: 'boolean', required: false, description: 'Automatically queue retraining for affected states', example: 'false' },
    ],
    responseSchema: `{
  "records_received": 49,
  "records_accepted": 47,
  "records_rejected": 2,
  "states_updated": ["CA", "TX", "FL"],
  "imputed_weeks": 3,
  "rejection_details": [
    {
      "state": "WY",
      "week_start": "2026-05-05",
      "reason": "units_sold value -142 is out of valid range"
    }
  ],
  "retrain_queued": false
}`,
    curlExample: `curl -X POST \\
  "https://forecastiq.internal.io/api/v1/data/ingest" \\
  -H "Authorization: Bearer $FORECASTIQ_API_KEY"\ -H"Content-Type: application/json" \\
  -d '{
    "records": [
      {"state": "CA", "week_start": "2026-05-05", "units_sold": 25840},
      {"state": "TX", "week_start": "2026-05-05", "units_sold": 19320}
    ],
    "impute_missing": true,
    "trigger_retrain": false
  }'`,
    pythonExample: `import requests
import pandas as pd

API_KEY = "your_api_key_here"
BASE_URL = "https://forecastiq.internal.io/api/v1"

# Load new data from CSV
df = pd.read_csv("sales_week_20260505.csv")
records = df.to_dict(orient="records")

resp = requests.post(
    f"{BASE_URL}/data/ingest",
    json={
        "records": records,
        "impute_missing": True,
        "trigger_retrain": False,
    },
    headers={"Authorization": f"Bearer {API_KEY}"},
)
result = resp.json()
print(f"Accepted: {result['records_accepted']}/{result['records_received']}")
if result["records_rejected"] > 0:
    for rej in result["rejection_details"]:
        print(f"  Rejected {rej['state']}: {rej['reason']}")`,
    rateLimit: '30 req/min',
    statusCodes: [
      { code: 200, meaning: 'Data ingested (may include partial rejections)' },
      { code: 400, meaning: 'Malformed request body or missing required fields' },
      { code: 422, meaning: 'All records rejected — no data persisted' },
    ],
  },
  {
    id: 'ep-health',
    method: 'GET',
    path: '/api/v1/system/health',
    category: 'System',
    summary: 'System health check',
    description:
      'Returns the operational status of the ForecastIQ service including database connectivity, model serving status, training queue depth, and last successful pipeline run timestamp.',
    params: [],
    responseSchema: `{
  "status": "healthy",
  "version": "1.4.2",
  "uptime_seconds": 847234,
  "checks": {
    "database": "ok",
    "model_store": "ok",
    "training_queue": "ok",
    "prediction_cache": "ok"
  },
  "queue_depth": 2,
  "models_serving": 47,
  "models_stale": 2,
  "last_pipeline_run": "2026-05-06T10:14:22Z",
  "timestamp": "2026-05-06T14:44:00Z"
}`,
    curlExample: `curl -X GET \\
  "https://forecastiq.internal.io/api/v1/system/health" \\
  -H "Authorization: Bearer $FORECASTIQ_API_KEY"`,
    pythonExample: `import requests

API_KEY = "your_api_key_here"
BASE_URL = "https://forecastiq.internal.io/api/v1"

resp = requests.get(
    f"{BASE_URL}/system/health",
    headers={"Authorization": f"Bearer {API_KEY}"},
)
health = resp.json()

print(f"Status: {health['status'].upper()}")
print(f"Models serving: {health['models_serving']}/49")
if health["models_stale"] > 0:
    print(f"WARNING: {health['models_stale']} stale models need retraining")
for check, status in health["checks"].items():
    icon = "✓" if status == "ok" else "✗"
    print(f"  {icon} {check}: {status}")`,
    rateLimit: '300 req/min',
    statusCodes: [
      { code: 200, meaning: 'Service is healthy' },
      { code: 503, meaning: 'Service degraded — check checks object for failing components' },
    ],
  },
];