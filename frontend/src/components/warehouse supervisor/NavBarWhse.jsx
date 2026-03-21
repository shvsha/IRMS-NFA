import { NavLink } from 'react-router-dom'
import { FaBell } from 'react-icons/fa';

import '../../styles/Navbar.css'

// hardcoded for now, replace with API data later
const unreadCount = 5;

export default function NavBarWhse() {
  return (
    <nav className='navbar-container'>
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
      </div>

      <div>
        <NavLink to="/whse/notif" className="nav-link ">
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
