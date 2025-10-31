"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Edit, Trash2, Plus } from "lucide-react"

const schedules = [
  { id: 1, name: "Morning Announcements", time: "08:00 AM", days: "Mon-Fri", displays: 8, status: "active" },
  { id: 2, name: "Lunch Menu", time: "11:30 AM", days: "Mon-Fri", displays: 5, status: "active" },
  { id: 3, name: "Evening Promotions", time: "05:00 PM", days: "Daily", displays: 12, status: "active" },
  { id: 4, name: "Night Standby", time: "06:00 PM", days: "Daily", displays: 15, status: "active" },
  { id: 5, name: "Weekend Special", time: "10:00 AM", days: "Sat-Sun", displays: 10, status: "inactive" },
]

export default function SchedulePage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Scheduling</h1>
          <p className="text-muted-foreground mt-1">Create and manage content schedules</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {/* Schedules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{schedule.name}</CardTitle>
                  <CardDescription className="text-xs mt-1">{schedule.days}</CardDescription>
                </div>
                <Badge
                  className={
                    schedule.status === "active" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }
                >
                  {schedule.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-foreground">{schedule.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{schedule.displays} displays</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 border-border bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="border-border bg-transparent">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
