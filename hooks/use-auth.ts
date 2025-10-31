import { useState, useEffect } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChange, getUserProfile, UserProfile } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid)
          setUserProfile(profile)
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { user, userProfile, loading }
}
