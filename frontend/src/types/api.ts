export interface Log {
    id: number;
    timestamp: string;
    src_ip: string;
    dest_ip: string;
    src_port: number;
    dest_port: number;
    protocol: string;
    pkts_toserver: number;
    pkts_toclient: number;
    bytes_toserver: number;
    bytes_toclient: number;
    alert_signature?: string;
    alert_category?: string;
    alert_severity?: number;
    is_anomaly: boolean;
    anomaly_score?: number;
}

export interface AnomalyAction {
    log_id: number;
    action: string;
    description: string;
}

export interface ApiResponse<T> {
    data: T;
    error?: string;
} 