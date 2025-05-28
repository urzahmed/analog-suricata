"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Shield, Activity, BarChart3 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

interface AnalysisData {
  total_logs: number
  time_range: {
    start: string
    end: string
  }
  top_source_ips: Record<string, number>
  top_destination_ips: Record<string, number>
  alert_types: Record<string, number>
  protocols: Record<string, number>
  ports: Record<string, number>
  threat_analysis: {
    high_severity_alerts: Array<{
      signature: string
      severity: number
      src_ip: string
      dest_ip: string
    }>
    suspicious_ips: string[]
    unusual_ports: number[]
    potential_attacks: any[]
  }
  security_suggestions: string[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function AnalyzePage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        console.log('Fetching data from backend...')
        const response = await fetch('http://localhost:8000/api/v1/analyze', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          console.error('Response not OK:', response.status, errorData)
          throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Raw response data:', data)
        console.log('Data type:', typeof data)
        console.log('Data keys:', Object.keys(data))
        
        // Check if data has the expected structure
        if (!data.protocols) {
          console.warn('Missing protocols in response')
        }
        if (!data.alert_types) {
          console.warn('Missing alert_types in response')
        }
        
        setAnalysisData(data)
      } catch (err) {
        console.error('Error fetching analysis data:', err)
        setError(err instanceof Error ? err.message : 'An error occurred while fetching analysis data')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysisData()
  }, [])

  // Add logging for state changes
  useEffect(() => {
    console.log('Analysis data state updated:', analysisData)
  }, [analysisData])

  if (loading) {
    console.log('Loading state:', loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading analysis data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.log('Error state:', error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-red-500">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!analysisData) {
    console.log('No analysis data available')
    return null
  }

  // Transform data for charts
  const protocolData = Object.entries(analysisData.protocols || {}).map(([name, value]) => ({
    name,
    value
  }))

  const alertTypeData = Object.entries(analysisData.alert_types || {}).map(([name, count]) => ({
    name,
    count
  }))

  const topSourceIPs = Object.entries(analysisData.top_source_ips || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([ip, count]) => ({
      ip,
      count
    }))

  const topDestinationIPs = Object.entries(analysisData.top_destination_ips || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([ip, count]) => ({
      ip,
      count
    }))

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Traffic Analysis Dashboard</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysisData.total_logs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Object.keys(analysisData.alert_types || {}).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Severity Alerts</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysisData.threat_analysis.high_severity_alerts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspicious IPs</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analysisData.threat_analysis.suspicious_ips.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analysis Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="threats">Threats</TabsTrigger>
            <TabsTrigger value="traffic">Traffic Analysis</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Protocol Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={protocolData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {protocolData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alert Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={alertTypeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="threats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>High Severity Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.threat_analysis.high_severity_alerts.map((alert, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{alert.signature}</h3>
                          <p className="text-sm text-muted-foreground">
                            From: {alert.src_ip} → To: {alert.dest_ip}
                          </p>
                        </div>
                        <div className="text-red-500">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traffic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Source IPs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topSourceIPs.map(({ ip, count }) => (
                    <div key={ip} className="flex justify-between items-center border-b pb-2">
                      <span className="font-medium">{ip}</span>
                      <span className="text-muted-foreground">{count} connections</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Types Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={alertTypeData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {alertTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alert Types by Count</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={alertTypeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8">
                          {alertTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Alert Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertTypeData.map(({ name, count }, index) => (
                    <div key={name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <h3 className="font-semibold">{name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {count} occurrences
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {((count / analysisData.total_logs) * 100).toFixed(2)}% of total logs
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData.security_suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 