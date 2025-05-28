"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Filter, X } from "lucide-react"
import type { EveLogFilters } from "@/types/eve-log"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface FilterPanelProps {
  filters: EveLogFilters
  onFiltersChange: (filters: EveLogFilters) => void
  onClearFilters: () => void
}

export function FilterPanel({ filters, onFiltersChange, onClearFilters }: FilterPanelProps) {
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  const handleFilterChange = (key: keyof EveLogFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    })
  }

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date)
    handleFilterChange("dateFrom", date?.toISOString())
  }

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date)
    handleFilterChange("dateTo", date?.toISOString())
  }

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined && value !== "")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="ml-auto h-6 px-2">
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="event-type">Event Type</Label>
          <Select value={filters.eventType || ""} onValueChange={(value) => handleFilterChange("eventType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All event types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All event types</SelectItem>
              <SelectItem value="tls">TLS</SelectItem>
              <SelectItem value="dns">DNS</SelectItem>
              <SelectItem value="quic">QUIC</SelectItem>
              <SelectItem value="stats">Stats</SelectItem>
              <SelectItem value="alert">Alert</SelectItem>
              <SelectItem value="http">HTTP</SelectItem>
              <SelectItem value="flow">Flow</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tls-version">TLS Version</Label>
          <Select value={filters.tlsVersion || ""} onValueChange={(value) => handleFilterChange("tlsVersion", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All TLS versions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All TLS versions</SelectItem>
              <SelectItem value="TLS 1.2">TLS 1.2</SelectItem>
              <SelectItem value="TLS 1.3">TLS 1.3</SelectItem>
              <SelectItem value="TLS 1.1">TLS 1.1</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date From</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dateFrom} onSelect={handleDateFromChange} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Date To</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dateTo} onSelect={handleDateToChange} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="source-ip">Source IP</Label>
          <Input
            id="source-ip"
            placeholder="Filter by source IP"
            value={filters.sourceIp || ""}
            onChange={(e) => handleFilterChange("sourceIp", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dest-ip">Destination IP</Label>
          <Input
            id="dest-ip"
            placeholder="Filter by destination IP"
            value={filters.destIp || ""}
            onChange={(e) => handleFilterChange("destIp", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
