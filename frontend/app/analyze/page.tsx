"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Construction } from "lucide-react"

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Construction className="h-5 w-5" />
              Analysis Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h2 className="text-2xl font-semibold mb-2">Coming Soon</h2>
              <p className="text-muted-foreground">
                Advanced traffic analysis features are under development.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 