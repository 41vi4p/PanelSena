"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export function ActivityFeed() {
  const activities = [
    {
      id: 1,
      type: "upload",
      title: "Content uploaded",
      description: "Lobby Display",
      time: "2 hours ago",
      icon: Upload,
    },
    {
      id: 2,
      type: "alert",
      title: "Display offline",
      description: "Hallway B - Signage",
      time: "4 hours ago",
      icon: AlertTriangle,
    },
    {
      id: 3,
      type: "success",
      title: "Schedule updated",
      description: "Conference Room A",
      time: "6 hours ago",
      icon: CheckCircle,
    },
    {
      id: 4,
      type: "pending",
      title: "Scheduled update",
      description: "All displays",
      time: "In 2 hours",
      icon: Clock,
    },
  ]

  const getIconColor = (type: string) => {
    switch (type) {
      case "upload":
        return "text-blue-500"
      case "alert":
        return "text-amber-500"
      case "success":
        return "text-green-500"
      case "pending":
        return "text-purple-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className="border-border h-full">
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                <div className={`p-2 rounded-lg bg-muted flex-shrink-0 ${getIconColor(activity.type)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
