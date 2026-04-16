// react icons
import { FaRegFileAlt } from 'react-icons/fa'
import { FaCircleXmark, FaCircleCheck } from 'react-icons/fa6'
import { FaCheck } from 'react-icons/fa'
import { TbXboxX } from 'react-icons/tb'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// shadcnAlertDialogContent 
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog'

const SAMPLE_ADMIN_NOTIFICATIONS = [
  {
    id: 1,
    reportTitle: "Statement of Daily Warehouse Receipt",
    wsr: "11692113",
    submittedBy: "Louie Valenzuela",
    date: "2026-03-15",
    time: "2:30PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    read: false,
  },
  {
    id: 2,
    reportTitle: "Statement of Daily Warehouse Issue",
    wsr: "11692615",
    submittedBy: "Febrose Valenzuela",
    date: "2026-03-14",
    time: "10:00AM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    read: true,
  },
  {
    id: 3,
    reportTitle: "Statement of Daily Warehouse Issue",
    wsr: "11692615",
    submittedBy: "Febrose Valenzuela",
    date: "2026-03-14",
    time: "10:00AM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    read: true,
  },
]

const SAMPLE_SUPERVISOR_NOTIFICATIONS = [
  {
    id: 1,
    reportTitle: "Statement of Daily Warehouse Receipt",
    wsr: "11692113",
    reviewedBy: "Ronnel Rjucutan",
    date: "2026-03-15",
    time: "2:30PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    status: "Rejected",
    read: false,
  },
  {
    id: 2,
    reportTitle: "Statement of Daily Warehouse Issue",
    wsr: "11692615",
    reviewedBy: "Ronnel Rjucutan",
    date: "2026-03-15",
    time: "2:30PM",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    status: "Approved",
    read: false,
  },
]

async function fetchAdminNotifications() {
  return SAMPLE_ADMIN_NOTIFICATIONS
}

async function fetchSupervisorNotifications() {
  return SAMPLE_SUPERVISOR_NOTIFICATIONS
}

