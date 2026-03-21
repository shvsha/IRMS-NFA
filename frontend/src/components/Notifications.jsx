// css
import { useEffect, useState } from 'react'
import '../styles/Notifications.css'

// react icons
import { FaRegFileAlt } from 'react-icons/fa'
import { FaCircleXmark, FaCircleCheck } from 'react-icons/fa6'
import { FaCheck } from 'react-icons/fa'
import { TbXboxX } from 'react-icons/tb'

// react
import { useNavigate } from 'react-router-dom'

// sampel data for admin and supervisor
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

// api or backend later on
async function fetchAdminNotifications() {
  // const res = await fetch('/api/admin/notifications')
  // if (!res.ok) throw new Error('Failed to fetch')
  // return await res.json()
  return SAMPLE_ADMIN_NOTIFICATIONS
}

async function fetchSupervisorNotifications() {
  // const res = await fetch('/api/supervisor/notifications')
  // if (!res.ok) throw new Error('Failed to fetch')
  // return await res.json()
  return SAMPLE_SUPERVISOR_NOTIFICATIONS
}

function StatusBadge({ status }) {
  const approved = status === "Approved"
  return (
    <span className={`notif-status-badge ${approved ? 'badge--approved' : 'badge--rejected'}`}>
      {approved ? <FaCircleCheck size={13} /> : <FaCircleXmark size={13}/>}
      {status}
    </span>
  )
}
function StatusIcon({ status }) {
  if (status === "Approved") return <FaCircleCheck size={30} className='notif-icon notif-icon--approved'/>
  if (status === 'Rejected') return <FaCircleXmark size={30} className='notif-icon notif-icon--rejected' />
  return <FaRegFileAlt size={30} className='notif-icon notif-icon--default' />
}

// display this if its admin
function AdminNotifItem({ notif, onNavigate }) {
  return (
    <div className={`notif-item ${notif.read ? 'notif-item--read' : 'notif-item--unread'}`}>
      <div className='notif-item-left'>
        <StatusIcon />
      </div>
      <div onClick={onNavigate} style={{cursor: 'pointer'}} className='notif-item-body'>
        <div className='notif-item-top'>
          <div className='notif-item-title-row'>
            <span className='notif-title'>{notif.reportTitle}</span>
          </div>
          <div className='notif-item-datetime'>
            <span>{notif.date}</span>
            <span>{notif.time}</span>
          </div>
        </div>
        <div className='notif-item-meta'>
          <span>WSR#: {notif.wsr}</span>
          <span>Submitted by: {notif.submittedBy}</span>
        </div>
        <p className='notif-description'>{notif.description}</p>
      </div>
    </div>
  )
}
function SupervisorNotifItem({ notif, onClick }) {
  return (
    <div className={`notif-item ${notif.read ? 'notif-item--read' : 'notif-item--unread'}`}>
      <div className='notif-item-left'>
        <StatusIcon status={notif.status}/>
      </div>
      <div onClick={onClick} style={{ cursor: 'pointer'}} className='notif-item-body'>
        <div className='notif-item-top'>
          <div className='notif-item-title-row'>
            <span className='notif-title'>{notif.reportTitle}</span>
            <StatusBadge status={notif.status}/>
          </div>
          <div className='notif-item-datetime'>
            <span>{notif.date}</span>
            <span>{notif.time}</span>
          </div>
        </div>
        <div className='notif-item-meta'>
          <span>WSI#: {notif.wsr}</span>
          <span>Reviewed by: {notif.reviewedBy}</span>
        </div>
        <p className='notif-description'>{notif.description}</p>
      </div>
    </div>
  )
}

export default function Notifications({ role }) {
  const navigate = useNavigate();

  // us
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  // reject modal
  const closeRejectModal = () => {
    setIsHiding(true);
    setTimeout(() => {
      setShowRejectModal(false);
      setIsHiding(false);
    }, 300);
  };
  const rejectModal = () => {
    setShowRejectModal(true);
    return
  }

  //success modal
  const approveModal = () => {
    setShowApproveModal(true)
    return
  } 
  const closeApproveModal = () => {
    setIsHiding(true);
    setTimeout(() => {
      setShowApproveModal(false);
      setIsHiding(false);
    }, 300);
  };


  useEffect(() => {
    setLoading(true)
    setError(null)

    const fetcher = role === 'admin'
    ? fetchAdminNotifications
    : fetchSupervisorNotifications

    fetcher()
      .then(data => setNotifications(data))
      .catch(() => setError("Faild to load notifications."))
      .finally(() => setLoading(false))
  }, [role])

  return (
    <>
      <div className='whole-container-notif'>
        <div className='title-container-notif'>
          <p>Notifications</p>
        </div>

        <div className='notification-list-container'>

          {loading && (
            <p className='notif-empty'>Loading notifications...</p>
          )}

          {!loading && error && (
            <p className='notif-empty notif-error'>{error}</p>
          )}

          {!loading && !error && notifications.length === 0 && (
            <p className='notif-empty'>No notifications.</p>
          )}

          {!loading && !error && notifications.map(notif => role === 'admin'
            ? <AdminNotifItem key={notif.id} notif={notif} onNavigate={() => navigate("/admin/evaluation")} />
            : <SupervisorNotifItem 
                key={notif.id}
                notif={notif} 
                onClick={() => {
                  if (notif.status === "Approved") approveModal();
                  else if (notif.status === "Rejected") rejectModal();
                }}
              />
          )}
        </div>
      </div>

      {/* success modal */}
      <div
        className={
          "notif-validation-modal-overlay" +
          (showApproveModal ? " show" : "") +
          (isHiding ? " hiding" : "")
        }
      >
        <div className='success-modal-notif'>
          <div className='top-part-modal-success-notif'></div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '25px'}}>
            <div className='icon-success-notif'><FaCheck size={50} color='white'/></div>
          </div>
          <p style={{color: '#2D317F', fontSize: '25px', fontWeight: 'bold'}}>Success!</p>
          <p style={{color: '#2D317F', fontSize: '15px', marginTop: '-20px'}}><span>Report 11692615</span> has been approved! </p>
          <button className='success-done-btn-notif' onClick={() => closeApproveModal()}>Done</button>
        </div>
      </div>

      {/* reject modal */}
      <div
        className={
          "notif-validation-modal-overlay" +
          (showRejectModal ? " show" : "") +
          (isHiding ? " hiding" : "")
        }
      >
        <div className='reject-modal-notif'>
          <div className='top-part-modal-reject-notif'></div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '25px'}}>
            <div className='icon-reject-notif'><TbXboxX size={70} color='#BB2325'/></div>
          </div>
          <p style={{color: '#BB2325', fontSize: '25px', fontWeight: 'bold'}}>Reject Report?</p>
          <p style={{margin: '0 50px', textAlign: 'justify'}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p>
          <div className='validation-btns-reject'>
            <button className='cancel-btn-reject' onClick={closeRejectModal}>Cancel</button>
            <button className='edit-btn-edit' onClick={() => navigate("/whse/management/")}>Edit</button>
          </div>
        </div>
      </div>
    </>
  )
}
