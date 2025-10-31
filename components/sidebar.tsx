"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Monitor, BarChart3, FileText, Clock, Settings, HelpCircle, Menu, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  open: boolean
  onToggle: () => void
}

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: Monitor },
  { href: "/dashboard/displays", label: "Displays", icon: BarChart3 },
  { href: "/dashboard/content", label: "Content", icon: FileText },
  { href: "/dashboard/schedule", label: "Schedule", icon: Clock },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/logs", label: "Logs", icon: Activity },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/help", label: "Help & Support", icon: HelpCircle },
]

export default function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile Toggle */}
      <Button variant="ghost" size="icon" onClick={onToggle} className="fixed top-4 left-4 z-40 lg:hidden">
        <Menu className="w-5 h-5" />
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative w-64 h-screen bg-sidebar border-r border-sidebar-border/50 flex flex-col transition-transform duration-300 z-30 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-sidebar-primary to-accent rounded-lg shadow-lg">
              <Monitor className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-foreground">SmartDisplay</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-sidebar-primary to-accent text-sidebar-primary-foreground shadow-lg"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Mobile Overlay */}
        {open && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onToggle} />}
      </aside>
    </>
  )
}
