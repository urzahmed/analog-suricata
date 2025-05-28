import { type NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import type { EveLogResponse, EveLogFilters, EveLogEntry } from "@/types/eve-log"

let cachedData: EveLogEntry[] | null = null

function loadEveLogData(): EveLogEntry[] {
  if (cachedData) {
    return cachedData
  }

  try {
    const filePath = join(process.cwd(), "public", "eve.json")
    const fileContent = readFileSync(filePath, "utf-8")

    // Parse JSONL (JSON Lines) format
    const lines = fileContent.trim().split("\n")
    cachedData = lines
      .filter((line) => line.trim())
      .map((line) => {
        try {
          return JSON.parse(line) as EveLogEntry
        } catch (e) {
          console.error("Error parsing line:", line, e)
          return null
        }
      })
      .filter((entry): entry is EveLogEntry => entry !== null)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return cachedData
  } catch (error) {
    console.error("Error reading eve.json:", error)
    return []
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = Number.parseInt(searchParams.get("page") || "1")
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "20")
  const eventType = searchParams.get("eventType") || undefined
  const dateFrom = searchParams.get("dateFrom") || undefined
  const dateTo = searchParams.get("dateTo") || undefined
  const tlsVersion = searchParams.get("tlsVersion") || undefined
  const sourceIp = searchParams.get("sourceIp") || undefined
  const destIp = searchParams.get("destIp") || undefined

  const filters: EveLogFilters = {
    eventType,
    dateFrom,
    dateTo,
    tlsVersion,
    sourceIp,
    destIp,
  }

  const allData = loadEveLogData()

  // Apply filters
  const filteredData = allData.filter((entry) => {
    if (filters.eventType && filters.eventType !== "all" && entry.event_type !== filters.eventType) return false
    if (filters.tlsVersion && filters.tlsVersion !== "all" && entry.tls?.version !== filters.tlsVersion) return false
    if (filters.sourceIp && entry.src_ip && !entry.src_ip.includes(filters.sourceIp)) return false
    if (filters.destIp && entry.dest_ip && !entry.dest_ip.includes(filters.destIp)) return false
    if (filters.dateFrom && new Date(entry.timestamp) < new Date(filters.dateFrom)) return false
    if (filters.dateTo && new Date(entry.timestamp) > new Date(filters.dateTo)) return false
    return true
  })

  // Pagination
  const total = filteredData.length
  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const response: EveLogResponse = {
    data: paginatedData,
    total,
    page,
    pageSize,
    totalPages,
  }

  return NextResponse.json(response)
}
