// react icons
import { FaRegFileAlt } from 'react-icons/fa'
import { FaCircleXmark, FaCircleCheck } from 'react-icons/fa6'
import { FaCheck } from 'react-icons/fa'
import { TbXboxX } from 'react-icons/tb'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Header from '../Header'
import api from '@/api/axios'

// for notif
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { getNotifRoute } from '@/utils/Import & Export/getNotifRoute'

// shadcn components
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'

// ── helpers 
function formatTime(timeStr) {
  if (!timeStr) return '—'
  const today = new Date().toISOString().split('T')[0]
  const date = new Date(`${today}T${timeStr}Z`)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getReportTitle(notif) {
  if (notif.report_type === 'WSR') return 'Statement of Daily Warehouse Receipt'
  if (notif.report_type === 'WSI') return 'Statement of Daily Warehouse Issue'
  return 'Warehouse Report'
}

function getReportNumber(notif) {
  if (notif.report_type === 'WSR') return `WSR# ${notif.report_id}`
  if (notif.report_type === 'WSI') return `WSI# ${notif.report_id}`
  return `Report# ${notif.report_id}`
}

function getEvalRoute(user) {
  const level = user?.user_level
  const role  = user?.signatory_role
  if (level === 'Admin') return '/admin/evaluation'
  if (level === 'Signatory') {
    if (role === 'Asst. Branch Manager') return '/signa/evaluation'
    if (role === 'Accountant 3')         return '/signa/evaluation'
    if (role === 'Branch Manager')       return '/signa/evaluation'
  }
  return '/admin/evaluation'
}

function getStageMessage(notif) {
  if (!notif) return '' 

  const reviewer = notif.reviewed_by_name ?? '—'
  const eval_    = notif.snapshot_evaluation
  const stage    = notif.snapshot_stage

  if (eval_ === 'Rejected') {
    const reason = notif.reason_text && notif.reason_text !== '-'
      ? notif.reason_text
      : 'No reason provided.'
    return `Your report was rejected by ${reviewer}. Reason: ${reason}`
  }

  if (eval_ === 'Approved') {
    return 'Your report has been fully approved by all evaluators.'
  }

  if (eval_ === 'Stage_Approved') {
    const nextEvaluatorMap = {
      'asst_bm':    'Asst. Branch Manager',
      'accountant': 'Accountant 3',
      'branch_m':   'Branch Manager',
    }
    const nextRole = nextEvaluatorMap[stage] ?? 'the next evaluator'
    return `Your report was approved by ${reviewer} and forwarded to ${nextRole}.`
  }

  return `A new ${getReportTitle(notif)} has been submitted and is awaiting your evaluation.`
}

function getEvaluatorDescription(notif) {
  const eval_ = notif.snapshot_evaluation
  const title = getReportTitle(notif)
  if (eval_ === 'Pending') {
    return `A new ${title} has been submitted and is awaiting your evaluation.`
  }
  return `A ${title} requires your attention.`
}

function getDisplayStatus(notif) {
  const eval_ = notif.snapshot_evaluation
  if (eval_ === 'Stage_Approved') return 'Approved'
  return eval_ ?? notif.status
}

// sub-components
function StatusBadge({ status }) {
  const approved = status === 'Approved'
  const pending  = status === 'Pending'
  return (
    <span className={`inline-flex items-center gap-[5px] px-[10px] py-[3px] rounded-full text-xs font-semibold
      ${approved ? 'bg-green-100 text-green-600'
      : pending  ? 'bg-yellow-100 text-yellow-700'
      :            'bg-red-100 text-red-600'}`}
    >
      {approved ? <FaCircleCheck size={13} /> : <FaCircleXmark size={13} />}
      {status}
    </span>
  )
}

function StatusIcon({ status }) {
  if (status === 'Approved') return <FaCircleCheck size={30} className="text-green-600 flex-shrink-0" />
  if (status === 'Rejected') return <FaCircleXmark size={30} className="text-red-600 flex-shrink-0" />
  return <FaRegFileAlt size={30} className="text-[#2D317F] flex-shrink-0" />
}

function EvaluatorNotifItem({ notif, onNavigate }) {
  return (
    <div
      onClick={onNavigate}
      className={`flex items-start gap-4 px-5 py-6 rounded-[10px] border cursor-pointer
        shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] transition-shadow duration-150 hover:shadow-md mb-[10px]
        ${notif.read ? 'bg-[#F5F9F9] border-[#e8edf3] opacity-70' : 'bg-white border-[#e8edf3]'}`}
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-[6px] ${notif.read ? 'opacity-0' : 'bg-[#2D317F]'}`} />
      <div className="flex-shrink-0 pt-[2px] text-[#2D317F]">
        <FaRegFileAlt size={26} />
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <span className="text-sm font-bold text-gray-900">{getReportTitle(notif)}</span>
          <div className="flex gap-3 text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
            <span>{notif.date_audited}</span>
            <span>{formatTime(notif.time_audited)}</span>
          </div>
        </div>
        <div className="flex gap-5 text-xs text-gray-500">
          <span>{getReportNumber(notif)}</span>
          <span>Submitted by: {notif.submitted_by_name}</span>
        </div>
        {/* Fix: dynamic description */}
        <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
          {getEvaluatorDescription(notif)}
        </p>
      </div>
    </div>
  )
}

// Notif card for Warehouse Supervisor (they receive approval/rejection updates)
function SupervisorNotifItem({ notif, onClick }) {
  const displayStatus = getDisplayStatus(notif)

  return (
    <div
      onClick={onClick}
      className={`flex items-start gap-4 px-5 py-6 rounded-[10px] border cursor-pointer
        shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] transition-shadow duration-150 hover:shadow-md mb-[10px]
        ${notif.read ? 'bg-[#F5F9F9] border-[#e8edf3] opacity-70' : 'bg-white border-[#e8edf3]'}`}
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-[6px] ${notif.read ? 'opacity-0' : 'bg-[#2D317F]'}`} />
      <div className="flex-shrink-0 pt-[2px]">
        <StatusIcon status={displayStatus} />
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-[10px] flex-wrap">
            <span className="text-sm font-bold text-gray-900">{getReportTitle(notif)}</span>
            <StatusBadge status={displayStatus} />
          </div>
          <div className="flex gap-3 text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
            <span>{notif.date_audited}</span>
            <span>{formatTime(notif.time_audited)}</span>
          </div>
        </div>
        <div className="flex gap-5 text-xs text-gray-500">
          <span>{getReportNumber(notif)}</span>
          {notif.reviewed_by_name && notif.reviewed_by_name !== '-' && (
            <span>Reviewed by: {notif.reviewed_by_name}</span>
          )}
        </div>
        <p className="text-[13px] text-gray-600 mt-1 leading-relaxed">
          {getStageMessage(notif)}
        </p>
      </div>
    </div>
  )
}

