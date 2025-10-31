"use client"

import { useState, useEffect } from "react"
import { ScheduleCalendar } from "@/components/schedule-calendar"
import { ScheduleForm } from "@/components/schedule-form"
import { ScheduleList } from "@/components/schedule-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

interface Schedule {
  id: number
  name: string
  content: string
  displays: string[]
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  recurring: "none" | "daily" | "weekly" | "monthly"
  daysOfWeek?: string[]
  status: "active" | "scheduled" | "completed"
}

export default function SchedulingPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [filterStatus, setFilterStatus] = useState<string[]>(["active", "scheduled", "completed"])

  // TODO: Fetch schedules from Firebase using useSchedules hook
  useEffect(() => {
    // Schedules will come from Firebase
    setSchedules([])
  }, [])

  const handleAddSchedule = (newSchedule: Omit<Schedule, "id">) => {
    console.log("[v0] Adding new schedule:", newSchedule)
    const schedule: Schedule = {
      ...newSchedule,
      id: Date.now(),
    }
    setSchedules([...schedules, schedule])
    setShowForm(false)
  }

  const handleEditSchedule = (schedule: Schedule) => {
    console.log("[v0] Editing schedule:", schedule)
    setEditingSchedule(schedule)
    setShowForm(true)
  }

  const handleUpdateSchedule = (updatedSchedule: Schedule) => {
    console.log("[v0] Updating schedule:", updatedSchedule)
    setSchedules(schedules.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s)))
    setShowForm(false)
    setEditingSchedule(null)
  }

  const handleDeleteSchedule = (id: number) => {
    console.log("[v0] Deleting schedule:", id)
    setSchedules(schedules.filter((s) => s.id !== id))
  }

  const handleCloseForm = () => {
    console.log("[v0] Closing schedule form")
    setShowForm(false)
    setEditingSchedule(null)
  }

  const toggleFilter = (status: string) => {
    console.log("[v0] Toggling filter:", status)
    setFilterStatus((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const filteredSchedules = schedules.filter((s) => filterStatus.includes(s.status))

  const activeCount = schedules.filter((s) => s.status === "active").length
  const scheduledCount = schedules.filter((s) => s.status === "scheduled").length

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Content Scheduling</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Schedule content for your displays</p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent hover:bg-muted">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={filterStatus.includes("active")}
                  onCheckedChange={() => toggleFilter("active")}
                >
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus.includes("scheduled")}
                  onCheckedChange={() => toggleFilter("scheduled")}
                >
                  Scheduled
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus.includes("completed")}
                  onCheckedChange={() => toggleFilter("completed")}
                >
                  Completed
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => {
                console.log("[v0] New Schedule button clicked")
                setShowForm(true)
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Schedule</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Active Schedules</p>
            <p className="text-2xl font-bold text-foreground">{activeCount}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Scheduled</p>
            <p className="text-2xl font-bold text-foreground">{scheduledCount}</p>
          </div>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Schedules</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <ScheduleList schedules={filteredSchedules} onEdit={handleEditSchedule} onDelete={handleDeleteSchedule} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <ScheduleCalendar schedules={schedules} />
          </TabsContent>
        </Tabs>

        {showForm && (
          <ScheduleForm
            schedule={editingSchedule}
            onSave={editingSchedule ? handleUpdateSchedule : handleAddSchedule}
            onClose={handleCloseForm}
          />
        )}
      </main>
    </div>
  )
}
