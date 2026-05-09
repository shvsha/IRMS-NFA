import { useMemo } from 'react'

export function useCurrentUser() {
  return useMemo(() => {
    try {
      const user = localStorage.getItem('user')
      if (!user) return null
      return JSON.parse(user)
    } catch {
      return null
    }
  }, [])
}