import { useState, useEffect } from 'react'
import { Schedule } from '@/lib/types'
import {
  createSchedule,
  getUserSchedules,
  updateSchedule,
  deleteSchedule,
  createActivity,
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
      
      // Log schedule creation
      await createActivity(userId, {
        type: 'schedule',
        action: 'Schedule Created',
        description: `Created schedule "${scheduleData.name}"`,
        metadata: { scheduleName: scheduleData.name, displayIds: scheduleData.displayIds }
      })
      
      return newSchedule
    } catch (err) {
      console.error('Error adding schedule:', err)
      setError('Failed to add schedule')
      
      // Log error
      await createActivity(userId, {
        type: 'system',
        action: 'Schedule Create Error',
        description: `Failed to create schedule: ${err}`,
        metadata: { error: String(err) }
      }).catch(console.error)
      
      throw err
    }
  }

  const editSchedule = async (id: string, data: Partial<Schedule>) => {
    if (!userId) throw new Error('User not authenticated')
    
    try {
      await updateSchedule(id, data)
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === id ? { ...schedule, ...data } : schedule
        )
      )
      
      // Log schedule update
      await createActivity(userId, {
        type: 'schedule',
        action: 'Schedule Updated',
        description: `Updated schedule "${data.name || 'Unnamed'}"`,
        metadata: { scheduleName: data.name, scheduleId: id }
      })
    } catch (err) {
      console.error('Error updating schedule:', err)
      setError('Failed to update schedule')
      
      // Log error
      await createActivity(userId, {
        type: 'system',
        action: 'Schedule Update Error',
        description: `Failed to update schedule: ${err}`,
        metadata: { error: String(err), scheduleId: id }
      }).catch(console.error)
      
      throw err
    }
  }

  const removeSchedule = async (id: string) => {
    if (!userId) throw new Error('User not authenticated')
    
    try {
      const schedule = schedules.find(s => s.id === id)
      await deleteSchedule(id)
      setSchedules((prev) => prev.filter((schedule) => schedule.id !== id))
      
      // Log schedule deletion
      await createActivity(userId, {
        type: 'schedule',
        action: 'Schedule Deleted',
        description: `Deleted schedule "${schedule?.name || id}"`,
        metadata: { scheduleName: schedule?.name, scheduleId: id }
      })
    } catch (err) {
      console.error('Error deleting schedule:', err)
      setError('Failed to delete schedule')
      
      // Log error
      await createActivity(userId, {
        type: 'system',
        action: 'Schedule Delete Error',
        description: `Failed to delete schedule: ${err}`,
        metadata: { error: String(err), scheduleId: id }
      }).catch(console.error)
      
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
