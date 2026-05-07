import pandas as pd
import holidays
from typing import Tuple
from app.core.config import settings

def create_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Creates lag, rolling, calendar, and holiday features for the dataset.
    Assumes df has a DatetimeIndex and a 'Total' column.
    """
    df_feat = df.copy()
    
    # Outlier cap (IQR x3)
    Q1 = df_feat['Total'].quantile(0.25)
    Q3 = df_feat['Total'].quantile(0.75)
    IQR = Q3 - Q1
    upper_bound = Q3 + 3 * IQR
    lower_bound = Q1 - 3 * IQR
    df_feat['Total'] = df_feat['Total'].clip(lower=lower_bound, upper=upper_bound)
    
    # Lag features: t-1, t-7, t-30 weeks
    # Since data is weekly, t-1 week is shift(1), t-7 weeks is shift(7), t-30 weeks is shift(30)
    df_feat['lag_1w'] = df_feat['Total'].shift(1)
    df_feat['lag_7w'] = df_feat['Total'].shift(7)
    df_feat['lag_30w'] = df_feat['Total'].shift(30)

    # Backward-compatible aliases for older saved artifacts/models
    # (some artifacts expect lag_1/lag_7/lag_30 instead of lag_*w)
    df_feat['lag_1'] = df_feat['lag_1w']
    df_feat['lag_7'] = df_feat['lag_7w']
    df_feat['lag_30'] = df_feat['lag_30w']
    
    # Rolling features: 4-week and 12-week rolling mean and std
    df_feat['rolling_mean_4'] = df_feat['Total'].shift(1).rolling(window=4).mean()
    df_feat['rolling_std_4'] = df_feat['Total'].shift(1).rolling(window=4).std()
    
    df_feat['rolling_mean_12'] = df_feat['Total'].shift(1).rolling(window=12).mean()
    df_feat['rolling_std_12'] = df_feat['Total'].shift(1).rolling(window=12).std()
    
    # Calendar features
    df_feat['week_of_year'] = df_feat.index.isocalendar().week.astype(int)
    df_feat['month'] = df_feat.index.month
    df_feat['quarter'] = df_feat.index.quarter
    df_feat['day_of_week'] = df_feat.index.dayofweek
    
    # US federal holiday flag
    us_holidays = holidays.US()
    df_feat['is_holiday'] = df_feat.index.map(lambda x: 1 if x in us_holidays else 0)
    
    return df_feat

def train_val_split(df: pd.DataFrame, val_weeks: int = settings.VALIDATION_WEEKS) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Splits the dataframe into train and validation sets (last `val_weeks` weeks = val).
    """
    if len(df) <= val_weeks:
        raise ValueError("Not enough data to split into train and validation")
        
    train = df.iloc[:-val_weeks]
    val = df.iloc[-val_weeks:]
    
    return train, val
