from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import List, Dict, Any
import os
import joblib
import pandas as pd
from app.core.config import settings
from app.models.trainer import ModelTrainer

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "healthy"}

@router.post("/train")
def trigger_training(background_tasks: BackgroundTasks):
    trainer = ModelTrainer()
    background_tasks.add_task(trainer.train_all)
    return {"message": "Training job started in the background", "job_id": "job_1"}

@router.get("/models/leaderboard")
def get_leaderboard():
    lb_path = os.path.join(settings.MODEL_DIR, "leaderboard.joblib")
    if not os.path.exists(lb_path):
        raise HTTPException(status_code=404, detail="Leaderboard not found. Run training first.")
    
    leaderboard = joblib.load(lb_path)
    return leaderboard

@router.get("/forecasts/{state}")
def get_forecast(state: str):
    model_path = os.path.join(settings.MODEL_DIR, f"{state}_model.joblib")
    if not os.path.exists(model_path):
        raise HTTPException(status_code=404, detail=f"Model for state {state} not found. Run training first.")
        
    data = joblib.load(model_path)
    model_name = data['model_name']
    model = data['model']
    context_df = data['context_df']
    
    try:
        point, l80, u80, l95, u95 = model.predict(steps=settings.FORECAST_HORIZON, context_df=context_df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
        
    # Generate future dates
    last_date = context_df.index[-1]
    future_dates = [last_date + pd.Timedelta(days=7 * i) for i in range(1, settings.FORECAST_HORIZON + 1)]
    
    forecasts = []
    for i in range(settings.FORECAST_HORIZON):
        forecasts.append({
            "week": i + 1,
            "week_start": future_dates[i].strftime("%Y-%m-%d"),
            "point_forecast": float(point.iloc[i]) if pd.notnull(point.iloc[i]) else None,
            "ci_80_lower": float(l80.iloc[i]) if l80 is not None and pd.notnull(l80.iloc[i]) else None,
            "ci_80_upper": float(u80.iloc[i]) if u80 is not None and pd.notnull(u80.iloc[i]) else None,
            "ci_95_lower": float(l95.iloc[i]) if l95 is not None and pd.notnull(l95.iloc[i]) else None,
            "ci_95_upper": float(u95.iloc[i]) if u95 is not None and pd.notnull(u95.iloc[i]) else None,
        })
        
    # Get metrics from leaderboard if available
    lb_path = os.path.join(settings.MODEL_DIR, "leaderboard.joblib")
    metrics = {}
    all_results = {}
    if os.path.exists(lb_path):
        leaderboard = joblib.load(lb_path)
        if state in leaderboard:
            metrics = leaderboard[state].get('metrics', {})
            all_results = leaderboard[state].get('all_results', {}) or {}
            
    return {
        "state": state,
        "selected_model": model_name,
        "metrics": metrics,
        "all_results": all_results,
        "forecast": forecasts
    }
