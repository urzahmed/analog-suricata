import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pandas as pd
from typing import List, Tuple

class AnomalyDetector:
    def __init__(self, contamination=0.1):
        self.model = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100
        )
        self.scaler = StandardScaler()
        self.is_fitted = False

    def _prepare_features(self, logs: List[dict]) -> np.ndarray:
        """Extract and prepare features for anomaly detection."""
        features = []
        for log in logs:
            feature_vector = [
                log['pkts_toserver'],
                log['pkts_toclient'],
                log['bytes_toserver'],
                log['bytes_toclient'],
                log['src_port'],
                log['dest_port']
            ]
            features.append(feature_vector)
        return np.array(features)

    def fit(self, logs: List[dict]):
        """Train the anomaly detection model."""
        features = self._prepare_features(logs)
        features_scaled = self.scaler.fit_transform(features)
        self.model.fit(features_scaled)
        self.is_fitted = True

    def predict(self, logs: List[dict]) -> List[Tuple[bool, float]]:
        """Predict anomalies in the logs."""
        if not self.is_fitted:
            raise ValueError("Model needs to be fitted before prediction")

        features = self._prepare_features(logs)
        features_scaled = self.scaler.transform(features)
        
        # Get anomaly scores (negative scores indicate anomalies)
        scores = self.model.score_samples(features_scaled)
        
        # Convert scores to predictions (True for anomalies)
        predictions = self.model.predict(features_scaled)
        is_anomaly = predictions == -1
        
        # Normalize scores to be between 0 and 1
        normalized_scores = 1 - (scores - scores.min()) / (scores.max() - scores.min())
        
        return list(zip(is_anomaly, normalized_scores)) 