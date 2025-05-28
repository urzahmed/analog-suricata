"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import type { EveLogEntry } from "@/types/eve-log"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function TrafficCharts() {
  const { data: logs, isLoading } = useQuery<EveLogEntry[]>({
    queryKey: ["eve-logs-all"],
    queryFn: async () => {
      const response = await fetch("/api/eve-logs?pageSize=10000")
      const result = await response.json()
      return result.data
    },
  })

  if (isLoading || !logs) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Event Type Distribution
  const eventTypeCounts = logs.reduce(
    (acc, log) => {
      acc[log.event_type] = (acc[log.event_type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const eventTypeData = Object.entries(eventTypeCounts).map(([type, count]) => ({
    name: type,
    value: count,
  }))

  // TLS Version Distribution
  const tlsVersionCounts = logs
    .filter((log) => log.tls?.version)
    .reduce(
      (acc, log) => {
        const version = log.tls!.version
        acc[version] = (acc[version] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

  const tlsVersionData = Object.entries(tlsVersionCounts).map(([version, count]) => ({
    version,
    count,
  }))

  // Top SNI Domains
  const sniCounts = logs
    .filter((log) => log.tls?.sni)
    .reduce(
      (acc, log) => {
        const sni = log.tls!.sni
        acc[sni] = (acc[sni] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

  const topSniData = Object.entries(sniCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([sni, count]) => ({
      sni: sni.length > 20 ? sni.substring(0, 20) + "..." : sni,
      count,
    }))

  // Top JA3 Hashes
  const ja3Counts = logs
    .filter((log) => log.tls?.ja3?.hash)
    .reduce(
      (acc, log) => {
        const hash = log.tls!.ja3!.hash
        acc[hash] = (acc[hash] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

  const topJa3Data = Object.entries(ja3Counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([hash, count]) => ({
      hash: hash.substring(0, 8) + "...",
      count,
    }))

  const COLORS = [
    "#0088FE", // Blue
    "#00C49F", // Teal
    "#FFBB28", // Yellow
    "#FF8042", // Orange
    "#8884D8", // Purple
    "#82ca9d", // Green
    "#ffc658", // Light Yellow
    "#ff7c43", // Light Orange
    "#665191", // Dark Purple
    "#2f4b7c"  // Dark Blue
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Event Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Events",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-64"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>TLS Version Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Count",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-64"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tlsVersionData}>
                <XAxis dataKey="version" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top SNI Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSniData.map((entry, index) => (
                <TableRow key={entry.sni}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="font-mono text-sm">{entry.sni}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary" className="font-mono">
                      {entry.count.toLocaleString()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top JA3 Hashes</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Count",
                color: "hsl(var(--chart-4))",
              },
            }}
            className="h-96"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topJa3Data}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={2}
                  dataKey="count"
                  label={({ hash, percent }) => `${hash} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={true}
                >
                  {topJa3Data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [value.toLocaleString(), "Count"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
