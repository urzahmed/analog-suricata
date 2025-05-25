from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .api.endpoints import router
from .models.database import Base, engine
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from .api.endpoints import analyze_logs
from fastapi.responses import JSONResponse
from .models.log import Log
from .services.anomaly_detection import AnomalyDetectionService
from .database import get_db
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json
import os
from datetime import datetime

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Log Analyzer and Anomaly Predictor",
    description="API for analyzing system logs and detecting anomalies using ML",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")

# Create scheduler
scheduler = AsyncIOScheduler()

# Initialize anomaly detection service
anomaly_detector = AnomalyDetectionService()

@app.on_event("startup")
async def startup_event():
    # Schedule log analysis every 5 minutes
    scheduler.add_job(analyze_logs, 'interval', minutes=5)
    scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()

@app.get("/")
async def root():
    return JSONResponse({
        "message": "Welcome to Log Analyzer and Anomaly Predictor API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    })

@app.get("/api/logs")
def get_logs():
    db = next(get_db())
    logs = db.query(Log).all()
    return [log.to_dict() for log in logs]

@app.get("/api/anomalies")
def get_anomalies():
    db = next(get_db())
    logs = db.query(Log).all()
    if not logs:
        return []
    # Convert logs to feature vectors for anomaly detection
    features = [[log.timestamp.timestamp(), log.severity] for log in logs]
    anomalies = anomaly_detector.detect_anomalies(features)
    return [logs[i].to_dict() for i in anomalies]

@app.post("/api/analyze")
def analyze_logs():
    db = next(get_db())
    logs = db.query(Log).all()
    if not logs:
        return {"message": "No logs found for analysis."}
    # Convert logs to feature vectors for anomaly detection
    features = [[log.timestamp.timestamp(), log.severity] for log in logs]
    anomalies = anomaly_detector.detect_anomalies(features)
    return {
        "total_logs": len(logs),
        "anomalies": [logs[i].to_dict() for i in anomalies]
    } 