import { useState, useEffect } from 'react'
import api from '../../api/axios'
import EmployeeForm from './EmployeeForm'
import Header from '../../components/Header'

// shadcn
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogDescription,  } from "@/components/ui/dialog"

// icons
import { FaSearch, FaCheck, FaBars, FaUserTimes } from "react-icons/fa"
import { CiUser } from "react-icons/ci";
import { FaPlus } from "react-icons/fa6"
import { SquarePen, UserX , UserRoundCheck } from "lucide-react"

export default function UserManagement() {
  const [search, setSearch] = useState('')
  const [userStatus, setUserStatus] = useState('Active')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [view, setView] = useState('list')
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // dialog state
  const [archiveDialog, setArchiveDialog] = useState({ open: false, userId: null })
  const [reactivateDialog, setReactivateDialog] = useState({ open: false, userId: null })
  const [toasts, setToasts] = useState([])

  const addToast = (message, color) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, color }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  // fetch users
  useEffect(() => {
    setLoading(true)
    api.get('/api/users/')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Failed to fetch users', err))
      .finally(() => setLoading(false))
  }, [refreshKey])

  const filteredUsers = users
    .filter(u => u.user_level === 'Warehouse Supervisor')
    .filter(u => u.status === userStatus)
    .filter(u => `${u.fname} ${u.lname}`.toLowerCase().includes(search.toLowerCase()))

  const handleBack = () => {
    setView('list')
    setSelectedEmployee(null)
    setRefreshKey(k => k + 1)
  }

  const handleArchive = async () => {
    const user = users.find(u => u.user_id === archiveDialog.userId)
    await api.patch(`/api/users/${archiveDialog.userId}/`)
    setUsers(prev => prev.map(u =>
      u.user_id === archiveDialog.userId ? { ...u, status: 'Inactive' } : u
    ))
    setArchiveDialog({ open: false, userId: null })
    addToast(`${user.fname} ${user.lname} successfully deactivated.`, '#1D8104')
  }

  const handleReactivate = async () => {
    const user = users.find(u => u.user_id === reactivateDialog.userId)
    await api.patch(`/api/users/${reactivateDialog.userId}/`, { status: 'Active' })
    setUsers(prev => prev.map(u =>
      u.user_id === reactivateDialog.userId ? { ...u, status: 'Active' } : u
    ))
    setReactivateDialog({ open: false, userId: null })
    addToast(`${user.fname} ${user.lname} successfully reactivated.`, '#1D8104')
  }

  if (view === 'add')  return <EmployeeForm key='add' mode="add"  onCancel={handleBack} />
  if (view === 'edit') return <EmployeeForm key='edit' mode="edit" employeeData={selectedEmployee} onCancel={handleBack} />
  return (
    <>
      <Header
          pageTitle="Supervisor"
          notifTo="/admin/notif"
          unreadCount={5}
          userName="Raph Nigos"
        />
      
      <div className=" mx-4 my-4 mb-5 flex flex-col !min-h-[653px]">

        {/* Top bar */}
        <div className="flex justify-between items-center py-4 pt-1">
          <div className=''>
            <p className="text-[#2D317F] font-semibold text-xl">Supervisor Management</p>
          </div>

          <div className="flex items-center gap-8">
            <Select value={userStatus} onValueChange={setUserStatus}>
              <SelectTrigger className="w-27 px-3 py-5 bg-white border border-[#2D317F] rounded-md [&>svg]:text-[#2D317F] shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] text-[#2D317F] font-medium">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className='w-27 min-w-0'>
                <SelectItem className="p-2 text-[#2D317F]" value="Active">Active</SelectItem>
                <SelectItem className="p-2 text-[#2D317F]" value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border border-[#2D317F] rounded-full px-3 py-1 gap-2 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]">
              <FaBars color={'#2D317F'} size={18} className="shrink-0" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search Name"
                className="bg-transparent border-0 rounded-xl placeholder:text-black/50 focus-visible:ring-0 h-8 w-[430px]"
              />
              <FaSearch color={'#2D317F'} size={18} className="shrink-0" />
            </div>

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
                {['Warehouse ID', 'Office ID', 'Name', 'Email', 'User Level', 'Status', 'Action'].map(h => (
                  <TableHead key={h} className="text-[#2D317F] font-bold text-center text-sm xl:text-base">
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3 text-[#2D317F]">
                      <div className="w-8 h-8 border-4 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">Loading users...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-gray-400 text-sm">
                    No {userStatus.toLowerCase()} users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.user_id}>
                    <TableCell className="text-center text-[#2D317F]">{user.WHCode}</TableCell>
                    <TableCell className="text-center text-[#2D317F]">{user.Office_id}</TableCell>
                    <TableCell className="text-center text-[#2D317F] font-medium">
                      {user.fname} {user.mI} {user.lname}
                    </TableCell>
                    <TableCell className="text-center text-[#2D317F]">{user.email}</TableCell>
                    <TableCell className="text-center text-[#2D317F]">{user.user_level}</TableCell>
                    
                    {/* Status */}
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 w-23 rounded-full text-xs font-semibold ${
                        user.status === 'Active' ? 'bg-green-100 text-[#1D8104]' : 'bg-red-100 text-[#BB2325]'
                      }`}>
                        <CiUser className='h-4 w-4'/>
                        {user.status}
                      </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        {/* Edit */}
                        <Button
                          onClick={() => { setSelectedEmployee(user); setView('edit') }}
                          variant="ghost"
                          className="flex items-center gap-1.5 px-3 py-2 h-auto bg-transparent text-[#2D317F] border border-[#2D317F] rounded-full"
                        >
                          <SquarePen className="w-4 h-4" color="#2D317F" />
                          <span className="text-xs font-medium text-[#2D317F]">Edit</span>
                        </Button>

                        {/* deactivate / reactivate */}
                        {user.status === 'Active' ? (
                          <Button
                            onClick={() => setArchiveDialog({ open: true, userId: user.user_id })}
                            variant="ghost"
                            className="flex items-center gap-1.5 px-3 py-2 h-auto bg-transparent text-[#BB2325] border border-[#BB2325] rounded-full hover:bg-red-50"
                          >
                            <UserX className="w-4 h-4" color="#BB2325" />
                            <span className="text-xs font-medium text-[#BB2325]">Deactivate</span>
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setReactivateDialog({ open: true, userId: user.user_id })}
                            variant="ghost"
                            className="flex items-center gap-1.5 px-3 py-2 h-auto bg-transparent text-[#1D8104] border border-[#1D8104] rounded-full"
                          >
                            <UserRoundCheck className="w-4 h-4" color="#1D8104" />
                            <span className="text-xs font-medium text-[#1D8104]">Reactivate</span>
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

        {/* deactivate dialog */}
        <Dialog open={archiveDialog.open} onOpenChange={() => setArchiveDialog({ open: false, userId: null })}>
          <DialogContent className='bg-[#F8F8F8] [&>button]:hidden px-0 !pt-0 !max-w-[400px] shadow-2xl'>
            <div className='bg-[#BB2325] py-3 rounded-t-lg'></div>
            <div className='bg-[#BB2325] py-5 rounded-full flex justify-center mx-38 mb-3 mt-5'>
              <FaUserTimes className="w-12 h-12" color='white' />
            </div>
            <DialogHeader>
              <div className='text-center'>
                <p className='text-[#BB2325] font-bold text-xl'>Deactivate Employee</p>
                <p className='text-sm mx-5 mt-2 text-[#051F52]'>Are you sure you want to deactivate this Employee? You can restore it later if needed.</p>
              </div>
              <DialogDescription className='flex flex-col gap-5'>
                <div className='flex justify-center gap-3 mt-6 mb-5'>
                  <Button
                    variant="ghost"
                    onClick={() => setArchiveDialog({ open: false, userId: null })}
                    className='px-7 py-4.5 rounded-md bg-[#D9D9D9] text-black font-medium hover:bg-gray-300'
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleArchive}
                    className='px-7 py-4.5 rounded-md bg-[#BB2325] text-white font-medium hover:bg-red-700'
                  >
                    Deactivate
                  </Button>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        
        {/* reactivate modal */}
        <Dialog open={reactivateDialog.open} onOpenChange={() => setReactivateDialog({ open: false, userId: null })}>
          <DialogContent className='bg-[#F8F8F8] [&>button]:hidden px-0 !pt-0 !max-w-[400px] shadow-2xl'>
            <div className='bg-[#1D8104] py-3 rounded-t-lg'></div>
            <div className='bg-[#1D8104] py-5 rounded-full flex justify-center mx-38 mb-3 mt-5'>
              <UserRoundCheck className="w-12 h-12" color='white' />
            </div>
            <DialogHeader>
              <div className='text-center'>
                <p className='text-[#1D8104] font-bold text-xl'>Reactivate Employee</p>
                <p className='text-sm mx-5 mt-2 text-[#051F52]'>Are you sure you want to reactivate this Employee?</p>
              </div>
              <DialogDescription className='flex flex-col gap-5'>
                <div className='flex justify-center gap-3 mt-6 mb-5'>
                  <Button
                    variant="ghost"
                    onClick={() => setReactivateDialog({ open: false, userId: null })}
                    className='px-7 py-4.5 rounded-md bg-[#D9D9D9] text-black font-medium hover:bg-gray-300'
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleReactivate}
                    className='px-7 py-4.5 rounded-md bg-[#1D8104] text-white font-medium hover:bg-green-700'
                  >
                    Reactivate
                  </Button>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        
        {/* toasts */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          {toasts.map(toast => (
            <div key={toast.id} className="flex items-center gap-3 bg-white rounded-lg shadow-2xl px-5 py-4 min-w-[300px]" style={{ borderLeft: `4px solid ${toast.color}` }}>
              <div className="rounded-full p-1.5 flex-shrink-0" style={{ backgroundColor: toast.color }}>
                <FaCheck size={16} color="white" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: toast.color }}>Success!</p>
                <p className="text-gray-500 text-xs">{toast.message}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  )
}