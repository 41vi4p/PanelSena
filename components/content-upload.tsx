"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, CheckCircle, Loader2 } from "lucide-react"

interface ContentUploadProps {
  onUpload: (file: File, category: string, type: 'image' | 'video' | 'document') => Promise<void>
  uploadProgress?: number
}

export function ContentUpload({ onUpload, uploadProgress: externalProgress }: ContentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [category, setCategory] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const categories = ["Marketing", "Promotions", "Information", "Events", "Announcements", "Menus"]

  // Update progress from external source or simulate smooth progress
  useEffect(() => {
    if (!isUploading) return

    if (externalProgress !== undefined) {
      setUploadProgress(externalProgress)
    } else {
      // Simulate smooth progress when no external progress is available
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev // Stop at 90% until actual completion
          return prev + Math.random() * 10
        })
      }, 300)

      return () => clearInterval(interval)
    }
  }, [isUploading, externalProgress])

  const isValidMediaFile = (file: File): boolean => {
    // Check if file is an image or video
    return file.type.startsWith('image/') || file.type.startsWith('video/')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!isValidMediaFile(file)) {
        alert('Please select a valid media file (image or video only)')
        e.target.value = '' // Reset the input
        return
      }
      setSelectedFile(file)
      setFileName(file.name)
    }
  }

  const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    return 'document'
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (!isValidMediaFile(file)) {
        alert('Please select a valid media file (image or video only)')
        return
      }
      setSelectedFile(file)
      setFileName(file.name)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !category) {
      alert("Please select a file and category")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const fileType = getFileType(selectedFile)
      await onUpload(selectedFile, category, fileType)

      // Complete the progress
      setUploadProgress(100)

      // Wait a bit to show completion before resetting
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Reset form
      setFileName("")
      setCategory("")
      setSelectedFile(null)

      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Upload New Content</CardTitle>
          <CardDescription>Add images and videos to your content library</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
            accept="image/*,video/*"
          />
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Label htmlFor="file-input" className="cursor-pointer block">
              <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}>
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  {isDragging ? 'Drop your media file here' : 'Drag and drop your media files here'}
                </p>
                <p className="text-xs text-muted-foreground mb-4">or click to browse (Images & Videos only)</p>
                <Button variant="outline" size="sm" type="button">
                  Browse Files
                </Button>
              </div>
            </Label>
          </div>

          {fileName && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium text-foreground">{fileName}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">
                        {uploadProgress < 100 ? 'Uploading...' : 'Upload Complete!'}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-foreground">{Math.round(uploadProgress)}%</p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden relative">
                    <div
                      className="bg-primary h-full transition-all duration-500 ease-out relative"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      {uploadProgress < 100 && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                      )}
                    </div>
                  </div>
                  {uploadProgress === 100 && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <p className="text-sm font-medium">File uploaded successfully!</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleUpload} disabled={isUploading} className="flex-1">
                  {isUploading ? "Uploading..." : "Upload File"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFileName("")
                    setCategory("")
                  }}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
