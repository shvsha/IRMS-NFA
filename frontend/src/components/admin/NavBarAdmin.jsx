import { NavLink } from 'react-router-dom'
import { FaBell } from 'react-icons/fa';

// hardcoded for now, replace with API data later
const unreadCount = 5;

import '../../styles/Navbar.css'

export default function NavBarAdmin() {
  return (
    <nav className='navbar-container'>
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
        <NavLink to="/admin/notif" className="nav-link ">
          <FaBell size={25} />
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
