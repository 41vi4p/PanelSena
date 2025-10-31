"use client"

import { Monitor } from "lucide-react"

interface DashboardHeaderProps {
  user: {
    email: string
    companyName: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Monitor className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">SmartDisplay</h1>
            <p className="text-sm text-muted-foreground">{user.companyName}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
