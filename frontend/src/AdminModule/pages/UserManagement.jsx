import { useState, useEffect } from 'react'
import api from '../../api/axios'
import EmployeeForm from './EmployeeForm'

// shadcn
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

// icons
import { FaEdit, FaSearch, FaCheck } from "react-icons/fa"
import { FaPlus } from "react-icons/fa6"
import { IoArchiveOutline } from "react-icons/io5"
import { MdUnarchive } from "react-icons/md"

// ── Reusable confirmation dialog ───────────────────────────
function ConfirmDialog({ open, onClose, onConfirm, icon, iconBg, title, description, confirmLabel, confirmBg }) {
  const [step, setStep] = useState('confirm')

  useEffect(() => {
    if (!open) setTimeout(() => setStep('confirm'), 200)
  }, [open])

  const handleConfirm = async () => {
    await onConfirm()
    setStep('success')
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="pt-0 px-0 pb-0 overflow-hidden !shadow-none !ring-0">
        {step === 'confirm' ? (
          <>
            <div className={`h-7 ${confirmBg}`} />
            <AlertDialogHeader className="p-5 text-center items-center pb-4">
              <div className={`${iconBg} rounded-full p-6`}>{icon}</div>
              <AlertDialogTitle className={`font-bold text-3xl`} style={{ color: confirmBg.replace('bg-[', '').replace(']', '') }}>
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription>{description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mx-0 mb-4 -mt-3 bg-transparent flex flex-row !justify-center gap-3 border-0 items-center">
              <AlertDialogCancel
                className="px-5 py-4.5 rounded font-medium !bg-[#D9D9D9] !text-[#5B5B5B]"
                onClick={onClose}
              >Cancel</AlertDialogCancel>
              <button
                onClick={handleConfirm}
                className={`${confirmBg} text-white px-5 py-2 rounded-lg text-sm font-medium`}
              >{confirmLabel}</button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <div className="h-7 bg-[#3E7A43]" />
            <AlertDialogHeader className="p-5 text-center items-center pb-4">
              <div className="bg-[#3E7A43] rounded-full p-4.5">
                <FaCheck size={60} color="white" />
              </div>
              <AlertDialogTitle className="font-bold text-[#3E7A43] text-3xl">Success!</AlertDialogTitle>
              <AlertDialogDescription className="mb-3">
                {title === 'Archive User' ? 'User has been archived.' : 'User has been reactivated.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mx-0 mb-7 -mt-5 bg-transparent flex flex-row !justify-center gap-3 border-0 items-center">
              <button
                onClick={onClose}
                className="bg-[#3E7A43] text-white px-5 py-2.5 rounded-md text-sm font-medium -mb-3"
              >Done</button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ── Main component ─────────────────────────────────────────
export default function UserManagement() {
  const [search, setSearch]         = useState('')
  const [userStatus, setUserStatus] = useState('Active')
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [view, setView]             = useState('list')
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // dialog state
  const [archiveDialog, setArchiveDialog]       = useState({ open: false, userId: null })
  const [reactivateDialog, setReactivateDialog] = useState({ open: false, userId: null })

  // fetch users
  useEffect(() => {
    setLoading(true)
    api.get('/api/users/')
      .then(res => setUsers(res.data))
      .catch(err => console.error('Failed to fetch users', err))
      .finally(() => setLoading(false))
  }, [refreshKey])

  const filteredUsers = users
    .filter(u => u.status === userStatus)
    .filter(u => `${u.fname} ${u.lname}`.toLowerCase().includes(search.toLowerCase()))

  const handleBack = () => {
    setView('list')
    setSelectedEmployee(null)
    setRefreshKey(k => k + 1)
  }

  const handleArchive = async () => {
    await api.patch(`/api/users/${archiveDialog.userId}/`)
    setUsers(prev => prev.map(u =>
      u.user_id === archiveDialog.userId ? { ...u, status: 'Inactive' } : u
    ))
  }

  const handleReactivate = async () => {
    await api.patch(`/api/users/${reactivateDialog.userId}/`, { status: 'Active' })
    setUsers(prev => prev.map(u =>
      u.user_id === reactivateDialog.userId ? { ...u, status: 'Active' } : u
    ))
  }

  if (view === 'add')  return <EmployeeForm mode="add"  onCancel={handleBack} />
  if (view === 'edit') return <EmployeeForm mode="edit" employeeData={selectedEmployee} onCancel={handleBack} />

  return (
    <div className="bg-white mx-7.5 my-4 flex flex-col h-[calc(100%-2rem)]">

      {/* Top bar */}
      <div className="flex justify-between items-center mx-7.5 py-4">
        <p className="text-[#0B3B66] font-bold text-2xl">User Management</p>

        <div className="flex items-center gap-8">
          <Select value={userStatus} onValueChange={setUserStatus}>
            <SelectTrigger className="w-45 bg-white border border-gray-300 rounded-md">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="p-2 text-[#2D317F]" value="Active">Active</SelectItem>
              <SelectItem className="p-2 text-[#2D317F]" value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center bg-[#2D317F] rounded-2xl px-3 py-1.5 gap-2">
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Name"
              className="bg-transparent border-0 rounded-xl text-white placeholder:text-white focus-visible:ring-0 h-8 w-[430px]"
            />
            <FaSearch color="white" size={18} className="shrink-0" />
          </div>

          <Button
            onClick={() => setView('add')}
            className="p-5 py-5.5 rounded-xl bg-[#2D317F] text-white"
          >
            <FaPlus color="white" /> Add Employee
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#E2EBFF] border-b border-gray-200 h-10 xl:h-12 2xl:h-[50px]">
              {['Warehouse ID', 'Office ID', 'Name', 'Email', 'User Level', 'Position', 'Status', 'Action'].map(h => (
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
                <TableRow key={user.user_id} className="hover:bg-[#f5f8ff] transition-colors">
                  <TableCell className="text-center text-[#2D317F]">{user.WHCode}</TableCell>
                  <TableCell className="text-center text-[#2D317F]">{user.Office_id}</TableCell>
                  <TableCell className="text-center text-[#2D317F] font-medium">
                    {user.fname} {user.mI} {user.lname}
                  </TableCell>
                  <TableCell className="text-center text-[#2D317F]">{user.email}</TableCell>
                  <TableCell className="text-center text-[#2D317F]">{user.user_level}</TableCell>
                  <TableCell className="text-center text-[#2D317F]">{user.position}</TableCell>
                  <TableCell className="text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold w-24 inline-block text-center ${
                      user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      {/* Edit */}
                      <Button
                        onClick={() => { setSelectedEmployee(user); setView('edit') }}
                        variant="ghost"
                        className="bg-transparent border-0 h-10 w-10 p-0 hover:bg-blue-50 [&_svg]:!w-5 [&_svg]:!h-5"
                      >
                        <FaEdit color="#2D317F" />
                      </Button>

                      {/* Archive / Reactivate */}
                      {user.status === 'Active' ? (
                        <Button
                          onClick={() => setArchiveDialog({ open: true, userId: user.user_id })}
                          variant="ghost"
                          className="bg-transparent border-0 h-10 w-10 p-0 hover:bg-blue-50 [&_svg]:!w-6 [&_svg]:!h-5"
                        >
                          <IoArchiveOutline color="#2D317F" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setReactivateDialog({ open: true, userId: user.user_id })}
                          variant="ghost"
                          className="bg-transparent border-0 h-10 w-10 p-0 hover:bg-blue-50 [&_svg]:!w-6 [&_svg]:!h-5"
                        >
                          <MdUnarchive color="#072560" />
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

      {/* Archive dialog */}
      <ConfirmDialog
        open={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, userId: null })}
        onConfirm={handleArchive}
        icon={<IoArchiveOutline size={60} color="#2D317F" />}
        iconBg="bg-[#ADCEFF]"
        title="Archive User"
        description="Are you sure you want to archive this user? You can restore it later if needed."
        confirmLabel="Archive"
        confirmBg="bg-[#2D317F]"
      />

      {/* Reactivate dialog */}
      <ConfirmDialog
        open={reactivateDialog.open}
        onClose={() => setReactivateDialog({ open: false, userId: null })}
        onConfirm={handleReactivate}
        icon={<MdUnarchive size={60} color="#2D317F" />}
        iconBg="bg-[#ADCEFF]"
        title="Reactivate User"
        description="Are you sure you want to reactivate this user?"
        confirmLabel="Reactivate"
        confirmBg="bg-[#2D317F]"
      />
    </div>
  )
}