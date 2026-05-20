// react
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Header from '../../components/Header'
import SignatoryForm from './SignaForm'

// notif
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { getNotifRoute } from '@/utils/Import & Export/getNotifRoute'
import { useUnreadCount } from '@/hooks/useUnreadCount'

// toast
import { useToast } from '@/hooks/useToast'
import { Toast } from '@/components/Toast'

// shadcn
import { Dialog, DialogContent, DialogHeader, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// icons
import { FaUserTimes } from "react-icons/fa"
import { SquarePen, UserX, UserRoundCheck, UserPlus } from "lucide-react"
import { CiUser } from "react-icons/ci"

const SIGNATORY_ROLES = [
  'Asst. Branch Manager',
  'Accountant 3',
  'Branch Manager',
]

const COLOR = {
  primary: '#2D317F',
  success: '#1D8104',
  danger:  '#BB2325',
  dark:    '#051F52',
}

function ConfirmDialog({ open, onClose, onConfirm, isSubmitting, color, icon: Icon, title, description, confirmLabel }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#F8F8F8] [&>button]:hidden px-0 !pt-0 !max-w-[320px] shadow-2xl">
        <div className="py-3 rounded-t-lg" style={{ backgroundColor: color }} />
        <div className="py-4 rounded-full flex justify-center mx-31 mb-1.5 mt-3" style={{ backgroundColor: color }}>
          <Icon className="w-9 h-9" color="white" />
        </div>
        <DialogHeader>
          <div className="text-center">
            <p className="font-bold text-[20px]" style={{ color }}>{title}</p>
            <p className="text-[12px] mx-5 mt-0.5" style={{ color: COLOR.dark }}>{description}</p>
          </div>
          <DialogDescription className="flex flex-col gap-5">
            <div className="flex justify-center gap-3 mt-3 mb-3">
              <Button
                variant="ghost"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-3 py-4 rounded-md bg-[#D9D9D9] text-black font-medium hover:bg-gray-300"
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={onConfirm}
                className="px-3 py-4 rounded-md text-white font-medium disabled:opacity-50"
                style={{ backgroundColor: color }}
              >
                {isSubmitting ? 'Saving…' : confirmLabel}
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

/** Displays the active signatory card with edit and deactivate actions */
function ActiveSignatoryCard({ active, onEdit, onDeactivate }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-4 py-4 flex flex-col gap-3">

      {/* Signature preview */}
      <div className="flex justify-center items-center h-24 bg-[#F5F9F9] rounded border border-dashed border-gray-300">
        {active.e_signature ? (
          <img src={active.e_signature_url} alt="e-signature" className="max-h-20 object-contain" />
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
          onClick={onEdit}
          variant="ghost"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 h-auto bg-transparent text-[#2D317F] border border-[#2D317F] rounded-full text-xs font-medium"
        >
          <SquarePen className="w-3.5 h-3.5" /> Edit
        </Button>
        <Button
          onClick={onDeactivate}
          variant="ghost"
          className="flex-1 flex items-center justify-center gap-1.5 py-2 h-auto bg-transparent text-[#BB2325] border border-[#BB2325] rounded-full text-xs font-medium hover:bg-red-50"
        >
          <UserX className="w-3.5 h-3.5" /> Deactivate
        </Button>
      </div>
    </div>
  )
}

/** Displays the list of previous (inactive) signatories for a role */
function SignatoryHistoryList({ history, canReactivate, onReactivate }) {
  return (
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
            {/* Reactivate only if no current active signatory for this role */}
            {canReactivate && (
              <Button
                onClick={() => onReactivate(s)}
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
  )
}

export default function SignaManagement() {
  // notif
  const currentUser  = useCurrentUser()
  const notifRoute   = getNotifRoute(currentUser)
  const userName     = currentUser ? `${currentUser.fname} ${currentUser.lname}` : 'User'
  const unreadCount  = useUnreadCount()

  // toast
  const { toasts, addToast } = useToast()

  const [signatories, setSignatories] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [view,        setView]        = useState('list')
  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)

  // dialog state
  const [deactivateDialog, setDeactivateDialog] = useState({ open: false, user: null })
  const [reactivateDialog, setReactivateDialog] = useState({ open: false, user: null })
  const [isSubmitting,     setIsSubmitting]     = useState(false)

  const fetchSignatories = () => {
    setLoading(true)
    api.get('/api/users/signatories/')
      .then(res => setSignatories(res.data))
      .catch(err => {
        console.error('Failed to fetch signatories:', err)
        addToast('Failed to load signatories. Please try again.', 'error')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSignatories() }, [])

  /** Returns the currently active signatory for a given role */
  const getActiveForRole  = (role) => signatories.find(s => s.signatory_role === role && s.status === 'Active') ?? null

  /** Returns all inactive signatories for a given role */
  const getHistoryForRole = (role) => signatories.filter(s => s.signatory_role === role && s.status === 'Inactive')

  const handleDeactivate = async () => {
    const target = deactivateDialog.user
    setIsSubmitting(true)
    try {
      await api.patch(`/api/users/signatories/${target.user_id}/`, { status: 'Inactive' })
      setSignatories(prev => prev.map(s =>
        s.user_id === target.user_id ? { ...s, status: 'Inactive' } : s
      ))
      addToast(`${target.fname} ${target.lname} successfully deactivated.`, 'success')
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to deactivate. Please try again.'
      addToast(msg, 'error')
    } finally {
      setIsSubmitting(false)
      setDeactivateDialog({ open: false, user: null })
    }
  }

  const handleReactivate = async () => {
    const target = reactivateDialog.user
    setIsSubmitting(true)
    try {
      await api.patch(`/api/users/signatories/${target.user_id}/`, { status: 'Active' })
      setSignatories(prev => prev.map(s =>
        s.user_id === target.user_id ? { ...s, status: 'Active' } : s
      ))
      addToast(`${target.fname} ${target.lname} successfully reactivated.`, 'success')
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to reactivate. Please try again.'
      addToast(msg, 'error')
    } finally {
      setIsSubmitting(false)
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
  if (view === 'add')  return <SignatoryForm mode="add"  role={selectedRole}   onCancel={handleBack} />
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

        {/* Page title */}
        <div className="py-4 pt-1">
          <p className="text-[#2D317F] font-semibold text-xl">Signatory Management</p>
        </div>

        {/* Cards */}
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

                    {/* Active signatory card or empty state */}
                    {active ? (
                      <ActiveSignatoryCard
                        active={active}
                        onEdit={() => { setSelectedUser(active); setView('edit') }}
                        onDeactivate={() => setDeactivateDialog({ open: true, user: active })}
                      />
                    ) : (
                      <div className="bg-white rounded-lg border border-dashed border-gray-300 px-4 py-6 flex flex-col items-center gap-2 text-center">
                        <CiUser className="w-10 h-10 text-gray-300" />
                        <p className="text-gray-400 text-xs">No active {role}</p>
                      </div>
                    )}

                    {/* Add New button — only shown when slot is empty */}
                    {isEmpty && (
                      <Button
                        onClick={() => { setSelectedRole(role); setView('add') }}
                        className="w-full flex items-center justify-center gap-2 bg-[#2D317F] text-white rounded-lg text-xs py-2 h-auto"
                      >
                        <UserPlus className="w-4 h-4" /> Add New {role}
                      </Button>
                    )}

                    {/* Previous (inactive) signatories */}
                    {history.length > 0 && (
                      <SignatoryHistoryList
                        history={history}
                        canReactivate={isEmpty}
                        onReactivate={(s) => setReactivateDialog({ open: true, user: s })}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Deactivate confirmation dialog */}
      <ConfirmDialog
        open={deactivateDialog.open}
        onClose={() => setDeactivateDialog({ open: false, user: null })}
        onConfirm={handleDeactivate}
        isSubmitting={isSubmitting}
        color={COLOR.danger}
        icon={FaUserTimes}
        title="Deactivate Signatory"
        description={
          deactivateDialog.user
            ? `Are you sure you want to deactivate ${deactivateDialog.user.fname} ${deactivateDialog.user.lname}? You can add a new signatory or reactivate them afterwards.`
            : ''
        }
        confirmLabel="Deactivate"
      />

      {/* Reactivate confirmation dialog */}
      <ConfirmDialog
        open={reactivateDialog.open}
        onClose={() => setReactivateDialog({ open: false, user: null })}
        onConfirm={handleReactivate}
        isSubmitting={isSubmitting}
        color={COLOR.success}
        icon={UserRoundCheck}
        title="Reactivate Signatory"
        description={
          reactivateDialog.user
            ? `Are you sure you want to reactivate ${reactivateDialog.user.fname} ${reactivateDialog.user.lname}?`
            : ''
        }
        confirmLabel="Reactivate"
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} />
    </>
  )
}