// Modals
function ApproveModal({ open, onClose, notif }) {
  if (!notif) return null

  const isFullyApproved = notif?.snapshot_evaluation === 'Approved'

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-[#E6EEF6] p-0 gap-0 max-w-[90vw] md:max-w-[600px] xl:max-w-[650px] overflow-hidden rounded-[10px] border-none">
        <div className="h-[30px] bg-[#3E7A43]" />
        <div className="flex justify-center mt-6">
          <div className="bg-[#3E7A43] w-[100px] h-[100px] rounded-full flex justify-center items-center">
            <FaCheck size={50} color="white" />
          </div>
        </div>
        <div className="text-center px-6 mt-4">
          <p className="text-[#3E7A43] text-[25px] font-bold leading-tight">
            {isFullyApproved ? 'Fully Approved!' : 'Stage Approved!'}
          </p>
          <p className="text-[#3E7A43] text-[15px] mt-2">
            {getStageMessage(notif)}
          </p>
        </div>
        <AlertDialogFooter className="!flex !items-center !justify-center pb-9 mt-4 bg-[#E6EEF6] border-0">
          <button
            className="text-white bg-[#3E7A43] px-[30px] py-[7px] rounded-[9px] cursor-pointer hover:opacity-80 -mt-5"
            onClick={onClose}
          >
            Done
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function RejectModal({ open, onClose, onEdit, notif }) {
  if (!notif) return null

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-[#E6EEF6] p-0 gap-0 max-w-[90vw] md:max-w-[600px] xl:max-w-[650px] overflow-hidden rounded-[10px] border-none">
        <div className="h-[30px] bg-[#BB2325]" />
        <div className="flex justify-center mt-6">
          <div className="w-[100px] h-[100px] rounded-full flex justify-center items-center">
            <TbXboxX size={70} color="#BB2325" />
          </div>
        </div>
        <div className="text-center px-6 mt-2">
          <p className="text-[#BB2325] text-[25px] font-bold leading-tight">Report Rejected</p>
          {notif?.reason_text && notif.reason_text !== '-' && (
            <p className="mx-[10px] text-justify text-sm leading-relaxed mt-2 text-gray-700">
              <span className="font-semibold">Reason: </span>{notif.reason_text}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-3">
            Please review your report and make the necessary corrections.
          </p>
        </div>
        <AlertDialogFooter className="justify-center gap-3 pb-10 mt-4 sm:justify-center border-0 bg-[#E6EEF6]">
          <button
            className="text-[#5B5B5B] bg-[#D9D9D9] px-6 py-2 rounded-[9px] cursor-pointer"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="bg-[#BB2325] text-white px-6 py-2 rounded-[9px] cursor-pointer"
            onClick={onEdit}
          >
            Edit Report
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function Notifications() {
  const user       = useCurrentUser()
  const notifRoute = getNotifRoute(user)
  const userName   = user ? `${user.fname} ${user.lname}` : 'User'

  const navigate = useNavigate()
  const [notifications,    setNotifications]    = useState([])
  const [loading,          setLoading]          = useState(true)
  const [error,            setError]            = useState(null)
  const [showRejectModal,  setShowRejectModal]  = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [selectedNotif,    setSelectedNotif]    = useState(null)

  const userLevel   = user?.user_level
  const isWS        = userLevel === 'Warehouse Supervisor'
  const isAdmin     = userLevel === 'Admin'
  const isSignatory = userLevel === 'Signatory'
  const isEvaluator = isAdmin || isSignatory

  const evalRoute = getEvalRoute(user)

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await api.get('/notification/notifications/')
        setNotifications(res.data)
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
        setError('Failed to load notifications.')
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const markAsRead = async (notif) => {
    if (notif.read) return
    try {
      await api.patch(`/notification/notifications/${notif.notif_id}/`, { read: true })
      setNotifications(prev =>
        prev.map(n => n.notif_id === notif.notif_id ? { ...n, read: true } : n)
      )
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const handleEvaluatorClick = async (notif) => {
    await markAsRead(notif)
    navigate(evalRoute)
  }

  const handleSupervisorClick = async (notif) => {
    await markAsRead(notif)
    setSelectedNotif(notif)
    if (notif.snapshot_evaluation === 'Rejected') {
      setShowRejectModal(true)
    } else {
      setShowApproveModal(true)
    }
  }

  return (
    <>
      <Header
        pageTitle="Notifications"
        notifTo={notifRoute}
        unreadCount={notifications.filter(n => !n.read).length}
        userName={userName}
      />

      <div className="mx-4 my-4 text-[#2D317F]">
        <div className="bg-white flex flex-col p-4 rounded-lg" style={{ height: '653px', overflowY: 'auto' }}>

          {loading && (
            <div className="flex flex-col items-center gap-3 py-16 text-[#2D317F]">
              <div className="w-8 h-8 border-4 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading notifications...</span>
            </div>
          )}

          {!loading && error && (
            <p className="text-center text-red-400 py-10 text-sm">{error}</p>
          )}

          {!loading && !error && notifications.length === 0 && (
            <p className="text-center text-gray-400 py-10 text-sm">No notifications yet.</p>
          )}

          {!loading && !error && notifications.map(notif =>
            isEvaluator
              ? (
                <EvaluatorNotifItem
                  key={notif.notif_id}
                  notif={notif}
                  onNavigate={() => handleEvaluatorClick(notif)}
                />
              )
              : (
                <SupervisorNotifItem
                  key={notif.notif_id}
                  notif={notif}
                  onClick={() => handleSupervisorClick(notif)}
                />
              )
          )}
        </div>
      </div>

      {isWS && (
        <>
          <ApproveModal
            open={showApproveModal}
            onClose={() => setShowApproveModal(false)}
            notif={selectedNotif}
          />
          <RejectModal
            open={showRejectModal}
            onClose={() => setShowRejectModal(false)}
            onEdit={() => {
              setShowRejectModal(false)
              navigate(`/whse/create/${selectedNotif?.report_id}`, {
                state: { mode: 'edit' }
              })
            }}
            notif={selectedNotif}
          />
        </>
      )}
    </>
  )
}