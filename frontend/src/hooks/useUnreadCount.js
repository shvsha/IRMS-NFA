import { useState, useEffect } from 'react'
import api from '@/api/axios'

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/notification/notifications/')
        const unread = res.data.filter(n => !n.read).length
        setUnreadCount(unread)
      } catch {
        setUnreadCount(0)
      }
    }
    fetch()
  }, [])

  return unreadCount
}