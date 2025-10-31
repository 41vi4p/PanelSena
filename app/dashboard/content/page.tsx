"use client"

import { useState } from "react"
import { ContentLibrary } from "@/components/content-library"
import { ContentUpload } from "@/components/content-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, VideoIcon, FileTextIcon } from "lucide-react"

interface ContentItem {
  id: number
  name: string
  type: "image" | "video" | "document"
  size: string
  uploadDate: string
  category: string
  thumbnail?: string
}

export default function ContentPage() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: 1,
      name: "Welcome Banner.jpg",
      type: "image",
      size: "2.4 MB",
      uploadDate: "2 days ago",
      category: "Marketing",
      thumbnail: "/welcome-banner.png",
    },
    {
      id: 2,
      name: "Product Demo.mp4",
      type: "video",
      size: "45.2 MB",
      uploadDate: "1 week ago",
      category: "Promotions",
      thumbnail: "/product-demo-video.png",
    },
    {
      id: 3,
      name: "Company Info.pdf",
      type: "document",
      size: "1.8 MB",
      uploadDate: "3 days ago",
      category: "Information",
    },
    {
      id: 4,
      name: "Event Poster.jpg",
      type: "image",
      size: "3.1 MB",
      uploadDate: "5 days ago",
      category: "Events",
      thumbnail: "/event-poster.png",
    },
    {
      id: 5,
      name: "Announcement.mp4",
      type: "video",
      size: "28.5 MB",
      uploadDate: "1 week ago",
      category: "Announcements",
      thumbnail: "/announcement-video.jpg",
    },
    {
      id: 6,
      name: "Menu Board.jpg",
      type: "image",
      size: "1.9 MB",
      uploadDate: "4 days ago",
      category: "Menus",
      thumbnail: "/menu-board.jpg",
    },
  ])

  const [activeTab, setActiveTab] = useState("library")

  const handleUpload = (newContent: ContentItem) => {
    setContentItems([...contentItems, newContent])
  }

  const handleDelete = (id: number) => {
    setContentItems(contentItems.filter((item) => item.id !== id))
  }

  const imageCount = contentItems.filter((item) => item.type === "image").length
  const videoCount = contentItems.filter((item) => item.type === "video").length
  const documentCount = contentItems.filter((item) => item.type === "document").length

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Content Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">Upload and organize content for your displays</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <ImageIcon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Images</p>
                <p className="text-2xl font-bold text-foreground">{imageCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <VideoIcon className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Videos</p>
                <p className="text-2xl font-bold text-foreground">{videoCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <FileTextIcon className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold text-foreground">{documentCount}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Content Library</TabsTrigger>
            <TabsTrigger value="upload">Upload Content</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-6">
            <ContentLibrary items={contentItems} onDelete={handleDelete} />
          </TabsContent>

          <TabsContent value="upload" className="mt-6">
            <ContentUpload onUpload={handleUpload} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
