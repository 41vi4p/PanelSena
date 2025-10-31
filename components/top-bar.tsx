"use client"

import { Button } from "@/components/ui/button"
import { Bell, LogOut, User, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

interface TopBarProps {
  user: any
  onMenuClick: () => void
}

export default function TopBar({ user, onMenuClick }: TopBarProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("user")
    window.location.href = "/"
  }

  const handleSettingsClick = () => {
    router.push("/dashboard/settings")
  }

  return (
    <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-foreground">{user?.companyName || "Dashboard"}</h2>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSettingsClick}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2 pl-4 border-l border-border/50">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">{user?.email?.split("@")[0]}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
