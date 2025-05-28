"use client"

import { SummaryCards } from "@/components/summary-cards"
import { TrafficCharts } from "@/components/traffic-charts"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000, // Refetch every 5 seconds
      refetchIntervalInBackground: true, // Continue refetching even when the window is not focused
    },
  },
})

export default function Dashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            {/* Summary Cards */}
            <SummaryCards />

            {/* Charts */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Traffic Analysis</h2>
              <TrafficCharts />
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}
