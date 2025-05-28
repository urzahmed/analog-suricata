from fastapi import APIRouter, HTTPException
from app.services.eve_reader import read_eve_logs
from app.services.analysis import analyze_logs
from app.utils.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)

@router.get("/analyze")
async def analyze():
    """
    Analyze eve.json logs and return insights and suggestions.
    
    Returns:
        dict: Analysis results including:
            - Total logs analyzed
            - Time range
            - Top source/destination IPs
            - Alert types
            - Protocol statistics
            - Port statistics
            - Threat analysis
            - Security suggestions
    """
    try:
        # Read logs from eve.json
        logs = read_eve_logs()
        
        if not logs:
            raise HTTPException(
                status_code=404,
                detail="No logs found in eve.json"
            )
        
        # Analyze logs
        analysis = analyze_logs(logs)
        
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing logs: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing logs: {str(e)}"
        ) 