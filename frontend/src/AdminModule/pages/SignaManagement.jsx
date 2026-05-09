// react
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Header from '../../components/Header'
import SignatoryForm from './SignaForm'

// for notif
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { getNotifRoute } from '@/utils/getNotifRoute'
import { useUnreadCount } from '@/hooks/useUnreadCount'

// shadcn
import { Dialog, DialogContent, DialogHeader, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// icons
import { FaCheck, FaUserTimes } from "react-icons/fa"
import { SquarePen, UserX, UserRoundCheck, UserPlus } from "lucide-react"
import { CiUser } from "react-icons/ci"

const SIGNATORY_ROLES = [
  'Asst. Branch Manager',
  'Accountant 3',
  'Branch Manager',
]

export default function SignaManagement() {
  // for notif
  const user       = useCurrentUser()
  const notifRoute = getNotifRoute(user)
  const userName   = user ? `${user.fname} ${user.lname}` : 'User'
  const unreadCount = useUnreadCount()

  const [signatories, setSignatories] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView]  = useState('list') 
  const [selectedRole, setSelectedRole] = useState(null) 
  const [selectedUser, setSelectedUser] = useState(null) 

  // dialog states
  const [deactivateDialog, setDeactivateDialog] = useState({ open: false, user: null })
  const [reactivateDialog, setReactivateDialog] = useState({ open: false, user: null })
  const [toasts, setToasts] = useState([])

  const addToast = (message, color = '#1D8104') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, color }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  const fetchSignatories = () => {
    setLoading(true)
    api.get('/api/users/signatories/')
      .then(res => setSignatories(res.data))
      .catch(err => console.error('Failed to fetch signatories', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSignatories() }, [])

  // Get the currently active signatory for a given role
  const getActiveForRole = (role) =>
    signatories.find(s => s.signatory_role === role && s.status === 'Active') ?? null

  // Get history (inactive) for a role
  const getHistoryForRole = (role) =>
    signatories.filter(s => s.signatory_role === role && s.status === 'Inactive')

  const handleDeactivate = async () => {
    const { user } = deactivateDialog
    try {
      await api.patch(`/api/users/signatories/${user.user_id}/`, { status: 'Inactive' })
      setSignatories(prev => prev.map(s =>
        s.user_id === user.user_id ? { ...s, status: 'Inactive' } : s
      ))
      setDeactivateDialog({ open: false, user: null })
      addToast(`${user.fname} ${user.lname} successfully deactivated.`)
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to deactivate.'
      addToast(msg, '#BB2325')
      setDeactivateDialog({ open: false, user: null })
    }
  }

  const handleReactivate = async () => {
    const { user } = reactivateDialog
    try {
      await api.patch(`/api/users/signatories/${user.user_id}/`, { status: 'Active' })
      setSignatories(prev => prev.map(s =>
        s.user_id === user.user_id ? { ...s, status: 'Active' } : s
      ))
      setReactivateDialog({ open: false, user: null })
      addToast(`${user.fname} ${user.lname} successfully reactivated.`)
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to reactivate.'
      addToast(msg, '#BB2325')
      setReactivateDialog({ open: false, user: null })
    }
  }

  const handleBack = () => {
    setView('list')
    setSelectedRole(null)
    setSelectedUser(null)
    fetchSignatories()
  }

  // Route to form views
  if (view === 'add')  return <SignatoryForm mode="add"  role={selectedRole}  onCancel={handleBack} />
  if (view === 'edit') return <SignatoryForm mode="edit" signatoryData={selectedUser} onCancel={handleBack} />

  return (
    <>
      <Header 
        pageTitle="Signatory" 
        unreadCount={unreadCount} 
        notifTo={notifRoute}
        userName={userName}
      />

      <div className="mx-4 my-4 pb-10 flex flex-col !min-h-[650px]">

        {/* header */}
        <div className="py-4 pt-1">
          <p className="text-[#2D317F] font-semibold text-xl">Signatory Management</p>
        </div>

        {/* 3 cards */}
        {loading ? (
          <div className="flex items-center justify-center h-64 text-[#2D317F]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading signatories...</span>
            </div>
          </div>
        ) : (
          <div className="flex gap-6">
            {SIGNATORY_ROLES.map(role => {
              const active  = getActiveForRole(role)
              const history = getHistoryForRole(role)
              const isEmpty = !active

              return (
                <div
                  key={role}
                  className="flex-1 rounded-lg bg-[#F5F9F9] shadow-[0_0_8px_rgba(0,0,0,0.12)] border border-black/5 flex flex-col overflow-hidden"
                >
                  {/* Card header */}
                  <div className="bg-[#2D317F] px-5 py-3">
                    <p className="text-white font-bold text-sm tracking-wide">{role}</p>
                  </div>

                  {/* Card body */}
                  <div className="flex flex-col flex-1 px-5 py-4 gap-4">

                    {/* Active signatory */}
                    {active ? (
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-4 flex flex-col gap-3">

                        {/* Signature preview */}
                        <div className="flex justify-center items-center h-24 bg-[#F5F9F9] rounded border border-dashed border-gray-300">
                          {active.e_signature ? (
                            <img
                              src={active.e_signature_url}
                              alt="e-signature"
                              className="max-h-20 object-contain"
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">No e-signature uploaded</span>
                          )}
                        </div>

                        {/* Info */}
                        <div>
                          <p className="font-semibold text-[#2D317F] text-sm">
                            {active.fname} {active.mI ? `${active.mI}. ` : ''}{active.lname}
                          </p>
                          <p className="text-xs text-gray-500">{active.position || active.signatory_role}</p>
                          <p className="text-xs text-gray-400">{active.email}</p>
                        </div>

                        {/* Status badge */}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-[#1D8104] w-fit">
                          <CiUser className="w-3.5 h-3.5" /> Active
                        </span>

                        {/* Actions */}
                        <div className="flex gap-2 mt-1">
                          <Button
                            onClick={() => { setSelectedUser(active); setView('edit') }}
                            variant="ghost"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 h-auto bg-transparent text-[#2D317F] border border-[#2D317F] rounded-full text-xs font-medium"
                          >
                            <SquarePen className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button
                            onClick={() => setDeactivateDialog({ open: true, user: active })}
                            variant="ghost"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 h-auto bg-transparent text-[#BB2325] border border-[#BB2325] rounded-full text-xs font-medium hover:bg-red-50"
                          >
                            <UserX className="w-3.5 h-3.5" /> Deactivate
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg border border-dashed border-gray-300 px-4 py-6 flex flex-col items-center gap-2 text-center">
                        <CiUser className="w-10 h-10 text-gray-300" />
                        <p className="text-gray-400 text-xs">No active {role}</p>
                      </div>
                    )}

                    {/* Add New button when no signatory */}
                    {isEmpty && (
                      <Button
                        onClick={() => { setSelectedRole(role); setView('add') }}
                        className="w-full flex items-center justify-center gap-2 bg-[#2D317F] text-white rounded-lg text-xs py-2 h-auto"
                      >
                        <UserPlus className="w-4 h-4" /> Add New {role}
                      </Button>
                    )}

                    {/* History — inactive signatories for this role */}
                    {history.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs font-semibold text-gray-400 tracking-widest mb-2">PREVIOUS</p>
                        <div className="flex flex-col gap-2">
                          {history.map(s => (
                            <div
                              key={s.user_id}
                              className="bg-white rounded-lg border border-gray-200 px-3 py-3 flex items-center justify-between gap-2"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-600 truncate">
                                  {s.fname} {s.mI ? `${s.mI}. ` : ''}{s.lname}
                                </p>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-[#BB2325] mt-0.5">
                                  <CiUser className="w-3 h-3" /> Inactive
                                </span>
                              </div>
                              {/* Reactivate only if no current active for this role */}
                              {isEmpty && (
                                <Button
                                  onClick={() => setReactivateDialog({ open: true, user: s })}
                                  variant="ghost"
                                  className="flex items-center gap-1 px-2 py-1 h-auto bg-transparent text-[#1D8104] border border-[#1D8104] rounded-full text-[10px] font-medium shrink-0"
                                >
                                  <UserRoundCheck className="w-3 h-3" /> Reactivate
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Deactivate Dialog */}
      <Dialog open={deactivateDialog.open} onOpenChange={() => setDeactivateDialog({ open: false, user: null })}>
        <DialogContent className="bg-[#F8F8F8] [&>button]:hidden px-0 !pt-0 !max-w-[400px] shadow-2xl">
          <div className="bg-[#BB2325] py-3 rounded-t-lg" />
          <div className="bg-[#BB2325] py-5 rounded-full flex justify-center mx-38 mb-3 mt-5">
            <FaUserTimes className="w-12 h-12" color="white" />
          </div>
          <DialogHeader>
            <div className="text-center">
              <p className="text-[#BB2325] font-bold text-xl">Deactivate Signatory</p>
              <p className="text-sm mx-5 mt-2 text-[#051F52]">
                Are you sure you want to deactivate{' '}
                <strong>{deactivateDialog.user?.fname} {deactivateDialog.user?.lname}</strong>?
                You can add a new signatory or reactivate them afterwards.
              </p>
            </div>
            <DialogDescription className="flex flex-col gap-5">
              <div className="flex justify-center gap-3 mt-6 mb-5">
                <Button variant="ghost" onClick={() => setDeactivateDialog({ open: false, user: null })}
                  className="px-7 py-4.5 rounded-md bg-[#D9D9D9] text-black font-medium hover:bg-gray-300">
                  Cancel
                </Button>
                <Button onClick={handleDeactivate}
                  className="px-7 py-4.5 rounded-md bg-[#BB2325] text-white font-medium hover:bg-red-700">
                  Deactivate
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Reactivate Dialog */}
      <Dialog open={reactivateDialog.open} onOpenChange={() => setReactivateDialog({ open: false, user: null })}>
        <DialogContent className="bg-[#F8F8F8] [&>button]:hidden px-0 !pt-0 !max-w-[400px] shadow-2xl">
          <div className="bg-[#1D8104] py-3 rounded-t-lg" />
          <div className="bg-[#1D8104] py-5 rounded-full flex justify-center mx-38 mb-3 mt-5">
            <UserRoundCheck className="w-12 h-12" color="white" />
          </div>
          <DialogHeader>
            <div className="text-center">
              <p className="text-[#1D8104] font-bold text-xl">Reactivate Signatory</p>
              <p className="text-sm mx-5 mt-2 text-[#051F52]">
                Are you sure you want to reactivate{' '}
                <strong>{reactivateDialog.user?.fname} {reactivateDialog.user?.lname}</strong>?
              </p>
            </div>
            <DialogDescription className="flex flex-col gap-5">
              <div className="flex justify-center gap-3 mt-6 mb-5">
                <Button variant="ghost" onClick={() => setReactivateDialog({ open: false, user: null })}
                  className="px-7 py-4.5 rounded-md bg-[#D9D9D9] text-black font-medium hover:bg-gray-300">
                  Cancel
                </Button>
                <Button onClick={handleReactivate}
                  className="px-7 py-4.5 rounded-md bg-[#1D8104] text-white font-medium hover:bg-green-700">
                  Reactivate
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div key={toast.id} className="flex items-center gap-3 bg-white rounded-lg shadow-2xl px-5 py-4 min-w-[300px]"
            style={{ borderLeft: `4px solid ${toast.color}` }}>
            <div className="rounded-full p-1.5 flex-shrink-0" style={{ backgroundColor: toast.color }}>
              <FaCheck size={16} color="white" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: toast.color }}>
                {toast.color === '#BB2325' ? 'Error!' : 'Success!'}
              </p>
              <p className="text-gray-500 text-xs">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}