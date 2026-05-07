from prophet import Prophet
import pandas as pd
import numpy as np
from typing import Tuple, Optional
from app.models.base import BaseModel
from app.core.logger import logger

class ProphetModel(BaseModel):
    def __init__(self):
        self.model = None

    def train(self, train_df: pd.DataFrame, val_df: Optional[pd.DataFrame] = None):
        logger.info("Training Prophet model...")
        
        # Prophet requires 'ds' and 'y' columns
        df = train_df.reset_index()[['index', 'Total']].rename(columns={'index': 'ds', 'Total': 'y'})
        
        # Initialize Prophet with US holidays, weekly, and yearly seasonality
        self.model = Prophet(yearly_seasonality=True, weekly_seasonality=True, interval_width=0.95)
        self.model.add_country_holidays(country_name='US')
        
        self.model.fit(df)
        logger.info("Prophet model training completed.")

    def predict(self, steps: int, context_df: Optional[pd.DataFrame] = None) -> Tuple[pd.Series, pd.Series, pd.Series, pd.Series, pd.Series]:
        if self.model is None:
            raise ValueError("Model is not trained yet.")
            
        future = self.model.make_future_dataframe(periods=steps, freq='W-MON')
        forecast_95 = self.model.predict(future)
        forecast_95 = forecast_95.tail(steps)
        
        point_forecast = pd.Series(forecast_95['yhat'].values)
        lower_95 = pd.Series(forecast_95['yhat_lower'].values)
        upper_95 = pd.Series(forecast_95['yhat_upper'].values)
        
        # Approximate 80% CI
        margin_95 = upper_95 - point_forecast
        lower_80 = point_forecast - margin_95 * 0.653
        upper_80 = point_forecast + margin_95 * 0.653
        
        return point_forecast, lower_80, upper_80, lower_95, upper_95
