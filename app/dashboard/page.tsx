"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { MetricsCards } from "@/components/metrics-cards"
import { DisplayGrid } from "@/components/display-grid"
import { ActivityFeed } from "@/components/activity-feed"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardPage() {
  const { userProfile } = useAuth()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader user={userProfile} />

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
    </ProtectedRoute>
  )
}
