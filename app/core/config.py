import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sales Forecasting API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Data paths
    DATA_PATH: str = os.getenv("DATA_PATH", "data/sales_data.xlsx")
    MODEL_DIR: str = os.getenv("MODEL_DIR", "artifacts/models")
    
    # Forecasting params
    FORECAST_HORIZON: int = 8
    VALIDATION_WEEKS: int = 8
    
    class Config:
        case_sensitive = True

settings = Settings()

# Ensure model directory exists
os.makedirs(settings.MODEL_DIR, exist_ok=True)
