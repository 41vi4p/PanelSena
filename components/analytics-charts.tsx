"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface AnalyticsChartsProps {
  timeRange: string
}

export function AnalyticsCharts({ timeRange }: AnalyticsChartsProps) {
  const viewsData = [
    { date: "Oct 23", views: 2400, engagement: 65 },
    { date: "Oct 24", views: 3210, engagement: 72 },
    { date: "Oct 25", views: 2290, engagement: 58 },
    { date: "Oct 26", views: 2000, engagement: 61 },
    { date: "Oct 27", views: 2181, engagement: 68 },
    { date: "Oct 28", views: 2500, engagement: 75 },
    { date: "Oct 29", views: 2100, engagement: 70 },
  ]

  const displayPerformanceData = [
    { name: "Lobby Display", uptime: 99.8, views: 3200 },
    { name: "Conference Room A", uptime: 99.5, views: 2800 },
    { name: "Waiting Area", uptime: 98.2, views: 2100 },
    { name: "Meeting Room 1", uptime: 99.9, views: 1900 },
    { name: "Cafeteria Display", uptime: 97.8, views: 2400 },
  ]

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Views & Engagement Trend</CardTitle>
          <CardDescription>Daily views and engagement rate over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: `1px solid var(--color-border)`,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: "var(--color-primary)" }}
              />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="var(--color-accent)"
                strokeWidth={2}
                dot={{ fill: "var(--color-accent)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Display Performance</CardTitle>
          <CardDescription>Uptime and views by display</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: `1px solid var(--color-border)`,
                }}
              />
              <Legend />
              <Bar dataKey="uptime" fill="var(--color-primary)" />
              <Bar dataKey="views" fill="var(--color-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
