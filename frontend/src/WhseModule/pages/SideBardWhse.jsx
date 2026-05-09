import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'

// icons
import { MdOutlineMenuBook } from 'react-icons/md'
import { TbReportSearch } from 'react-icons/tb'
import { MdAssessment } from 'react-icons/md'
import { LuLogOut } from 'react-icons/lu'
import { FiLayers } from "react-icons/fi";

// logo
import NFALogo from '../../assets/NFA-logo.png'

// shadcn
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

// util
import { cn } from "@/lib/utils"

// axios
import api from '../../api/axios'

const navItems = [
  { to: '/whse/management', label: 'Stock Book', icon: <MdOutlineMenuBook size={18} /> },
  { to: '/whse/status', label: 'Report Status', icon: <MdAssessment size={18} /> },
  { to: '/whse/summarization', label: 'Report Summarization', icon: <TbReportSearch size={18} /> },
  { to: '/whse/pile', label: 'Pile Layout', icon: <FiLayers size={18} /> },
]

export default function NavBarWhse() {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await api.post('/audit/log-logout/')
      await api.post('api/auth/logout', { refresh })
    } catch (err) {
      console.log('Logout error: ', err)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      navigate('/')
    }
  }

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`
        relative flex flex-col h-screen bg-[#28285F] transition-all duration-300 ease-in-out z-50
        ${expanded ? 'w-54' : 'w-18'}
      `}
    >
      {/* logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 pb-3 mt-4 overflow-hidden h-18">
        <img src={NFALogo} className="w-10 h-10 rounded-full flex-shrink-0" />
        {expanded && (
          <div className="whitespace-nowrap overflow-hidden">
            <p className="text-white font-bold text-[13px] leading-tight">Integrated Report <br/> Monitoring System</p>
            <p className="text-white/70 text-[9px] leading-tight mt-1">NATIONAL FOOD AUTHORITY</p>
          </div>
        )}
      </div>

      {/* navigation links */}
      <nav className="flex flex-col mt-9 flex-1">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              flex items-center gap-3 px-[13px] py-3 mx-3.5 my-1 text-[12px] font-medium transition-all duration-200 rounded-lg
              overflow-hidden whitespace-nowrap
              ${isActive
                ? 'bg-[#ADCEFF] text-[#2D317F]'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            <span className="flex-shrink-0 w-5 flex items-center justify-center">{icon}</span>
            {expanded && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* logout */}
      <div className="border-t border-white/10 p-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className={`flex items-center w-full py-3 text-white/70 hover:text-white hover:bg-white/10 rounded transition-all duration-200 overflow-hidden whitespace-nowrap
              ${expanded ? 'px-[13px] gap-3' : 'px-[13px]'}
            `}>
              <span className="flex-shrink-0 w-5 flex items-center justify-center"><LuLogOut size={18} /></span>
              {expanded && <span className="text-sm font-medium">Logout</span>}
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent className='pt-0 px-0 bg-[#E6EEF6] pb-0 max-w-[90vw] md:max-w-[380px] xl:max-w-[400px] overflow-hidden rounded-[10px] border-none'>
            <div className='h-7 bg-[#2D317F] rounded-t-lg'></div>
            <AlertDialogHeader className='p-5 text-center items-center pb-4'>
              <AlertDialogTitle className='font-bold text-[#2D317F] text-3xl'>Logout</AlertDialogTitle>
              <AlertDialogDescription className={cn('!text-customSize', 'text-gray-600')}>
                Are you sure you want to logout?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='mx-0 mb-0 bg-transparent flex flex-row justify-center gap-3 border-[#a2aab3]'>
              <AlertDialogCancel className='px-5 py-4.5'>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className='!bg-[#2D317F] text-white hover:bg-[#1a1f4d] px-5 py-4.5'
                onClick={handleLogout}
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  )
}