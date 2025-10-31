"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DisplayList } from "@/components/display-list"
import { DisplayDetailsModal } from "@/components/display-details-modal"
import { Button } from "@/components/ui/button"
import { Plus, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

interface Display {
  id: number
  name: string
  location: string
  status: "online" | "offline"
  resolution: string
  uptime: string
  brightness: number
  orientation: "landscape" | "portrait"
  lastUpdate: string
  group: string
}

export default function DisplaysPage() {
  const [displays, setDisplays] = useState<Display[]>([
    {
      id: 1,
      name: "Lobby Display",
      location: "Main Entrance",
      status: "online",
      resolution: "1920x1080",
      uptime: "99.8%",
      brightness: 80,
      orientation: "landscape",
      lastUpdate: "2 hours ago",
      group: "Entrance",
    },
    {
      id: 2,
      name: "Conference Room A",
      location: "Building 2, Floor 3",
      status: "online",
      resolution: "3840x2160",
      uptime: "99.5%",
      brightness: 75,
      orientation: "landscape",
      lastUpdate: "1 hour ago",
      group: "Meeting Rooms",
    },
    {
      id: 3,
      name: "Waiting Area",
      location: "Reception",
      status: "online",
      resolution: "1920x1080",
      uptime: "98.2%",
      brightness: 85,
      orientation: "landscape",
      lastUpdate: "30 minutes ago",
      group: "Reception",
    },
    {
      id: 4,
      name: "Digital Signage",
      location: "Hallway B",
      status: "offline",
      resolution: "1920x1080",
      uptime: "95.1%",
      brightness: 0,
      orientation: "portrait",
      lastUpdate: "4 hours ago",
      group: "Hallways",
    },
    {
      id: 5,
      name: "Meeting Room 1",
      location: "Building 1, Floor 2",
      status: "online",
      resolution: "2560x1440",
      uptime: "99.9%",
      brightness: 70,
      orientation: "landscape",
      lastUpdate: "15 minutes ago",
      group: "Meeting Rooms",
    },
    {
      id: 6,
      name: "Cafeteria Display",
      location: "Cafeteria",
      status: "online",
      resolution: "1920x1080",
      uptime: "97.8%",
      brightness: 90,
      orientation: "landscape",
      lastUpdate: "45 minutes ago",
      group: "Common Areas",
    },
  ])

  const [selectedDisplay, setSelectedDisplay] = useState<Display | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string[]>(["online", "offline"])

  const handleEditDisplay = (display: Display) => {
    console.log("[v0] Editing display:", display)
    setSelectedDisplay(display)
    setIsModalOpen(true)
  }

  const handleSaveDisplay = (updatedDisplay: Display) => {
    console.log("[v0] Saving display:", updatedDisplay)
    setDisplays(displays.map((d) => (d.id === updatedDisplay.id ? updatedDisplay : d)))
    setIsModalOpen(false)
  }

  const handleDeleteDisplay = (id: number) => {
    console.log("[v0] Deleting display:", id)
    setDisplays(displays.filter((d) => d.id !== id))
    setIsModalOpen(false)
  }

  const handleAddDisplay = () => {
    console.log("[v0] Adding new display")
    const newDisplay: Display = {
      id: Date.now(),
      name: "New Display",
      location: "Location",
      status: "offline",
      resolution: "1920x1080",
      uptime: "0%",
      brightness: 50,
      orientation: "landscape",
      lastUpdate: "Just now",
      group: "New",
    }
    setSelectedDisplay(newDisplay)
    setIsModalOpen(true)
  }

  const toggleFilter = (status: string) => {
    console.log("[v0] Toggling filter:", status)
    setFilterStatus((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const filteredDisplays = displays.filter((d) => filterStatus.includes(d.status))

  const user = { email: "user@example.com", companyName: "My Company" }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Display Management</h1>
            <p className="text-muted-foreground mt-1">Manage and configure all your displays</p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent hover:bg-muted">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={filterStatus.includes("online")}
                  onCheckedChange={() => toggleFilter("online")}
                >
                  Online
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={filterStatus.includes("offline")}
                  onCheckedChange={() => toggleFilter("offline")}
                >
                  Offline
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleAddDisplay} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Display
            </Button>
          </div>
        </div>

        <DisplayList displays={filteredDisplays} onEdit={handleEditDisplay} onDelete={handleDeleteDisplay} />

        {selectedDisplay && (
          <DisplayDetailsModal
            display={selectedDisplay}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveDisplay}
            onDelete={handleDeleteDisplay}
          />
        )}
      </main>
    </div>
  )
}
