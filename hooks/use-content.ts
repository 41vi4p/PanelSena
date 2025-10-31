import { useState, useEffect } from 'react'
import { ContentItem } from '@/lib/types'
import {
  createContent,
  updateContent,
  deleteContent,
  subscribeToContent,
} from '@/lib/firestore'
import { uploadFile, deleteFile, UploadProgress } from '@/lib/storage'

export function useContent(userId: string | undefined) {
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({})

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)

    // Subscribe to realtime updates
    const unsubscribe = subscribeToContent(userId, (updatedContent) => {
      setContent(updatedContent)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  const uploadContent = async (
    file: File,
    category: string,
    type: 'image' | 'video' | 'document'
  ) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const fileId = `${Date.now()}_${file.name}`

      // Upload file to storage with progress tracking
      const folder = type === 'image' ? 'images' : type === 'video' ? 'videos' : 'documents'

      const uploadResult = await uploadFile(file, userId, folder, (progress) => {
        setUploadProgress((prev) => ({
          ...prev,
          [fileId]: progress,
        }))
      })

      // Create content metadata in Firestore
      const contentData: Partial<ContentItem> = {
        name: file.name,
        type,
        size: formatFileSize(file.size),
        sizeBytes: file.size,
        uploadDate: new Date().toISOString(),
        category,
        url: uploadResult.url,
        storageRef: uploadResult.storageRef,
      }

      const newContent = await createContent(userId, contentData)

      // Clear upload progress
      setUploadProgress((prev) => {
        const newProgress = { ...prev }
        delete newProgress[fileId]
        return newProgress
      })

      return newContent
    } catch (err) {
      console.error('Error uploading content:', err)
      setError('Failed to upload content')
      throw err
    }
  }

  const removeContent = async (contentItem: ContentItem) => {
    try {
      // Delete file from storage
      await deleteFile(contentItem.storageRef)

      // Delete metadata from Firestore
      await deleteContent(contentItem.id)
    } catch (err) {
      console.error('Error deleting content:', err)
      setError('Failed to delete content')
      throw err
    }
  }

  const editContent = async (id: string, data: Partial<ContentItem>) => {
    try {
      await updateContent(id, data)
    } catch (err) {
      console.error('Error updating content:', err)
      setError('Failed to update content')
      throw err
    }
  }

  return {
    content,
    loading,
    error,
    uploadProgress,
    uploadContent,
    removeContent,
    editContent,
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
