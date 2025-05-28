import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import type { EveLogStats, EveLogEntry } from "@/types/eve-log"

function loadEveLogData(): EveLogEntry[] {
  try {
    const filePath = join(process.cwd(), "public", "eve.json")
    const fileContent = readFileSync(filePath, "utf-8")

    // Parse JSONL (JSON Lines) format
    const lines = fileContent.trim().split("\n")
    return lines
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
  } catch (error) {
    console.error("Error reading eve.json:", error)
    return []
  }
}

export async function GET() {
  const allData = loadEveLogData()

  const totalEvents = allData.length
  const uniqueIps = new Set([
    ...allData.filter((e) => e.src_ip).map((e) => e.src_ip!),
    ...allData.filter((e) => e.dest_ip).map((e) => e.dest_ip!),
  ]).size

  const tlsVersionCounts = allData
    .filter((e) => e.tls?.version)
    .reduce(
      (acc, e) => {
        const version = e.tls!.version
        acc[version] = (acc[version] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

  const topTlsVersion = Object.entries(tlsVersionCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "TLS 1.3"

  const tlsEvents = allData.filter((e) => e.event_type === "tls").length
  const tlsTrafficPercentage = totalEvents > 0 ? Math.round((tlsEvents / totalEvents) * 100) : 0

  const stats: EveLogStats = {
    totalEvents,
    uniqueIps,
    topTlsVersion,
    tlsTrafficPercentage,
  }

  return NextResponse.json(stats)
}
