export function formatActivityTime(dateStr, timeStr) {
  if (!dateStr) return ''
  const today = new Date().toISOString().split('T')[0]
  const d = new Date(`${today}T${timeStr}Z`)
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${dateStr} ${time}`
}

export function getActivityColor(action) {
  if (!action) return 'bg-gray-400'
  const a = action.toLowerCase()
  if (a.includes('approved'))                          return 'bg-green-500'
  if (a.includes('rejected'))                          return 'bg-red-500'
  if (a.includes('deleted'))                           return 'bg-red-400'
  if (a.includes('exported') || a.includes('imported')) return 'bg-[#1a2f6f]'
  if (a.includes('created'))                           return 'bg-blue-500'
  if (a.includes('submitted'))                         return 'bg-yellow-500'
  return 'bg-gray-400'
}