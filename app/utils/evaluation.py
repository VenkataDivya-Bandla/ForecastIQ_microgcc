import numpy as np
from typing import Dict

def mean_absolute_percentage_error(y_true, y_pred):
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    non_zero = y_true != 0
    if not np.any(non_zero):
        return 0.0
    return np.mean(np.abs((y_true[non_zero] - y_pred[non_zero]) / y_true[non_zero])) * 100

def evaluate_forecast(y_true, y_pred) -> Dict[str, float]:
    """Calculate RMSE, MAE, and MAPE."""
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    
    rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))
    mae = np.mean(np.abs(y_true - y_pred))
    mape = mean_absolute_percentage_error(y_true, y_pred)
    
    return {
        "rmse": float(rmse),
        "mae": float(mae),
        "mape": float(mape)
    }
