import json
import aiofiles
import logging
import os
from typing import List, Dict, Any
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class LogProcessor:
    def __init__(self, log_file_path: str = "C:\\Program Files\\Suricata\\log\\eve.json"):
        self.log_file_path = log_file_path
        self._verify_file_access()
        logger.debug(f"Initialized LogProcessor with path: {self.log_file_path}")

    def _verify_file_access(self):
        """Verify file exists and is accessible."""
        try:
            if not os.path.exists(self.log_file_path):
                logger.error(f"File does not exist: {self.log_file_path}")
                return
            
            # Try to open the file to check permissions
            with open(self.log_file_path, 'r') as f:
                # Just read first line to verify access
                first_line = f.readline()
                logger.debug(f"First line of file: {first_line[:200]}...")  # Log first 200 chars
            logger.info(f"File access verified: {self.log_file_path}")
        except PermissionError as e:
            logger.error(f"Permission denied accessing file: {self.log_file_path}")
            logger.error(f"Error details: {str(e)}")
        except Exception as e:
            logger.error(f"Error verifying file access: {str(e)}")

    async def read_logs(self, limit: int = 1000) -> List[Dict[str, Any]]:
        """Read and parse Suricata logs from the eve.json file."""
        try:
            logger.debug(f"Attempting to read logs from: {self.log_file_path}")
            if not os.path.exists(self.log_file_path):
                logger.error(f"File not found: {self.log_file_path}")
                return self._generate_mock_logs(limit)

            async with aiofiles.open(self.log_file_path, mode='r') as file:
                logs = []
                line_count = 0
                async for line in file:
                    line_count += 1
                    if len(logs) >= limit:
                        break
                    try:
                        log_entry = json.loads(line)
                        if self._is_valid_log(log_entry):
                            processed_log = self._process_log_entry(log_entry)
                            logs.append(processed_log)
                            if len(logs) <= 3:  # Log first 3 processed entries
                                logger.debug(f"Processed log entry {len(logs)}: {json.dumps(processed_log, indent=2)}")
                    except json.JSONDecodeError as e:
                        logger.error(f"JSON decode error on line {line_count}: {str(e)}")
                        continue
                logger.info(f"Successfully read {len(logs)} logs from {line_count} total lines")
                if logs:
                    logger.debug(f"Sample log entry: {json.dumps(logs[0], indent=2)}")
                return logs
        except FileNotFoundError as e:
            logger.error(f"File not found: {self.log_file_path}")
            logger.error(f"Error details: {str(e)}")
            return self._generate_mock_logs(limit)
        except PermissionError as e:
            logger.error(f"Permission denied: {self.log_file_path}")
            logger.error(f"Error details: {str(e)}")
            return self._generate_mock_logs(limit)
        except Exception as e:
            logger.error(f"Unexpected error reading logs: {str(e)}")
            return self._generate_mock_logs(limit)

    def _is_valid_log(self, log_entry: Dict[str, Any]) -> bool:
        """Check if the log entry contains required fields."""
        required_fields = ['src_ip', 'dest_ip', 'src_port', 'dest_port', 'proto']
        is_valid = all(field in log_entry for field in required_fields)
        if not is_valid:
            logger.debug(f"Invalid log entry: {json.dumps(log_entry, indent=2)}")
            logger.debug(f"Missing fields: {[field for field in required_fields if field not in log_entry]}")
        return is_valid

    def _process_log_entry(self, log_entry: Dict[str, Any]) -> Dict[str, Any]:
        """Process and standardize a log entry."""
        processed = {
            'src_ip': log_entry.get('src_ip'),
            'dest_ip': log_entry.get('dest_ip'),
            'src_port': int(log_entry.get('src_port', 0)),
            'dest_port': int(log_entry.get('dest_port', 0)),
            'protocol': log_entry.get('proto', 'unknown'),
            'pkts_toserver': int(log_entry.get('flow', {}).get('pkts_toserver', 0)),
            'pkts_toclient': int(log_entry.get('flow', {}).get('pkts_toclient', 0)),
            'bytes_toserver': int(log_entry.get('flow', {}).get('bytes_toserver', 0)),
            'bytes_toclient': int(log_entry.get('flow', {}).get('bytes_toclient', 0)),
            'alert_signature': log_entry.get('alert', {}).get('signature'),
            'alert_category': log_entry.get('alert', {}).get('category'),
            'alert_severity': int(log_entry.get('alert', {}).get('severity', 0))
        }
        logger.debug(f"Processed log entry: {json.dumps(processed, indent=2)}")
        return processed

    def _generate_mock_logs(self, count: int) -> List[Dict[str, Any]]:
        """Generate mock logs for testing."""
        import random
        from datetime import datetime, timedelta

        protocols = ['TCP', 'UDP', 'ICMP']
        mock_logs = []
        
        for _ in range(count):
            mock_logs.append({
                'src_ip': f"192.168.1.{random.randint(1, 254)}",
                'dest_ip': f"10.0.0.{random.randint(1, 254)}",
                'src_port': random.randint(1024, 65535),
                'dest_port': random.randint(1, 1024),
                'protocol': random.choice(protocols),
                'pkts_toserver': random.randint(1, 1000),
                'pkts_toclient': random.randint(1, 1000),
                'bytes_toserver': random.randint(100, 10000),
                'bytes_toclient': random.randint(100, 10000),
                'alert_signature': random.choice(['Suspicious Traffic', 'Port Scan', 'DDoS Attempt', None]),
                'alert_category': random.choice(['Attack', 'Scan', 'Malware', None]),
                'alert_severity': random.choice([1, 2, 3, None])
            })
        
        return mock_logs 