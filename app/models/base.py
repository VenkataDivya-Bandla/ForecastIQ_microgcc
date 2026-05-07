from abc import ABC, abstractmethod
import pandas as pd
from typing import Tuple, Optional

class BaseModel(ABC):
    @abstractmethod
    def train(self, train_df: pd.DataFrame, val_df: Optional[pd.DataFrame] = None):
        """Train the model on the provided data."""
        pass

    @abstractmethod
    def predict(self, steps: int, context_df: Optional[pd.DataFrame] = None) -> Tuple[pd.Series, pd.Series, pd.Series, pd.Series, pd.Series]:
        """
        Predict future steps.
        Returns a tuple of (point_forecast, lower_80_ci, upper_80_ci, lower_95_ci, upper_95_ci).
        If CI is not available, return None for those series.
        """
        pass
