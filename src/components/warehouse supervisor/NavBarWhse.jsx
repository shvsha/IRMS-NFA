import { NavLink } from 'react-router-dom'

import '../../styles/Navbar.css'

export default function NavBarWhse() {
  return (
    <nav className='navbar-container'>
      <NavLink to="/whse/management" className="nav-link">
        Report Management
      </NavLink>
      <NavLink to="/whse/status" className="nav-link">
        Report Status
      </NavLink>
      <NavLink to="/whse/summarization" className="nav-link">
        Report Summarization
      </NavLink>
    </nav>
  )
}
