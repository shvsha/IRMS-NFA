export function getNotifRoute(user) {
  if (!user) return '/notif'

  const level = user.user_level
  const role  = user.signatory_role

  if (level === 'Admin')                return '/admin/notif'
  if (level === 'Warehouse Supervisor') return '/whse/notif'
  if (level === 'Signatory')            return '/signa/notif'

  return '/notif'
}