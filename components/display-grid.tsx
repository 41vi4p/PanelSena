"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Monitor, MoreVertical } from "lucide-react"

export function DisplayGrid() {
  const displays = [
    {
      id: 1,
      name: "Lobby Display",
      location: "Main Entrance",
      status: "online",
      resolution: "1920x1080",
      uptime: "99.8%",
    },
    {
      id: 2,
      name: "Conference Room A",
      location: "Building 2, Floor 3",
      status: "online",
      resolution: "3840x2160",
      uptime: "99.5%",
    },
    {
      id: 3,
      name: "Waiting Area",
      location: "Reception",
      status: "online",
      resolution: "1920x1080",
      uptime: "98.2%",
    },
    {
      id: 4,
      name: "Digital Signage",
      location: "Hallway B",
      status: "offline",
      resolution: "1920x1080",
      uptime: "95.1%",
    },
    {
      id: 5,
      name: "Meeting Room 1",
      location: "Building 1, Floor 2",
      status: "online",
      resolution: "2560x1440",
      uptime: "99.9%",
    },
    {
      id: 6,
      name: "Cafeteria Display",
      location: "Cafeteria",
      status: "online",
      resolution: "1920x1080",
      uptime: "97.8%",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Displays</h2>
        <Button variant="outline" size="sm">
          Add Display
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displays.map((display) => (
          <Card key={display.id} className="border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-muted rounded-lg mt-1">
                    <Monitor className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">{display.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{display.location}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant={display.status === "online" ? "default" : "secondary"}
                  className={display.status === "online" ? "bg-green-500/20 text-green-700 dark:text-green-400" : ""}
                >
                  {display.status === "online" ? "Online" : "Offline"}
                </Badge>
                <span className="text-xs text-muted-foreground">Uptime: {display.uptime}</span>
              </div>
              <p className="text-xs text-muted-foreground">{display.resolution}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
