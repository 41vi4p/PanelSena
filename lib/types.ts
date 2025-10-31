// Display types
export interface Display {
  id: string
  userId: string
  name: string
  location: string
  status: "online" | "offline"
  resolution: string
  uptime: string
  brightness: number
  orientation: "landscape" | "portrait"
  lastUpdate: string
  group: string
  createdAt: string
  updatedAt: string
}

// Content types
export interface ContentItem {
  id: string
  userId: string
  name: string
  type: "image" | "video" | "document"
  size: string
  sizeBytes: number
  uploadDate: string
  category: string
  thumbnail?: string
  url: string
  storageRef: string
  createdAt: string
  updatedAt: string
}

// Schedule types
export interface Schedule {
  id: string
  userId: string
  name: string
  displayIds: string[]
  contentIds: string[]
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  repeat: "once" | "daily" | "weekly" | "monthly"
  status: "active" | "paused" | "completed"
  createdAt: string
  updatedAt: string
}

// Activity types
export interface Activity {
  id: string
  userId: string
  type: "display" | "content" | "schedule" | "system"
  action: string
  description: string
  metadata?: Record<string, any>
  timestamp: string
}

// Analytics types
export interface Analytics {
  id: string
  userId: string
  displayId?: string
  contentId?: string
  metric: string
  value: number
  timestamp: string
  date: string
}
