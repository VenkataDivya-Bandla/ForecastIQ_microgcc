import pandas as pd
import numpy as np
import xgboost as xgb
from typing import Tuple, Optional
from app.models.base import BaseModel
from app.core.logger import logger
from app.data.features import create_features

class XGBoostModel(BaseModel):
    def __init__(self):
        self.model = None
        self.features = [
            'lag_1w', 'lag_7w', 'lag_30w', 
            'rolling_mean_4', 'rolling_std_4', 
            'rolling_mean_12', 'rolling_std_12',
            'week_of_year', 'month', 'quarter', 'day_of_week', 'is_holiday'
        ]

    def _prepare_data(self, df: pd.DataFrame):
        df_feat = create_features(df).dropna()
        X = df_feat[self.features]
        y = df_feat['Total']
        return X, y

    def train(self, train_df: pd.DataFrame, val_df: Optional[pd.DataFrame] = None):
        logger.info("Training XGBoost model...")
        X_train, y_train = self._prepare_data(train_df)
        
        eval_set = None
        if val_df is not None:
            # We need to compute features for val_df properly by concatenating train and val
            full_df = pd.concat([train_df, val_df])
            full_feat = create_features(full_df)
            val_feat = full_feat.iloc[-len(val_df):]
            X_val = val_feat[self.features]
            y_val = val_feat['Total']
            eval_set = [(X_val, y_val)]

        self.model = xgb.XGBRegressor(
            n_estimators=1000,
            learning_rate=0.05,
            early_stopping_rounds=50 if val_df is not None else None,
            objective='reg:squarederror'
        )
        
        self.model.fit(
            X_train, y_train,
            eval_set=eval_set,
            verbose=False
        )
        logger.info("XGBoost model training completed.")

    def predict(self, steps: int, context_df: Optional[pd.DataFrame] = None) -> Tuple[pd.Series, pd.Series, pd.Series, pd.Series, pd.Series]:
        if self.model is None or context_df is None:
            raise ValueError("Model is not trained or context_df is missing.")
            
        # We will predict autoregressively
        current_df = context_df.copy()
        predictions = []
        
        for i in range(steps):
            # We add a dummy row for the next step
            next_date = current_df.index[-1] + pd.Timedelta(days=7)
            current_df.loc[next_date] = np.nan
            
            # Recompute features
            df_feat = create_features(current_df)
            X_next = df_feat.iloc[-1:][self.features]
            
            # Predict
            pred = self.model.predict(X_next)[0]
            predictions.append(pred)
            
            # Update the dummy row with prediction
            current_df.loc[next_date, 'Total'] = pred
            
        point_forecast = pd.Series(predictions)
        
        # XGBoost doesn't provide prediction intervals natively with reg:squarederror
        # For simplicity, returning None for CIs
        null_series = pd.Series([None] * steps)
        return point_forecast, null_series, null_series, null_series, null_series
