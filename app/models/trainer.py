import os
import joblib
import pandas as pd
from typing import Dict, Any
from app.core.config import settings
from app.core.logger import logger
from app.data.loader import load_and_preprocess_data
from app.data.features import train_val_split
from app.models.sarima import SARIMAModel
from app.models.prophet_model import ProphetModel
from app.models.xgboost_model import XGBoostModel
from app.models.lstm import LSTMModel
from app.utils.evaluation import evaluate_forecast

class ModelTrainer:
    def __init__(self):
        self.models = {
            'SARIMA': SARIMAModel,
            'Prophet': ProphetModel,
            'XGBoost': XGBoostModel,
            'LSTM': LSTMModel
        }
        self.leaderboard = {}

    def train_all(self) -> str:
        logger.info("Starting training process for all states...")
        if not os.path.exists(settings.DATA_PATH):
            logger.error(f"Data file not found at {settings.DATA_PATH}")
            return "Failed: Data not found"
            
        states_data = load_and_preprocess_data(settings.DATA_PATH)
        
        for state, df in states_data.items():
            logger.info(f"Processing state: {state}")
            try:
                train_df, val_df = train_val_split(df, settings.VALIDATION_WEEKS)
            except ValueError as e:
                logger.warning(f"Skipping state {state}: {str(e)}")
                continue
                
            best_model_name = None
            best_model = None
            best_mape = float('inf')
            state_results = {}
            
            for model_name, model_class in self.models.items():
                logger.info(f"Training {model_name} for {state}...")
                model = model_class()
                try:
                    model.train(train_df, val_df)
                    
                    # Predict on validation period
                    # For prediction, context is the train_df
                    point_forecast, _, _, _, _ = model.predict(steps=settings.VALIDATION_WEEKS, context_df=train_df)
                    
                    # Evaluate
                    metrics = evaluate_forecast(val_df['Total'].values, point_forecast.values)
                    state_results[model_name] = metrics
                    
                    logger.info(f"{model_name} for {state} MAPE: {metrics['mape']:.2f}%")
                    
                    if metrics['mape'] < best_mape:
                        best_mape = metrics['mape']
                        best_model_name = model_name
                        best_model = model
                except Exception as e:
                    logger.error(f"Error training {model_name} for {state}: {str(e)}")
                    state_results[model_name] = {"error": str(e)}
            
            if best_model is not None:
                logger.info(f"Best model for {state} is {best_model_name} with MAPE: {best_mape:.2f}%")
                logger.info(f"Retraining best model {best_model_name} on full data for {state}...")
                best_model.train(df)
                
                # Save best model
                model_path = os.path.join(settings.MODEL_DIR, f"{state}_model.joblib")
                joblib.dump({
                    'model_name': best_model_name,
                    'model': best_model,
                    'context_df': df # Save full df as context for future predictions
                }, model_path)
                
                self.leaderboard[state] = {
                    'best_model': best_model_name,
                    'metrics': state_results[best_model_name],
                    'all_results': state_results
                }
            else:
                logger.warning(f"No successful model trained for {state}")
                
        # Save leaderboard
        lb_path = os.path.join(settings.MODEL_DIR, "leaderboard.joblib")
        joblib.dump(self.leaderboard, lb_path)
        
        logger.info("Training process completed.")
        return "Success"
