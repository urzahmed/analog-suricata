import json
import aiofiles
from typing import List, Dict, Any
from datetime import datetime
from pathlib import Path

class LogProcessor:
    def __init__(self, log_file_path: str = "/var/log/suricata/eve.json"):
        self.log_file_path = log_file_path

    async def read_logs(self, limit: int = 1000) -> List[Dict[str, Any]]:
        """Read and parse Suricata logs from the eve.json file."""
        try:
            async with aiofiles.open(self.log_file_path, mode='r') as file:
                logs = []
                async for line in file:
                    if len(logs) >= limit:
                        break
                    try:
                        log_entry = json.loads(line)
                        if self._is_valid_log(log_entry):
                            processed_log = self._process_log_entry(log_entry)
                            logs.append(processed_log)
                    except json.JSONDecodeError:
                        continue
                return logs
        except FileNotFoundError:
            # For development/testing, return mock data
            return self._generate_mock_logs(limit)

    def _is_valid_log(self, log_entry: Dict[str, Any]) -> bool:
        """Check if the log entry contains required fields."""
        required_fields = ['src_ip', 'dest_ip', 'src_port', 'dest_port', 'proto']
        return all(field in log_entry for field in required_fields)

    def _process_log_entry(self, log_entry: Dict[str, Any]) -> Dict[str, Any]:
        """Process and standardize a log entry."""
        return {
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