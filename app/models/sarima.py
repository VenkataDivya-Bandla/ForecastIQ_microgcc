import pmdarima as pm
import pandas as pd
import numpy as np
from typing import Tuple, Optional
from app.models.base import BaseModel
from app.core.logger import logger

class SARIMAModel(BaseModel):
    def __init__(self):
        self.model = None

    def train(self, train_df: pd.DataFrame, val_df: Optional[pd.DataFrame] = None):
        logger.info("Training SARIMA model...")
        # Target variable is 'Total'
        y = train_df['Total']
        
        # Use auto_arima with seasonal=True, m=52 for weekly data
        self.model = pm.auto_arima(
            y,
            seasonal=True,
            m=52,
            suppress_warnings=True,
            error_action="ignore",
            stepwise=True
        )
        logger.info("SARIMA model training completed.")

    def predict(self, steps: int, context_df: Optional[pd.DataFrame] = None) -> Tuple[pd.Series, pd.Series, pd.Series, pd.Series, pd.Series]:
        if self.model is None:
            raise ValueError("Model is not trained yet.")
            
        # Point forecasts and 95% confidence intervals
        forecast, conf_int_95 = self.model.predict(n_periods=steps, return_conf_int=True, alpha=0.05)
        
        # To get 80% CI, we need to manually compute or predict again
        _, conf_int_80 = self.model.predict(n_periods=steps, return_conf_int=True, alpha=0.20)
        
        point_forecast = pd.Series(forecast)
        lower_80 = pd.Series(conf_int_80[:, 0])
        upper_80 = pd.Series(conf_int_80[:, 1])
        lower_95 = pd.Series(conf_int_95[:, 0])
        upper_95 = pd.Series(conf_int_95[:, 1])
        
        return point_forecast, lower_80, upper_80, lower_95, upper_95
