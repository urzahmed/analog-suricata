"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { format } from "date-fns"
import type { EveLogEntry, EveLogResponse, EveLogFilters } from "@/types/eve-log"

interface EventsTableProps {
  filters: EveLogFilters
  onRowClick: (entry: EveLogEntry) => void
}

export function EventsTable({ filters, onRowClick }: EventsTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const { data, isLoading, error } = useQuery<EveLogResponse>({
    queryKey: ["eve-logs", page, pageSize, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== "")),
      })
      const response = await fetch(`/api/eve-logs?${params}`)
      return response.json()
    },
  })

  const getEventTypeBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case "tls":
        return "default"
      case "alert":
        return "destructive"
      case "dns":
        return "secondary"
      case "quic":
        return "outline"
      case "stats":
        return "secondary"
      case "http":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Error loading data</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Showing {data ? (page - 1) * pageSize + 1 : 0} to {data ? Math.min(page * pageSize, data.total) : 0} of{" "}
            {data?.total || 0} entries
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number.parseInt(value))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(pageSize)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-muted animate-pulse rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !data?.data.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((entry) => (
                <TableRow key={`${entry.timestamp}-${entry.flow_id || Math.random()}`} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">
                    {format(new Date(entry.timestamp), "MMM dd, HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getEventTypeBadgeVariant(entry.event_type)}>{entry.event_type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {entry.src_ip}:{entry.src_port}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {entry.dest_ip}:{entry.dest_port}
                  </TableCell>
                  <TableCell className="max-w-48 truncate">
                    {entry.tls?.sni || entry.dns?.rrname || entry.alert?.signature || "-"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => onRowClick(entry)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {data?.totalPages || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page <= 1 || isLoading}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page >= (data?.totalPages || 1) || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
