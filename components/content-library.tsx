"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ImageIcon, Video, FileText, Trash2, Download, Eye } from "lucide-react"

interface ContentItem {
  id: number
  name: string
  type: "image" | "video" | "document"
  size: string
  uploadDate: string
  category: string
  thumbnail?: string
}

interface ContentLibraryProps {
  items: ContentItem[]
  onDelete: (id: number) => void
}

export function ContentLibrary({ items, onDelete }: ContentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(items.map((item) => item.category)))

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-5 h-5 text-blue-500" />
      case "video":
        return <Video className="w-5 h-5 text-purple-500" />
      case "document":
        return <FileText className="w-5 h-5 text-amber-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Input
          placeholder="Search content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-input border-border"
        />

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="border-border overflow-hidden hover:border-primary/50 transition-colors">
            {item.thumbnail && (
              <div className="relative w-full h-40 bg-muted overflow-hidden">
                <img
                  src={item.thumbnail || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Eye className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {!item.thumbnail && (
              <div className="w-full h-40 bg-muted flex items-center justify-center">{getTypeIcon(item.type)}</div>
            )}

            <CardContent className="p-4 space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate flex-1">{item.name}</h3>
                  <div className="flex-shrink-0">{getTypeIcon(item.type)}</div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {item.category}
                </Badge>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Size: {item.size}</p>
                <p>Uploaded: {item.uploadDate}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive bg-transparent"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No content found</p>
        </div>
      )}
    </div>
  )
}
