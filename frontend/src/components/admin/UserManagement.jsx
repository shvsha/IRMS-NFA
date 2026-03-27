import '../../styles/admin/UserManagement.css'
import { useState } from 'react'

// components
import EmployeeForm from './EmployeeForm';

// shadcn components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

// react icon
import { FaEdit, FaSearch } from "react-icons/fa";
import { FaC, FaPlus } from "react-icons/fa6";
import { IoArchiveOutline } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";

export default function UserManagement() {
  // us
  const [search, setSearch] = useState("");
  const [userStatus, setUserStatus] = useState("All Users")
  const [users, setUsers] = useState([
  { warehouseId: 'WH-001', officeId: 'OF-001', name: 'Ronnel C. Jucutan', email: 'ronnel@nfa.gov.ph', userLevel: 'Admin', position: 'QA', status: 'Active' },
  { warehouseId: 'WH-002', officeId: 'OF-002', name: 'Febore Valenzuela', email: 'febore@nfa.gov.ph', userLevel: 'User', position: 'Statistician', status: 'Inactive' },
  { warehouseId: 'WH-003', officeId: 'OF-003', name: 'Louie Valenzuela', email: 'louie@nfa.gov.ph', userLevel: 'User', position: 'Warehouse Supervisor', status: 'Active' },
])

  //for modals
const [archiveOpen, setArchiveOpen] = useState(false)
const [archiveStep, setArchiveStep] = useState("confirm") // "confirm" | "success"

  // for employee form (add and edit)
  const [view, setView] = useState("list");
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // sample user reporsts (remove later when database is present)
  const [sampleUser, setSampleUser] = useState([
    { id: '23100123', name: 'Ronnel C. Jucutan', email: 'ronneljucutan@nfa.gov.ph', userLevel: 'Admin', position: 'QA' },
    { id: '23100124', name: 'Febore Valenzuela', email: 'febrosevalenzuela@nfa.gov.ph', userLevel: 'User', position: 'Statistician' },
    { id: '23100125', name: 'Ronnel C. Jucutan', email: 'ronneljucutan@nfa.gov.ph', userLevel: 'User', position: 'QA' },
    { id: '23100126', name:  'Louie Valenzuela', email: 'louievalenzuela@nfa.gov.ph', userLevel: 'User', position: "Warehouse Supervisor"}
  ])

  // custome functions
  const filterUser = users
    .filter(u => userStatus === "All Users" ? true : u.status === userStatus)
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()))

  const handleBack = () => {
    setView("list");
    setSelectedEmployee(null);
  };

  const handleArchive = () => {
    
  }

  // Show employee form instead of the user list when in edit or add mode
  if (view === "add") {
    return <EmployeeForm mode="add" onCancel={handleBack} />;
  }
  if (view === "edit") {
    return <EmployeeForm mode="edit" employeeData={selectedEmployee} onCancel={handleBack} />;
  }

  return (
    <div className='bg-white m-7.5'>
      <div className='flex justify-between items-center mx-7.5 py-4'>
        <p className='text-[#0B3B66] font-bold text-2xl'>User Management</p>
        
        <div className='flex items-center gap-8'>
          <Select value={userStatus} onValueChange={(v) => {
            setUserStatus(v)
          }}>
            <SelectTrigger className="w-45 bg-white border border-gray-300 rounded-md">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className='p-2' value="All Users">All Users</SelectItem>
              <SelectItem className='p-2' value="Active">Active</SelectItem>
              <SelectItem className='p-2' value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <div className='flex items-center bg-[#2D317F] rounded-2xl px-3 py-1.5 gap-2'>
            <Input
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Name"
              className="bg-transparent border-0 rounded-xl text-white placeholder:text-white/60 focus-visible:ring-0 focus-visible:border-white h-8 w-[430px]"
            />
            <FaSearch color='white' size={18} className='shrink-0' />
          </div>

          <Button onClick={() => setView('add')} className=" p-5 py-5.5 rounded-xl bg-[#2D317F] text-white">
           <FaPlus color={'white'}/> Add Employee
          </Button>
        </div>

      </div>
      <div className='table-wrapper'>
        <Table>
          <TableHeader className='text-center'>
            <TableRow className='bg-[#E2EBFF]'>
              <TableHead className='text-[#2D317F] font-bold py-3 text-center '>Warehouse ID</TableHead>
              <TableHead className='text-[#2D317F] font-bold py-3 text-center '>Office ID</TableHead>
              <TableHead className='text-[#2D317F] font-bold py-3 text-center '>Name</TableHead>
              <TableHead className='text-[#2D317F] font-bold py-3 text-center '>Email</TableHead>
              <TableHead className='text-[#2D317F] font-bold py-3 text-center '>User Level</TableHead>
              <TableHead className='text-[#2D317F] font-bold py-3 text-center '>Position</TableHead>
              <TableHead className='text-[#2D317F] font-bold py-3 text-center '>Status</TableHead>
              <TableHead className='text-[#2D317F] font-bold py-3 text-center '>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filterUser.map((user, index) => (
              <TableRow
                key={user.warehouseId}
              >
                <TableCell className='text-center'>{user.warehouseId}</TableCell>
                <TableCell className='text-center'>{user.officeId}</TableCell>
                <TableCell className='text-center'>{user.name}</TableCell>
                <TableCell className='text-center'>{user.email}</TableCell>
                <TableCell className='text-center'>{user.userLevel}</TableCell>
                <TableCell className='text-center'>{user.position}</TableCell>
                <TableCell className='text-center'>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold w-24 inline-block text-center ${
                    user.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className='text-center flex justify-center gap-2'>
                  {/* edit user */}
                  <Button onClick={() => {
                    setSelectedEmployee(user);
                    setView("edit");
                  }} variant='ghost' className='bg-transparent border-0 h-10 w-10 p-0 hover:bg-blue-50 [&_svg]:!w-6 [&_svg]:!h-5'>
                    <FaEdit color={"#2D317F"} />
                  </Button>

                  {/* archive user */}
                  <AlertDialog open={archiveOpen} onOpenChange={(open) => {
                    if (!open) {
                      setArchiveOpen(false)
                      setTimeout(() => setArchiveStep("confirm"), 200)
                    }
                  }}>
                    <AlertDialogTrigger asChild>
                      <Button
                        onClick={() => { setArchiveOpen(true); setArchiveStep("confirm") }}
                        variant='ghost'
                        className='bg-transparent border-0 h-10 w-10 p-0 hover:bg-blue-50 [&_svg]:!w-6 [&_svg]:!h-5'
                      >
                        <IoArchiveOutline color={"#2D317F"} />
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent className='pt-0 px-0 pb-0 overflow-hidden !shadow-none !ring-0'>
                      <div className={`transition-all duration-300 ease-in-out ${
                        archiveStep === "confirm"
                          ? "opacity-100 translate-y-0 pointer-events-auto"
                          : "opacity-0 -translate-y-4 pointer-events-none absolute inset-0"
                      }`}>
                        <div className='h-7 bg-[#2D317F]'></div>
                        <AlertDialogHeader className='p-5 text-center items-center pb-4'>
                          <div className='bg-[#ADCEFF] rounded-full p-6'>
                            <IoArchiveOutline size={60} color='#2D317F' />
                          </div>
                          <AlertDialogTitle className='font-bold text-[#2D317F] text-3xl'>Archive User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to archive this user?<br />You can restore it later if needed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className='mx-0 mb-4 -mt-3 bg-transparent flex flex-row !justify-center gap-3 border-0 items-center'>
                          <AlertDialogCancel className='px-5 py-4.5 rounded font-medium !bg-[#D9D9D9] !text-[#5B5B5B]'>Cancel</AlertDialogCancel>
                          <button
                            onClick={() => {
                              handleArchive(user.warehouseId)
                              setArchiveStep("success")
                            }}
                            className='bg-[#2D317F] text-white px-5 py-2 rounded-lg text-sm font-medium'
                          >
                            Archive
                          </button>
                        </AlertDialogFooter>
                      </div>

                      {/* Success Step */}
                      <div className={`transition-all duration-200 ease-in-out ${
                        archiveStep === "success"
                          ? "opacity-100 translate-y-0 pointer-events-auto"
                          : "opacity-0 translate-y-4 pointer-events-none absolute inset-0"
                      }`}>
                        <div className='h-7 bg-[#3E7A43]'></div>
                        <AlertDialogHeader className='p-5 text-center items-center pb-4'>
                          <div className='bg-[#3E7A43] rounded-full p-4.5'>
                            <FaCheck size={60} color='white' />
                          </div>
                          <AlertDialogTitle className='font-bold text-[#3E7A43] text-3xl'>Success!</AlertDialogTitle>
                          <AlertDialogDescription className='mb-3'>
                            Employee has been archived.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className='mx-0 mb-7 -mt-5 bg-transparent flex flex-row !justify-center gap-3 border-0 items-center'>
                          <button
                            onClick={() => {
                              setArchiveOpen(false)
                              setTimeout(() => setArchiveStep("confirm"), 200)
                            }}
                            className='bg-[#3E7A43] text-white px-5 py-2.5 rounded-md text-sm font-medium -mb-3'
                          >
                            Done
                          </button>
                        </AlertDialogFooter>
                      </div>

                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>


    
    </div>
  )
}
