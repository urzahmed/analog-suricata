from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class LogBase(BaseModel):
    src_ip: str
    dest_ip: str
    src_port: int
    dest_port: int
    protocol: str
    pkts_toserver: int
    pkts_toclient: int
    bytes_toserver: int
    bytes_toclient: int
    alert_signature: Optional[str] = None
    alert_category: Optional[str] = None
    alert_severity: Optional[int] = None

class LogCreate(LogBase):
    pass

class Log(LogBase):
    id: int
    timestamp: datetime
    is_anomaly: bool
    anomaly_score: Optional[float] = None

    class Config:
        from_attributes = True

class AnomalyAction(BaseModel):
    log_id: int
    action: str
    description: str 