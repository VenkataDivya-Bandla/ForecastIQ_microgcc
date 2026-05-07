import pandas as pd
from typing import Dict
from app.core.logger import logger

def load_and_preprocess_data(file_path: str) -> Dict[str, pd.DataFrame]:
    """
    Loads data from Excel, handles missing dates by reindexing to weekly,
    and forward-fills missing values. Returns a dict mapping State to its DataFrame.
    """
    logger.info(f"Loading data from {file_path}")
    df = pd.read_excel(file_path)
    
    # Ensure Date is datetime
    df['Date'] = pd.to_datetime(df['Date'])
    
    # Aggregate to weekly level per state (in case there are multiple entries like Categories)
    df = df.groupby(['State', pd.Grouper(key='Date', freq='W-MON')])['Total'].sum().reset_index()
    
    states_data = {}
    states = df['State'].unique()
    
    for state in states:
        state_df = df[df['State'] == state].copy()
        state_df.set_index('Date', inplace=True)
        state_df.sort_index(inplace=True)
        
        # Reindex to full weekly DatetimeIndex
        if not state_df.empty:
            full_index = pd.date_range(start=state_df.index.min(), end=state_df.index.max(), freq='W-MON')
            state_df = state_df.reindex(full_index)
            # Handle missing values: interpolate linearly, then ffill and bfill
            state_df['Total'] = state_df['Total'].interpolate(method='linear').ffill().bfill()
            state_df['State'] = state
            
        states_data[state] = state_df
        
    logger.info(f"Processed data for {len(states_data)} states.")
    return states_data
