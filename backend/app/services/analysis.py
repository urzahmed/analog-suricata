from typing import List, Dict, Any
from collections import Counter
from app.utils.logging import get_logger
from app.services.eve_reader import parse_timestamp

logger = get_logger(__name__)

def analyze_logs(logs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze Suricata logs and generate security insights.
    
    Args:
        logs (List[Dict[str, Any]]): List of parsed log entries
        
    Returns:
        Dict[str, Any]: Analysis results including statistics and security insights
    """
    try:
        # Initialize counters and collections
        total_logs = len(logs)
        source_ips = Counter()
        dest_ips = Counter()
        alert_types = Counter()
        protocols = Counter()
        ports = Counter()
        timestamps = []
        
        # Process each log entry
        for log in logs:
            # Extract timestamp
            if 'timestamp' in log:
                timestamp = parse_timestamp(log['timestamp'])
                if timestamp:
                    timestamps.append(timestamp)
            
            # Extract IP addresses
            if 'src_ip' in log:
                source_ips[log['src_ip']] += 1
            if 'dest_ip' in log:
                dest_ips[log['dest_ip']] += 1
            
            # Extract alert information
            if 'alert' in log:
                alert_types[log['alert']['signature']] += 1
            
            # Extract protocol information
            if 'proto' in log:
                protocols[log['proto']] += 1
            
            # Extract port information
            if 'src_port' in log:
                ports[f"Source Port {log['src_port']}"] += 1
            if 'dest_port' in log:
                ports[f"Destination Port {log['dest_port']}"] += 1
        
        # Calculate time range
        time_range = {
            "start": min(timestamps).isoformat() if timestamps else None,
            "end": max(timestamps).isoformat() if timestamps else None
        }
        
        # Generate threat analysis
        threat_analysis = analyze_threats(logs)
        
        # Generate security suggestions
        suggestions = generate_suggestions(
            alert_types=alert_types,
            protocols=protocols,
            ports=ports,
            threat_analysis=threat_analysis
        )
        
        return {
            "total_logs": total_logs,
            "time_range": time_range,
            "top_source_ips": dict(source_ips.most_common(10)),
            "top_destination_ips": dict(dest_ips.most_common(10)),
            "alert_types": dict(alert_types.most_common(10)),
            "protocols": dict(protocols),
            "ports": dict(ports.most_common(10)),
            "threat_analysis": threat_analysis,
            "security_suggestions": suggestions
        }
        
    except Exception as e:
        logger.error(f"Error analyzing logs: {str(e)}")
        raise

def analyze_threats(logs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze potential security threats from logs.
    
    Args:
        logs (List[Dict[str, Any]]): List of parsed log entries
        
    Returns:
        Dict[str, Any]: Threat analysis results
    """
    threats = {
        "high_severity_alerts": [],
        "suspicious_ips": set(),
        "unusual_ports": set(),
        "potential_attacks": []
    }
    
    # Define suspicious ports
    suspicious_ports = {22, 23, 3389, 445, 1433, 3306, 5432}  # Common attack target ports
    
    for log in logs:
        # Check for high severity alerts
        if 'alert' in log and log['alert'].get('severity', 0) >= 2:
            threats["high_severity_alerts"].append({
                "signature": log['alert']['signature'],
                "severity": log['alert']['severity'],
                "src_ip": log.get('src_ip'),
                "dest_ip": log.get('dest_ip')
            })
        
        # Check for suspicious source IPs
        if 'src_ip' in log and log.get('alert'):
            threats["suspicious_ips"].add(log['src_ip'])
        
        # Check for unusual port activity
        if 'dest_port' in log and log['dest_port'] in suspicious_ports:
            threats["unusual_ports"].add(log['dest_port'])
        
        # Check for potential attacks
        if 'alert' in log and any(keyword in log['alert']['signature'].lower() 
                                for keyword in ['exploit', 'attack', 'malware', 'scan']):
            threats["potential_attacks"].append({
                "type": log['alert']['signature'],
                "src_ip": log.get('src_ip'),
                "dest_ip": log.get('dest_ip')
            })
    
    # Convert sets to lists for JSON serialization
    threats["suspicious_ips"] = list(threats["suspicious_ips"])
    threats["unusual_ports"] = list(threats["unusual_ports"])
    
    return threats

def generate_suggestions(
    alert_types: Counter,
    protocols: Counter,
    ports: Counter,
    threat_analysis: Dict[str, Any]
) -> List[str]:
    """
    Generate security suggestions based on analysis.
    
    Args:
        alert_types (Counter): Count of different alert types
        protocols (Counter): Count of different protocols
        ports (Counter): Count of different ports
        threat_analysis (Dict[str, Any]): Threat analysis results
        
    Returns:
        List[str]: List of security suggestions
    """
    suggestions = []
    
    # Check for high number of alerts
    if sum(alert_types.values()) > 100:
        suggestions.append("High number of alerts detected. Consider reviewing alert thresholds and rules.")
    
    # Check for suspicious protocols
    if protocols.get('TCP', 0) > 1000:
        suggestions.append("High volume of TCP traffic detected. Consider implementing rate limiting.")
    
    # Check for suspicious ports
    suspicious_ports = {port for port in ports if any(p in port for p in ['22', '23', '3389'])}
    if suspicious_ports:
        suggestions.append(f"Suspicious port activity detected on ports: {', '.join(suspicious_ports)}")
    
    # Check for high severity alerts
    if threat_analysis["high_severity_alerts"]:
        suggestions.append("High severity alerts detected. Immediate investigation recommended.")
    
    # Check for suspicious IPs
    if threat_analysis["suspicious_ips"]:
        suggestions.append(f"Suspicious activity detected from {len(threat_analysis['suspicious_ips'])} IP addresses. Consider blocking these IPs.")
    
    # Check for potential attacks
    if threat_analysis["potential_attacks"]:
        suggestions.append(f"Potential attacks detected: {len(threat_analysis['potential_attacks'])} incidents. Review and update security rules.")
    
    return suggestions 