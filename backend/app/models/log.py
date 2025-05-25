from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from .database import Base

class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    src_ip = Column(String)
    dest_ip = Column(String)
    src_port = Column(Integer)
    dest_port = Column(Integer)
    protocol = Column(String)
    pkts_toserver = Column(Integer)
    pkts_toclient = Column(Integer)
    bytes_toserver = Column(Integer)
    bytes_toclient = Column(Integer)
    alert_signature = Column(String, nullable=True)
    alert_category = Column(String, nullable=True)
    alert_severity = Column(Integer, nullable=True)
    is_anomaly = Column(Boolean, default=False)
    anomaly_score = Column(Float, nullable=True) 