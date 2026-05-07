import pandas as pd
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from typing import Tuple, Optional
from app.models.base import BaseModel
from app.core.logger import logger
from sklearn.preprocessing import MinMaxScaler

class LSTMNetwork(nn.Module):
    def __init__(self, input_size: int, hidden_size: int = 64, num_layers: int = 2):
        super().__init__()
        self.lstm = nn.LSTM(input_size=input_size, hidden_size=hidden_size, 
                            num_layers=num_layers, batch_first=True)
        self.linear = nn.Linear(hidden_size, 1)

    def forward(self, x):
        lstm_out, _ = self.lstm(x)
        out = self.linear(lstm_out[:, -1, :])
        return out

class LSTMModel(BaseModel):
    def __init__(self, seq_length: int = 12):
        self.seq_length = seq_length
        self.model = None
        self.scaler_X = MinMaxScaler()
        self.scaler_y = MinMaxScaler()
        self.features = [
            'lag_1w', 'lag_7w', 'lag_30w', 
            'rolling_mean_4', 'rolling_std_4', 
            'rolling_mean_12', 'rolling_std_12',
            'week_of_year', 'month', 'quarter', 'day_of_week', 'is_holiday'
        ]

    def _create_sequences(self, X: np.ndarray, y: np.ndarray):
        X_seq, y_seq = [], []
        for i in range(len(X) - self.seq_length):
            X_seq.append(X[i:(i + self.seq_length)])
            y_seq.append(y[i + self.seq_length])
        return np.array(X_seq), np.array(y_seq)

    def train(self, train_df: pd.DataFrame, val_df: Optional[pd.DataFrame] = None):
        logger.info("Training LSTM model...")
        from app.data.features import create_features
        df_feat = create_features(train_df).dropna()
        
        X = df_feat[self.features].values
        y = df_feat['Total'].values.reshape(-1, 1)
        
        X_scaled = self.scaler_X.fit_transform(X)
        y_scaled = self.scaler_y.fit_transform(y)
        
        X_seq, y_seq = self._create_sequences(X_scaled, y_scaled)
        
        if len(X_seq) == 0:
            logger.warning("Not enough data for LSTM sequence length. Skipping training.")
            return

        dataset = TensorDataset(torch.FloatTensor(X_seq), torch.FloatTensor(y_seq))
        loader = DataLoader(dataset, batch_size=16, shuffle=True)
        
        self.model = LSTMNetwork(input_size=len(self.features))
        optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)
        criterion = nn.MSELoss()
        
        self.model.train()
        for epoch in range(50):
            for batch_X, batch_y in loader:
                optimizer.zero_grad()
                outputs = self.model(batch_X)
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()
                
        logger.info("LSTM model training completed.")

    def predict(self, steps: int, context_df: Optional[pd.DataFrame] = None) -> Tuple[pd.Series, pd.Series, pd.Series, pd.Series, pd.Series]:
        if self.model is None or context_df is None:
            raise ValueError("Model is not trained or context_df is missing.")
            
        self.model.eval()
        from app.data.features import create_features
        
        current_df = context_df.copy()
        predictions = []
        
        with torch.no_grad():
            for i in range(steps):
                # We add a dummy row for the next step
                next_date = current_df.index[-1] + pd.Timedelta(days=7)
                current_df.loc[next_date] = np.nan
                
                df_feat = create_features(current_df)
                
                # Get the last `seq_length` rows
                X_next = df_feat.iloc[-self.seq_length-1:-1][self.features].values
                if len(X_next) < self.seq_length:
                    # Pad if necessary, though context should be long enough
                    pad = np.zeros((self.seq_length - len(X_next), X_next.shape[1]))
                    X_next = np.vstack([pad, X_next])
                    
                X_scaled = self.scaler_X.transform(X_next)
                X_tensor = torch.FloatTensor(X_scaled).unsqueeze(0)
                
                pred_scaled = self.model(X_tensor).numpy()
                pred = self.scaler_y.inverse_transform(pred_scaled)[0][0]
                
                predictions.append(pred)
                current_df.loc[next_date, 'Total'] = pred
                
        point_forecast = pd.Series(predictions)
        null_series = pd.Series([None] * steps)
        return point_forecast, null_series, null_series, null_series, null_series
