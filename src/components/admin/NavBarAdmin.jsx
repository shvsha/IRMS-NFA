import { NavLink } from 'react-router-dom'

import '../../styles/admin/NavBarAdmin.css'

export default function NavBarAdmin() {
  return (
    <nav className='navbar-container'>
      <NavLink to="/admin/dashboard" className="nav-link">
        Dashboard
      </NavLink>
      <NavLink to="/admin/users" className="nav-link">
        User
      </NavLink>
      <NavLink to="/admin/evaluation" className="nav-link">
        Report Evaluation
      </NavLink>
      <NavLink to="/admin/sumamrization" className="nav-link">
        Report Sumamrization
      </NavLink>
      <NavLink to="/admin/history" className="nav-link">
        History Records
      </NavLink>
      <NavLink to="/admin/audit" className="nav-link">
        Audit Logs
      </NavLink>
    </nav>
  )
}
