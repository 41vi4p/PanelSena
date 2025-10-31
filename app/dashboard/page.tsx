"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { MetricsCards } from "@/components/metrics-cards"
import { DisplayGrid } from "@/components/display-grid"
import { ActivityFeed } from "@/components/activity-feed"

export default function DashboardPage() {
  const [user, setUser] = useState<{ email: string; companyName: string } | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <MetricsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DisplayGrid />
          </div>
          <div>
            <ActivityFeed />
          </div>
        </div>
      </main>
    </div>
  )
}
