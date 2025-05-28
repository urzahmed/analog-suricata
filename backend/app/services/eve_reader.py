import json
from datetime import datetime
from typing import List, Dict, Any
from app.utils.logging import get_logger
from app.core.config import settings
import os

logger = get_logger(__name__)

def read_eve_logs(file_path: str = None) -> List[Dict[str, Any]]:
    """
    Read and parse eve.json logs.
    
    Args:
        file_path (str, optional): Path to eve.json file. Defaults to None.
        
    Returns:
        List[Dict[str, Any]]: List of parsed log entries
    """
    if file_path is None:
        # Get the absolute path to the data directory
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        file_path = os.path.join(base_dir, "data", "eve.json")
        
    try:
        logger.info(f"Reading logs from: {file_path}")
        logs = []
        with open(file_path, 'r') as f:
            for line in f:
                try:
                    log_entry = json.loads(line.strip())
                    logs.append(log_entry)
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse log entry: {e}")
                    continue
                    
        logger.info(f"Successfully read {len(logs)} log entries")
        return logs
        
    except FileNotFoundError:
        logger.error(f"eve.json file not found at {file_path}")
        raise
    except Exception as e:
        logger.error(f"Error reading eve.json: {str(e)}")
        raise

def parse_timestamp(timestamp: str) -> datetime:
    """
    Parse Suricata timestamp to datetime object.
    
    Args:
        timestamp (str): Timestamp string from Suricata logs
        
    Returns:
        datetime: Parsed datetime object
    """
    try:
        return datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%S.%f%z")
    except ValueError:
        try:
            return datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%S%z")
        except ValueError:
            logger.warning(f"Failed to parse timestamp: {timestamp}")
            return None 