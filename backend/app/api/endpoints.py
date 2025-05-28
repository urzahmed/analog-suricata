from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..models.database import get_db
from ..models.log import Log
from ..schemas.log import Log as LogSchema, AnomalyAction
from ..services.log_processor import LogProcessor
from ..services.anomaly_detector import AnomalyDetector
import logging

router = APIRouter()
log_processor = LogProcessor()
anomaly_detector = AnomalyDetector()
logger = logging.getLogger(__name__)

@router.get("/logs", response_model=List[LogSchema])
async def get_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all logs with pagination."""
    # First try to get logs from database
    logs = db.query(Log).offset(skip).limit(limit).all()
    
    # If no logs in database, read from eve.json
    if not logs:
        logger.info("No logs in database, reading from eve.json")
        raw_logs = await log_processor.read_logs(limit)
        
        # Save logs to database
        for log_data in raw_logs:
            log = Log(**log_data)
            db.add(log)
        db.commit()
        
        # Fetch the newly saved logs
        logs = db.query(Log).offset(skip).limit(limit).all()
    
    return logs

@router.get("/logs/anomalies", response_model=List[LogSchema])
async def get_anomalies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get only anomalous logs."""
    anomalies = db.query(Log).filter(Log.is_anomaly == True).offset(skip).limit(limit).all()
    return anomalies

@router.post("/suggest-action", response_model=AnomalyAction)
async def suggest_action(log_id: int, db: Session = Depends(get_db)):
    """Suggest an action for a specific anomaly."""
    log = db.query(Log).filter(Log.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    if not log.is_anomaly:
        raise HTTPException(status_code=400, detail="Log is not an anomaly")

    # Simple rule-based action suggestion
    if log.alert_severity and log.alert_severity >= 2:
        action = "block_ip"
        description = f"Block IP {log.src_ip} due to high severity alert"
    elif log.pkts_toserver > 1000 or log.pkts_toclient > 1000:
        action = "rate_limit"
        description = f"Rate limit traffic from {log.src_ip} due to high packet count"
    else:
        action = "monitor"
        description = f"Monitor traffic from {log.src_ip} for suspicious patterns"

    return AnomalyAction(
        log_id=log_id,
        action=action,
        description=description
    )

@router.post("/analyze-logs")
async def analyze_logs(db: Session = Depends(get_db)):
    """Analyze new logs and detect anomalies."""
    # Read new logs
    new_logs = await log_processor.read_logs()
    
    # Get existing logs for training
    existing_logs = db.query(Log).all()
    if not existing_logs:
        # If no existing logs, use new logs for training
        training_logs = new_logs
    else:
        # Convert existing logs to dict format
        training_logs = [
            {
                'pkts_toserver': log.pkts_toserver,
                'pkts_toclient': log.pkts_toclient,
                'bytes_toserver': log.bytes_toserver,
                'bytes_toclient': log.bytes_toclient,
                'src_port': log.src_port,
                'dest_port': log.dest_port
            }
            for log in existing_logs
        ]

    # Train the model
    anomaly_detector.fit(training_logs)
    
    # Detect anomalies in new logs
    predictions = anomaly_detector.predict(new_logs)
    
    # Save new logs with anomaly predictions
    for log_data, (is_anomaly, score) in zip(new_logs, predictions):
        log = Log(
            **log_data,
            is_anomaly=is_anomaly,
            anomaly_score=float(score)
        )
        db.add(log)
    
    db.commit()
    
    return {"message": f"Analyzed {len(new_logs)} logs"} 