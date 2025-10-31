"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download } from "lucide-react"

interface LogEntry {
  id: string
  timestamp: string
  type: "info" | "warning" | "error" | "success"
  action: string
  description: string
  user: string
  display?: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "info" | "warning" | "error" | "success">("all")

  useEffect(() => {
    // TODO: Fetch logs from Firebase
    // For now, logs are empty
    setLogs([])
  }, [])

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || log.type === filterType
    return matchesSearch && matchesFilter
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
      case "error":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
      case "warning":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
      case "info":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Activity Logs</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Monitor all system activities and events</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/50 backdrop-blur-sm border-border/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => setFilterType("all")}
              className="bg-card/50 backdrop-blur-sm border-border/50 whitespace-nowrap"
            >
              All
            </Button>
            <Button
              variant={filterType === "success" ? "default" : "outline"}
              onClick={() => setFilterType("success")}
              className="bg-card/50 backdrop-blur-sm border-border/50 whitespace-nowrap"
            >
              Success
            </Button>
            <Button
              variant={filterType === "warning" ? "default" : "outline"}
              onClick={() => setFilterType("warning")}
              className="bg-card/50 backdrop-blur-sm border-border/50 whitespace-nowrap"
            >
              Warning
            </Button>
            <Button
              variant={filterType === "error" ? "default" : "outline"}
              onClick={() => setFilterType("error")}
              className="bg-card/50 backdrop-blur-sm border-border/50 whitespace-nowrap"
            >
              Error
            </Button>
          </div>
          <Button className="bg-linear-to-r from-primary to-accent hover:opacity-90 text-primary-foreground whitespace-nowrap">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>

        {/* Logs Table */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {logs.length} logs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border/30 hover:border-border/60 transition-colors bg-background/30 hover:bg-background/50"
                  >
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(log.type)}`}>
                      {log.type.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{log.action}</h3>
                        {log.display && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{log.display}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{log.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>By: {log.user}</span>
                        <span>{formatTime(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No logs found matching your criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
