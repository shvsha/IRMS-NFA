import { NavLink } from 'react-router-dom'
import { FaBell } from 'react-icons/fa';

import '../../styles/Navbar.css'

// hardcoded for now, replace with API data later
const unreadCount = 5;

export default function NavBarWhse() {
  return (
    <nav className='bg-[#ECF0F3] flex justify-between items-center px-2.5 h-15'>
      <div>
        <NavLink to="/whse/management" className="nav-link">
          Stock Book
        </NavLink>
        <NavLink to="/whse/status" className="nav-link">
          Report Status
        </NavLink>
        <NavLink to="/whse/summarization" className="nav-link">
          Report Summarization
        </NavLink>
        <NavLink to="/whse/audit" className="nav-link">
          Audit Logs
        </NavLink>
      </div>

      <div>
        <NavLink to="/whse/notif" lassName="py-0 relative inline-flex mr-5">
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