function StatusBadge({ status }) {
  const approved = status === "Approved"
  return (
    <span
      className={`inline-flex items-center gap-[5px] px-[10px] py-[3px] rounded-full text-xs font-semibold
        ${approved ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
    >
      {approved ? <FaCircleCheck size={13} /> : <FaCircleXmark size={13} />}
      {status}
    </span>
  )
}

function StatusIcon({ status }) {
  if (status === "Approved")
    return <FaCircleCheck size={30} className="text-green-600 flex-shrink-0" />
  if (status === "Rejected")
    return <FaCircleXmark size={30} className="text-red-600 flex-shrink-0" />
  return <FaRegFileAlt size={30} className="text-[#2D317F] flex-shrink-0" />
}

function AdminNotifItem({ notif, onNavigate }) {
  return (
    <div
      className={`flex items-start gap-4 px-5 py-4 border-b border-gray-200 transition-colors duration-150 hover:bg-gray-50 bg-white
        ${notif.read ? 'opacity-60' : 'opacity-100'}`}
    >
      <div className="flex-shrink-0 pt-5">
        <StatusIcon />
      </div>
      <div onClick={onNavigate} className="flex-1 flex flex-col gap-1 cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-[10px] flex-wrap">
            <span className="text-sm font-bold text-gray-900">{notif.reportTitle}</span>
          </div>
          <div className="flex gap-3 text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
            <span>{notif.date}</span>
            <span>{notif.time}</span>
          </div>
        </div>
        <div className="flex gap-5 text-xs text-gray-500">
          <span>WSR#: {notif.wsr}</span>
          <span>Submitted by: {notif.submittedBy}</span>
        </div>
        <p className="text-[13px] text-gray-700 mt-1 leading-relaxed">{notif.description}</p>
      </div>
    </div>
  )
}

function SupervisorNotifItem({ notif, onClick }) {
  return (
    <div
      className={`flex items-start gap-4 px-5 py-4 border-b border-gray-200 transition-colors duration-150 hover:bg-gray-50
        ${notif.read ? 'bg-[#fafafa] opacity-75' : 'bg-white'}`}
    >
      <div className="flex-shrink-0 pt-5">
        <StatusIcon status={notif.status} />
      </div>
      <div onClick={onClick} className="flex-1 flex flex-col gap-1 cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-[10px] flex-wrap">
            <span className="text-sm font-bold text-gray-900">{notif.reportTitle}</span>
            <StatusBadge status={notif.status} />
          </div>
          <div className="flex gap-3 text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
            <span>{notif.date}</span>
            <span>{notif.time}</span>
          </div>
        </div>
        <div className="flex gap-5 text-xs text-gray-500">
          <span>WSI#: {notif.wsr}</span>
          <span>Reviewed by: {notif.reviewedBy}</span>
        </div>
        <p className="text-[13px] text-gray-700 mt-1 leading-relaxed">{notif.description}</p>
      </div>
    </div>
  )
}

// ── Success Modal ──
function ApproveModal({ open, onClose }) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-[#E6EEF6] p-0 gap-0 max-w-[90vw] md:max-w-[600px] xl:max-w-[650px] overflow-hidden rounded-[10px] border-none">
        {/* colored top bar */}
        <div className="h-[30px] bg-[#3E7A43]" />

        {/* icon */}
        <div className="flex justify-center mt-6">
          <div className="bg-[#3E7A43] w-[100px] h-[100px] rounded-full flex justify-center items-center">
            <FaCheck size={50} color="white" />
          </div>
        </div>

        {/* text */}
        <div className="text-center px-6 mt-4">
          <p className="text-[#2D317F] text-[25px] font-bold leading-tight">Success!</p>
          <p className="text-[#2D317F] text-[15px] mt-1">
            <span>Report 11692615</span> has been approved!
          </p>
        </div>

        {/* footer */}
        <AlertDialogFooter className="!flex !items-center !justify-center pb-9 mt-4 bg-[#E6EEF6] border-0">
          <button
            className="text-white bg-[#3E7A43] px-[30px] py-[7px] rounded-[9px] cursor-pointer transition-opacity duration-200 hover:opacity-80 -mt-5"
            onClick={onClose}
          >
            Done
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ── Reject Modal ──
function RejectModal({ open, onClose, onEdit }) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-[#E6EEF6] p-0 gap-0 max-w-[90vw] md:max-w-[600px] xl:max-w-[650px]  overflow-hidden rounded-[10px] border-none">
        {/* colored top bar */}
        <div className="h-[30px] bg-[#BB2325]" />

        {/* icon */}
        <div className="flex justify-center mt-6">
          <div className="w-[100px] h-[100px] rounded-full flex justify-center items-center">
            <TbXboxX size={70} color="#BB2325" />
          </div>
        </div>

        {/* text */}
        <div className="text-center px-6 mt-2">
          <p className="text-[#BB2325] text-[25px] font-bold leading-tight">Reject Report?</p>
          <p className="mx-[10px] text-justify text-sm leading-relaxed mt-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>

        {/* footer */}
        <AlertDialogFooter className="justify-center gap-3 pb-10 mt-4 sm:justify-center border-0 bg-[#E6EEF6]">
          <button
            className="text-[#5B5B5B] bg-[#D9D9D9] px-6 py-2 rounded-[9px] cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-[#BB2325] text-[#D9D9D9] px-6 py-2 rounded-[9px] cursor-pointer"
            onClick={onEdit}
          >
            Edit
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ── Main Component ──
export default function Notifications({ role }) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const fetcher = role === 'admin' ? fetchAdminNotifications : fetchSupervisorNotifications
    fetcher()
      .then(data => setNotifications(data))
      .catch(() => setError("Failed to load notifications."))
      .finally(() => setLoading(false))
  }, [role])

  return (
    <>
      {/* Main container */}
      <div className="m-[30px] text-[#2D317F]">
        <div className="bg-white text-lg font-bold text-[#2D317F] px-5 py-4 border-b border-gray-200 mb-5">
          Notifications
        </div>

        <div className="bg-white flex flex-col min-h-[calc(100vh-200px)]">
          {loading && (
            <p className="text-center text-gray-400 py-10 text-sm">Loading notifications...</p>
          )}
          {!loading && error && (
            <p className="text-center text-red-400 py-10 text-sm">{error}</p>
          )}
          {!loading && !error && notifications.length === 0 && (
            <p className="text-center text-gray-400 py-10 text-sm">No notifications.</p>
          )}
          {!loading && !error && notifications.map(notif =>
            role === 'admin'
              ? <AdminNotifItem key={notif.id} notif={notif} onNavigate={() => navigate("/admin/evaluation")} />
              : <SupervisorNotifItem
                  key={notif.id}
                  notif={notif}
                  onClick={() => {
                    if (notif.status === "Approved") setShowApproveModal(true)
                    else if (notif.status === "Rejected") setShowRejectModal(true)
                  }}
                />
          )}
        </div>
      </div>

      <ApproveModal
        open={showApproveModal}
        onClose={() => setShowApproveModal(false)}
      />

      <RejectModal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onEdit={() => navigate("/whse/management/")}
      />
    </>
  )
}