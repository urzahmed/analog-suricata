export interface EveLogEntry {
  timestamp: string
  flow_id?: number
  in_iface?: string
  event_type: string
  src_ip?: string
  src_port?: number
  dest_ip?: string
  dest_port?: number
  proto?: string
  pkt_src?: string
  tls?: {
    sni: string
    version: string
    ja3?: {
      hash: string
      string: string
    }
    ja3s?: {
      hash: string
      string: string
    }
  }
  dns?: {
    version?: number
    type: string
    id: number
    rrname?: string
    rrtype?: string
    tx_id?: number
    opcode?: number
    flags?: string
    qr?: boolean
    rd?: boolean
    ra?: boolean
    rcode?: string
    answers?: Array<{
      rrname: string
      rrtype: string
      ttl: number
      rdata: string
    }>
    authorities?: Array<{
      rrname: string
      rrtype: string
      ttl: number
      soa?: {
        mname: string
        rname: string
        serial: number
        refresh: number
        retry: number
        expire: number
        minimum: number
      }
    }>
    grouped?: {
      A?: string[]
    }
  }
  quic?: {
    version: string
    sni?: string
    ja3?: {
      hash: string
      string: string
    }
    extensions?: Array<{
      name?: string
      type: number
      values?: string[]
    }>
  }
  stats?: {
    uptime: number
    capture: any
    decoder: any
    tcp: any
    flow: any
    defrag: any
    flow_bypassed: any
    detect: any
    app_layer: any
    memcap_pressure: number
    memcap_pressure_max: number
    http: any
    ftp: any
    file_store: any
  }
  alert?: {
    action: string
    gid: number
    signature_id: number
    rev: number
    signature: string
    category: string
    severity: number
  }
}

export interface EveLogResponse {
  data: EveLogEntry[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface EveLogFilters {
  eventType?: string
  dateFrom?: string
  dateTo?: string
  tlsVersion?: string
  sourceIp?: string
  destIp?: string
}

export interface EveLogStats {
  totalEvents: number
  uniqueIps: number
  topTlsVersion: string
  tlsTrafficPercentage: number
}
