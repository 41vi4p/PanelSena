import { useState, useEffect } from 'react'
import { Schedule } from '@/lib/types'
import {
  createSchedule,
  getUserSchedules,
  updateSchedule,
  deleteSchedule,
} from '@/lib/firestore'

export function useSchedules(userId: string | undefined) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const loadSchedules = async () => {
      setLoading(true)
      try {
        const data = await getUserSchedules(userId)
        setSchedules(data)
      } catch (err) {
        console.error('Error loading schedules:', err)
        setError('Failed to load schedules')
      } finally {
        setLoading(false)
      }
    }

    loadSchedules()
  }, [userId])

  const addSchedule = async (scheduleData: Partial<Schedule>) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const newSchedule = await createSchedule(userId, scheduleData)
      setSchedules((prev) => [newSchedule, ...prev])
      return newSchedule
    } catch (err) {
      console.error('Error adding schedule:', err)
      setError('Failed to add schedule')
      throw err
    }
  }

  const editSchedule = async (id: string, data: Partial<Schedule>) => {
    try {
      await updateSchedule(id, data)
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === id ? { ...schedule, ...data } : schedule
        )
      )
    } catch (err) {
      console.error('Error updating schedule:', err)
      setError('Failed to update schedule')
      throw err
    }
  }

  const removeSchedule = async (id: string) => {
    try {
      await deleteSchedule(id)
      setSchedules((prev) => prev.filter((schedule) => schedule.id !== id))
    } catch (err) {
      console.error('Error deleting schedule:', err)
      setError('Failed to delete schedule')
      throw err
    }
  }

  return {
    schedules,
    loading,
    error,
    addSchedule,
    editSchedule,
    removeSchedule,
  }
}
