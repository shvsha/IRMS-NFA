// components/shared/Header.jsx
import { FaBell } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'

export default function Header({ pageTitle, notifTo, unreadCount = 0, userName }) {
  return (
    <header className="bg-[#E1EDFF] flex justify-between items-center px-6 h-9 xl:h-10- 2xl:h-11">
      
      {/* page title */}
      <h1 className="text-[#2D317F] font-bold text-sm xl:text-base tracking-wide uppercase">
        {pageTitle}
      </h1>

      {/* right side */}
      <div className="flex items-center gap-4">
        
        {/* notification bell */}
        <NavLink to={notifTo} className="relative inline-flex items-center">
          <FaBell size={17} color="#2D317F" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </NavLink>

        {/* user name */}
        <div className="bg-white border border-gray-200 rounded-md px-3 py-1 text-[#2D317F] text-xs font-medium shadow-sm">
          {userName}
        </div>

      </div>
    </header>
  )
}