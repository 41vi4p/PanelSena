import { useState, useEffect } from 'react'
import { Display } from '@/lib/types'
import {
  createDisplay,
  updateDisplay,
  deleteDisplay,
  subscribeToDisplays,
} from '@/lib/firestore'

export function useDisplays(userId: string | undefined) {
  const [displays, setDisplays] = useState<Display[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)

    // Subscribe to realtime updates
    const unsubscribe = subscribeToDisplays(userId, (updatedDisplays) => {
      setDisplays(updatedDisplays)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [userId])

  const addDisplay = async (displayData: Partial<Display>) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const newDisplay = await createDisplay(userId, displayData)
      return newDisplay
    } catch (err) {
      console.error('Error adding display:', err)
      setError('Failed to add display')
      throw err
    }
  }

  const editDisplay = async (id: string, data: Partial<Display>) => {
    try {
      await updateDisplay(id, data)
    } catch (err) {
      console.error('Error updating display:', err)
      setError('Failed to update display')
      throw err
    }
  }

  const removeDisplay = async (id: string) => {
    try {
      await deleteDisplay(id)
    } catch (err) {
      console.error('Error deleting display:', err)
      setError('Failed to delete display')
      throw err
    }
  }

  return {
    displays,
    loading,
    error,
    addDisplay,
    editDisplay,
    removeDisplay,
  }
}
