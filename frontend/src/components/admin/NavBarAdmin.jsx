import { NavLink } from 'react-router-dom'
import { FaBell } from 'react-icons/fa';

// hardcoded for now, replace with API data later
const unreadCount = 5;

import '../../styles/Navbar.css'

export default function NavBarAdmin() {
  return (
    <nav className='bg-[#ECF0F3] flex justify-between items-center px-2.5 h-12 xl:h-13 2xl:h-15'>
      <div>
        <NavLink to="/admin/dashboard" className="nav-link">
          Dashboard
        </NavLink>
        <NavLink to="/admin/users" className="nav-link">
          User
        </NavLink>
        <NavLink to="/admin/evaluation" className="nav-link">
          Report Evaluation
        </NavLink>
        <NavLink to="/admin/summarization" className="nav-link">
          Report Summarization
        </NavLink>
        <NavLink to="/admin/history" className="nav-link">
          History Records
        </NavLink>
        <NavLink to="/admin/audit" className="nav-link">
          Audit Logs
        </NavLink>
      </div>

      <div>
        <NavLink to="/admin/notif" className="py-0 relative inline-flex mr-5">
          <FaBell size={23} color="#0B3B66" />
          {unreadCount > 0 && (
            <span className='notif-badge'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </NavLink>
      </div>
    </nav>
  )
}
