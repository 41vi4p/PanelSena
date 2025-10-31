"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { PerformanceMetrics } from "@/components/performance-metrics"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { EngagementStats } from "@/components/engagement-stats"
import { UptimeTracker } from "@/components/uptime-tracker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")

  const user = { email: "user@example.com", companyName: "My Company" }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground mt-1">Monitor display performance and engagement</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 bg-input border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <PerformanceMetrics timeRange={timeRange} />

        <Tabs defaultValue="overview" className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="uptime">Uptime</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <AnalyticsCharts timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="engagement" className="mt-6">
            <EngagementStats timeRange={timeRange} />
          </TabsContent>

          <TabsContent value="uptime" className="mt-6">
            <UptimeTracker timeRange={timeRange} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
