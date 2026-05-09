import React from 'react'

import Header from '@/components/Header'

// for notif
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { getNotifRoute } from '@/utils/getNotifRoute'
import { useUnreadCount } from '@/hooks/useUnreadCount'

export default function PileLayout() {
  // for notif
  const user       = useCurrentUser()
  const notifRoute = getNotifRoute(user)
  const userName   = user ? `${user.fname} ${user.lname}` : 'User'
  const unreadCount = useUnreadCount()

  return (
    <>
      <Header
        pageTitle="Pile Layout"
        notifTo={notifRoute}
        userName={userName}
        unreadCount={unreadCount}
      />


      <div className='flex justify-center items-center h-full text-2xl'>Pile Layout</div>
    </>
  )
}
