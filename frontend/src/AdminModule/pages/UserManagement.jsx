import { useState, useEffect } from 'react'
import api from '../../api/axios'

// components
import EmployeeForm from './EmployeeForm';

// shadcn components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

// icons
import { FaEdit, FaSearch } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { IoArchiveOutline } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";
import { MdUnarchive } from "react-icons/md";

export default function UserManagement() {
  // us
  const [search, setSearch] = useState("");
  const [userStatus, setUserStatus] = useState("Active")

  const [users, setUsers] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)

  //for archive
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [archiveStep, setArchiveStep] = useState("confirm")
  const [archiveUserId, setArchiveUserId] = useState(null)

  // for reactive
  const [reactivateArchiveOpen, setReactivateArchiveOpen] = useState(false)
  const [reactivateArchiveStep, setReactivateArchiveStep] = useState("confirm")
  const [reactivateUserId, setReactivateUserId] = useState(null)

  // for employee form (add and edit)
  const [view, setView] = useState("list");
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  useEffect(() => {
    api.get('/api/users/')
      .then(res => setUsers(res.data))
      .catch(err => console.error("Failed to fetch users", err))
  }, [refreshKey])

  // custome functions
  const filterUser = users
    .filter(u => userStatus === "All Users" ? true : u.status === userStatus)
    .filter(u => `${u.fname} ${u.lname}`.toLowerCase().includes(search.toLowerCase()))

  const handleBack = () => {
    setView("list");
    setSelectedEmployee(null);
    setRefreshKey(k => k + 1);
  };

  // deactive user
  const handleArchive = async (userId) => {
    try {
      await api.patch(`/api/users/${userId}/`);
      setUsers(prev =>
        prev.map(u => u.user_id === userId ? {...u, status: "Inactive"} : u)
      );
      setArchiveStep("success");
    } catch (error) {
      alert('Failed to archive user.');
    }
  }
  // activate user
  const handleReactivate = async (userId) => {
    try {
      await api.patch(`/api/users/${userId}/`, { status: 'Active'});
      setUsers(prev =>
        prev.map(u => u.user_id === userId ? {...u, status: "Active"} : u)
      );
      setReactivateArchiveStep("success");
    } catch (error) {
      alert('Failed to reactivate user.');
    }
  }
  

  // Show employee form instead of the user list when in edit or add mode
  if (view === "add") {
    return <EmployeeForm mode="add" onCancel={handleBack} />;
  }
  if (view === "edit") {
    return <EmployeeForm mode="edit" employeeData={selectedEmployee} onCancel={handleBack} />;
  }

  return (
    <div className='bg-white mx-7.5 my-4 flex flex-col h-[calc(100%-2rem)]'>
      <div className='flex justify-between items-center mx-7.5 py-4'>
        <p className='text-[#0B3B66] font-bold text-2xl'>User Management</p>
        
        <div className='flex items-center gap-8'>
          <Select value={userStatus} onValueChange={(v) => {
            setUserStatus(v)
            setArchiveOpen(false)
            setArchiveStep("confirm")
            setReactivateArchiveOpen(false)
            setReactivateArchiveStep("confirm")
          }}>
            <SelectTrigger className="w-45 bg-white border border-gray-300 rounded-md">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>

              <SelectItem className='p-2 text-[#2D317F]' value="Active">Active</SelectItem>
              <SelectItem className='p-2 text-[#2D317F]' value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <div className='flex items-center bg-[#2D317F] rounded-2xl px-3 py-1.5 gap-2'>
            <Input
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Name"
              className="bg-transparent border-0 rounded-xl text-white placeholder:text-white focus-visible:ring-0 focus-visible:border-white h-8 w-[430px] "
            />
            <FaSearch color='white' size={18} className='shrink-0' />
          </div>

          <Button onClick={() => setView('add')} className=" p-5 py-5.5 rounded-xl bg-[#2D317F] text-white">
           <FaPlus color={'white'}/> Add Employee
          </Button>
        </div>

      </div>

      {/* archive */}
      <AlertDialog 
        open={archiveOpen} 
        step={archiveStep}
        onConfirm={() => handleArchive(archiveUserId)}
        onClose={() => { setArchiveOpen(false); setTimeout(() => setArchiveStep("confirm"), 200) }}
        >

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
              <AlertDialogCancel className='px-5 py-4.5 rounded font-medium !bg-[#D9D9D9] !text-[#5B5B5B]' onClick={() => setArchiveOpen(false)}>Cancel</AlertDialogCancel>
              <button
                onClick={() => {
                  handleArchive(archiveUserId)
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
                User has been archived.
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

      {/* reactivate */}
      <AlertDialog 
        open={reactivateArchiveOpen}
        step={reactivateArchiveStep}
        onConfirm={() => handleReactivate(reactivateUserId)}
        onClose={() => { setReactivateArchiveOpen(false); setTimeout(() => setReactivateArchiveStep("confirm"), 200) }}         
        >
        <AlertDialogContent className='pt-0 px-0 pb-0 overflow-hidden !shadow-none !ring-0'>
          <div className={`transition-all duration-300 ease-in-out ${
            reactivateArchiveStep === "confirm"
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-4 pointer-events-none absolute inset-0"
          }`}>
            <div className='h-7 bg-[#2D317F]'></div>
            <AlertDialogHeader className='p-5 text-center items-center pb-4'>
              <div className='bg-[#ADCEFF] rounded-full p-6'>
                <MdUnarchive size={60} color='#2D317F' />
              </div>
              <AlertDialogTitle className='font-bold text-[#2D317F] text-3xl'>Reactivate User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reactivate this user?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='mx-0 mb-4 -mt-3 bg-transparent flex flex-row !justify-center gap-3 border-0 items-center'>
              <AlertDialogCancel className='px-5 py-4.5 rounded font-medium !bg-[#D9D9D9] !text-[#5B5B5B]' onClick={() => setReactivateArchiveOpen(false)}>Cancel</AlertDialogCancel>
              <button
                onClick={() => {
                  handleReactivate(reactivateUserId)
                }}
                className='bg-[#2D317F] text-white px-5 py-2 rounded-lg text-sm font-medium'
              >
                Reactivate
              </button>
            </AlertDialogFooter>
          </div>

          {/* Success Step */}
          <div className={`transition-all duration-200 ease-in-out ${
            reactivateArchiveStep === "success"
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
                User has been reactivated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='mx-0 mb-7 -mt-5 bg-transparent flex flex-row !justify-center gap-3 border-0 items-center'>
              <button
                onClick={() => {
                  setReactivateArchiveOpen(false)
                  setTimeout(() => setReactivateArchiveStep("confirm"), 200)
                }}
                className='bg-[#3E7A43] text-white px-5 py-2.5 rounded-md text-sm font-medium -mb-3'
              >
                Done
              </button>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
                    
      <div className='flex-1 overflow-auto'>
        <Table>
          <TableHeader className='text-center'>
            <TableRow className='bg-[#E2EBFF] text-[#2D317F] font-medium border-b border-gray-200 h-10 xl:h-12 2xl:h-[50px]'>
              <TableHead className='text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base'>Warehouse ID</TableHead>
              <TableHead className='text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base'>Office ID</TableHead>
              <TableHead className='text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base'>Name</TableHead>
              <TableHead className='text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base'>Email</TableHead>
              <TableHead className='text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base'>User Level</TableHead>
              <TableHead className='text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base'>Position</TableHead>
              <TableHead className='text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base'>Status</TableHead>
              <TableHead className='text-[#2D317F] font-bold text-center h-10 xl:h-12 2xl:h-[50px] text-sm xl:text-base'>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filterUser.map((user, index) => (
              <TableRow
                key={user.user_id}
              >
                <TableCell className='text-center'>{user.WHCode}</TableCell>
                <TableCell className='text-center'>{user.Office_id}</TableCell>
                <TableCell className='text-center'>{user.fname} {user.mI} {user.lname}</TableCell>
                <TableCell className='text-center'>{user.email}</TableCell>
                <TableCell className='text-center'>{user.user_level}</TableCell>
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
                  {user.status === 'Active' ? (
                    <Button
                      onClick={() => {
                        setArchiveUserId(user.user_id)
                        setArchiveOpen(true)
                        setArchiveStep("confirm")
                        // to avoid conflict
                        setReactivateArchiveOpen(false)
                        setReactivateArchiveStep("confirm")
                      }}
                      variant='ghost'
                      className='bg-transparent border-0 h-10 w-10 p-0 hover:bg-blue-50 [&_svg]:!w-6 [&_svg]:!h-5'
                    >
                      <IoArchiveOutline color={"#2D317F"} />
                    </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setReactivateUserId(user.user_id)
                          setReactivateArchiveOpen(true)
                          setReactivateArchiveStep("confirm")
                          // to avoid conflict with modals
                          setArchiveOpen(false)
                          setArchiveStep("confirm")
                        }}
                        variant='ghost'
                        className='bg-transparent border-0 h-10 w-10 p-0 hover:bg-blue-50 [&_svg]:!w-6 [&_svg]:!h-5'
                      >
                        <MdUnarchive color={'#072560'}/>
                      </Button>
                    )
                  }
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>


    
    </div>
  )
}
