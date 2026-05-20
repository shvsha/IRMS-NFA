import { useState, useEffect } from 'react'
import api from '../../api/axios'
import EmployeeForm from './EmployeeForm'
import Header from '../../components/Header'

// notif
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { getNotifRoute } from '@/utils/Import & Export/getNotifRoute'
import { useUnreadCount } from '@/hooks/useUnreadCount'

// toast
import { useToast } from '@/hooks/useToast'
import { Toast } from '@/components/Toast'

// shadcn
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogDescription } from "@/components/ui/dialog"

// icons
import { FaSearch, FaBars, FaUserTimes } from "react-icons/fa"
import { CiUser } from "react-icons/ci"
import { FaPlus } from "react-icons/fa6"
import { SquarePen, UserX, UserRoundCheck } from "lucide-react"

const COLOR = {
  primary:  '#2D317F',
  success:  '#3E7A43',
  danger:   '#BB2325',
  darkBlue: '#051F52',
}

const USER_LEVEL = 'Warehouse Supervisor'

const TABLE_HEADERS = ['Warehouse ID', 'Office ID', 'Name', 'Email', 'User Level', 'Status', 'Action']

function ConfirmDialog({ open, onClose, onConfirm, color, icon: Icon, title, description, confirmLabel }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='bg-[#F8F8F8] [&>button]:hidden px-0 !pt-0 !max-w-[320px] shadow-2xl'>
        <div className='py-2.5 rounded-t-lg' style={{ backgroundColor: color }} />
        <div className='py-4 rounded-full flex justify-center mx-31 mb-1.5 mt-3' style={{ backgroundColor: color }}>
          <Icon className="w-9 h-9" color='white' />
        </div>
        <DialogHeader>
          <div className='text-center -mb-2'>
            <p className='font-bold text-[23px]' style={{ color }}>{title}</p>
            <p className='text-[12px] mx-7 mt-0.5' style={{ color: COLOR.darkBlue }}>{description}</p>
          </div>
          <DialogDescription className='flex flex-col gap-5'>
            <div className='flex justify-center gap-3 mt-3 mb-1'>
              <Button
                variant="ghost"
                onClick={onClose}
                className='px-3 py-4 rounded-md bg-[#D9D9D9] text-black font-medium hover:bg-gray-300'
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className='px-3 py-4 rounded-md text-white font-medium'
                style={{ backgroundColor: color }}
              >
                {confirmLabel}
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

function getFilteredUsers(users, status, search) {
  return users
    .filter(u => u.user_level === USER_LEVEL)
    .filter(u => u.status === status)
    .filter(u => `${u.fname} ${u.lname}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.user_id - a.user_id)
}

export default function UserManagement() {
  // notif
  const currentUser  = useCurrentUser()
  const notifRoute   = getNotifRoute(currentUser)
  const userName     = currentUser ? `${currentUser.fname} ${currentUser.lname}` : 'User'
  const unreadCount  = useUnreadCount()

  // toast
  const { toasts, addToast } = useToast()

  const [search, setSearch]                   = useState('')
  const [userStatus, setUserStatus]           = useState('Active')
  const [users, setUsers]                     = useState([])
  const [loading, setLoading]                 = useState(true)
  const [refreshKey, setRefreshKey]           = useState(0)
  const [view, setView]                       = useState('list')
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // dialog state
  const [archiveDialog, setArchiveDialog]       = useState({ open: false, userId: null })
  const [reactivateDialog, setReactivateDialog] = useState({ open: false, userId: null })

  // fetch users whenever refreshKey changes
  useEffect(() => {
    setLoading(true)
    api.get('/api/users/')
      .then(res => setUsers(res.data))
      .catch(err => {
        console.error('Failed to fetch users:', err)
        addToast('Failed to load users. Please try again.', 'error')
      })
      .finally(() => setLoading(false))
  }, [refreshKey])

  const filteredUsers = getFilteredUsers(users, userStatus, search)

  const handleBack = () => {
    setView('list')
    setSelectedEmployee(null)
    setRefreshKey(k => k + 1)
  }

  const handleArchive = async () => {
    const target = users.find(u => u.user_id === archiveDialog.userId)
    try {
      await api.patch(`/api/users/${archiveDialog.userId}/`)
      setUsers(prev => prev.map(u =>
        u.user_id === archiveDialog.userId ? { ...u, status: 'Inactive' } : u
      ))
      addToast(`${target.fname} ${target.lname} successfully deactivated.`, 'success')
    } catch (err) {
      console.error('Failed to deactivate user:', err)
      addToast('Failed to deactivate user. Please try again.', 'error')
    } finally {
      setArchiveDialog({ open: false, userId: null })
    }
  }

  const handleReactivate = async () => {
    const target = users.find(u => u.user_id === reactivateDialog.userId)
    try {
      await api.patch(`/api/users/${reactivateDialog.userId}/`, { status: 'Active' })
      setUsers(prev => prev.map(u =>
        u.user_id === reactivateDialog.userId ? { ...u, status: 'Active' } : u
      ))
      addToast(`${target.fname} ${target.lname} successfully reactivated.`, 'success')
    } catch (err) {
      console.error('Failed to reactivate user:', err)
      addToast('Failed to reactivate user. Please try again.', 'error')
    } finally {
      setReactivateDialog({ open: false, userId: null })
    }
  }

  if (view === 'add')  return <EmployeeForm key='add'  mode="add"  onCancel={handleBack} />
  if (view === 'edit') return <EmployeeForm key='edit' mode="edit" employeeData={selectedEmployee} onCancel={handleBack} />

  return (
    <>
      <Header
        pageTitle="Supervisor"
        notifTo={notifRoute}
        unreadCount={unreadCount}
        userName={userName}
      />

      <div className="mx-4 my-4 mb-5 flex flex-col !min-h-[653px]">

        {/* Top bar */}
        <div className="flex justify-between items-center py-4 pt-1">
          <p className="text-[#2D317F] font-semibold text-xl">Supervisor Management</p>

          <div className="flex items-center gap-8">
            {/* Status filter */}
            <Select value={userStatus} onValueChange={setUserStatus}>
              <SelectTrigger className="w-27 px-3 py-5 bg-white border border-[#2D317F] rounded-md [&>svg]:text-[#2D317F] shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] text-[#2D317F] font-medium">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className='w-27 min-w-0'>
                <SelectItem className="p-2 text-[#2D317F]" value="Active">Active</SelectItem>
                <SelectItem className="p-2 text-[#2D317F]" value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="flex items-center border border-[#2D317F] rounded-full px-3 py-1 gap-2 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
              <FaBars color={COLOR.primary} size={18} className="shrink-0" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search Name"
                className="bg-transparent border-0 rounded-xl placeholder:text-black/50 focus-visible:ring-0 h-8 w-[430px]"
              />
              <FaSearch color={COLOR.primary} size={18} className="shrink-0" />
            </div>

            {/* Add button */}
            <Button
              onClick={() => setView('add')}
              className="p-5 py-5.5 rounded-md bg-[#2D317F] text-white shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]"
            >
              <FaPlus color="white" /> Add Employee
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto shadow-2xl border border-black/10 rounded-lg bg-[#F5F9F9]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#E2EBFF] border-b border-gray-200 h-10 xl:h-12 2xl:h-[50px]">
                {TABLE_HEADERS.map(h => (
                  <TableHead key={h} className="text-[#2D317F] font-bold text-center text-sm xl:text-base">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-[#2D317F]">
                      <div className="w-8 h-8 border-4 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">Loading warehouse supervisors...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                    No {userStatus.toLowerCase()} warehouse supervisors found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(employee => (
                  <TableRow key={employee.user_id}>
                    <TableCell className="text-center text-[#2D317F]">{employee.WHCode}</TableCell>
                    <TableCell className="text-center text-[#2D317F]">{employee.Office_id}</TableCell>
                    <TableCell className="text-center text-[#2D317F] font-medium">
                      {employee.fname} {employee.mI} {employee.lname}
                    </TableCell>
                    <TableCell className="text-center text-[#2D317F]">{employee.email}</TableCell>
                    <TableCell className="text-center text-[#2D317F]">{employee.user_level}</TableCell>

                    {/* Status badge */}
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 w-23 rounded-full text-xs font-semibold ${
                        employee.status === 'Active' ? 'bg-green-100 text-[#1D8104]' : 'bg-red-100 text-[#BB2325]'
                      }`}>
                        <CiUser className='h-4 w-4' />
                        {employee.status}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        {/* Edit */}
                        <Button
                          onClick={() => { setSelectedEmployee(employee); setView('edit') }}
                          variant="ghost"
                          className="flex items-center gap-1.5 px-3 py-2 h-auto bg-transparent text-[#2D317F] border border-[#2D317F] rounded-full"
                        >
                          <SquarePen className="w-4 h-4" color={COLOR.primary} />
                          <span className="text-xs font-medium text-[#2D317F]">Edit</span>
                        </Button>

                        {/* Deactivate / Reactivate */}
                        {employee.status === 'Active' ? (
                          <Button
                            onClick={() => setArchiveDialog({ open: true, userId: employee.user_id })}
                            variant="ghost"
                            className="flex items-center gap-1.5 px-3 py-2 h-auto bg-transparent text-[#BB2325] border border-[#BB2325] rounded-full hover:bg-red-50"
                          >
                            <UserX className="w-4 h-4" color={COLOR.danger} />
                            <span className="text-xs font-medium text-[#BB2325]">Deactivate</span>
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setReactivateDialog({ open: true, userId: employee.user_id })}
                            variant="ghost"
                            className="flex items-center gap-1.5 px-3 py-2 h-auto bg-transparent text-[#3E7A43] border border-[#3E7A43] rounded-full"
                          >
                            <UserRoundCheck className="w-4 h-4" color={COLOR.success} />
                            <span className="text-xs font-medium text-[#3E7A43]">Reactivate</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Deactivate confirmation dialog */}
        <ConfirmDialog
          open={archiveDialog.open}
          onClose={() => setArchiveDialog({ open: false, userId: null })}
          onConfirm={handleArchive}
          color={COLOR.danger}
          icon={FaUserTimes}
          title="Deactivate Employee"
          description="Are you sure you want to deactivate this Employee? You can restore it later if needed."
          confirmLabel="Deactivate"
        />

        {/* Reactivate confirmation dialog */}
        <ConfirmDialog
          open={reactivateDialog.open}
          onClose={() => setReactivateDialog({ open: false, userId: null })}
          onConfirm={handleReactivate}
          color={COLOR.success}
          icon={UserRoundCheck}
          title="Reactivate Employee"
          description="Are you sure you want to reactivate this Employee?"
          confirmLabel="Reactivate"
        />

      </div>

      {/* Toast notifications */}
      <Toast toasts={toasts} />
    </>
  )
}