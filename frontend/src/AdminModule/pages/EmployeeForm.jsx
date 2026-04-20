// shadcn
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

// react
import { useState } from "react"
import api from '../../api/axios'

// icons
import { FaExclamation } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
import { Eye, EyeOff } from "lucide-react"


export default function EmployeeForm({ mode = 'add', employeeData = null, onCancel }) {
  const isEdit = mode === 'edit';

  // us
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // fields
  const [formData, setFormData] = useState({
    fname: isEdit ? employeeData?.fname : "",
    mI: isEdit ? employeeData?.mI : "",
    lname: isEdit ? employeeData?.lname : "",
    email: isEdit ? employeeData.email: "",
    user_level: isEdit ? employeeData.user_level : "Admin",
    dept: isEdit ? employeeData?.dept : "Quality Assurance",
    position: isEdit ? employeeData?.position : "Quality Assurance Officer",
    WHCode: isEdit ? employeeData?.WHCode : "010501A",
    Office_id: isEdit ? employeeData?.Office_id : "",
    username: isEdit ? employeeData?.username : "",
    password: "",
    confirmPassword: "",
  })

  // dropdown for form
  const [selectedUserLevel, setSelectedUserLevel] = useState(
    isEdit ? employeeData?.user_level : "Admin"
  )
  const [selectedDepartment, setSelectedDepartment] = useState(
    isEdit ? employeeData?.dept : "Quality Assurance"
  )
  const [selectedPosition, setSelectedPosition] = useState(
    isEdit ? employeeData?.position : "Quality Assurance Officer"
  )
  const [selectedWhseCode, setSelectedWhseCode] = useState(
    isEdit ? employeeData?.WHCode : "010501A"
  )

  const handleDeptChange = (val) => { 
    setSelectedDepartment(val);
    setFormData( prev => ({
      ...prev,
      dept: val
    }));
  }
  const handlePosChange = (val) => { 
    setSelectedPosition(val); 
    setFormData( prev => ({
      ...prev,
      position: val
    }));
  }
  const handleWhseCodeChange = (val) => { 
    setSelectedWhseCode(val); 
    setFormData( prev => ({
      ...prev,
      WHCode: val
    }));
  }
  const handleUserLevelChange = (val) => { 
    setSelectedUserLevel(val);
    setFormData( prev => ({
      ...prev,
      user_level: val
    }));
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData)

    // validation for the required fields
    const requiredFields = ['fname', 'mI', 'lname', 'email', 'dept', 'position', 'WHCode', 'Office_id', 'username'];
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        alert(`Please fill in all required fields.`);
        return;
      }
    }

    // validation for passwords
    if (!isEdit) {
      if (!formData.password || !formData.confirmPassword) {
        alert("Please fill in password fields.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
    }

    try {
      if (isEdit) {
        await api.put(`/api/users/${employeeData.user_id}/`, formData);
      } else {
        await api.post('api/users/', formData);
      }
      setShowSuccessModal(true);
    } catch (error) {
      const errors = error.response?.data;
      if (errors) {
        const firstError = Object.values(errors)[0];
        alert(Array.isArray(firstError) ? firstError[0] : firstError);
      } else {
        alert("Something went wrong. Please try again.")
      }
    }
  }



  return (
    <>
      <form onSubmit={handleSubmit} className="h-full">
        <div className="mx-7.5 my-4 text-[#2D317F] bg-white p-6 pb-4 h-[calc(100%-2rem)] overflow-auto">
          <h2 className="m-0 font-bold text-2xl  ">{isEdit ? "Edit Employee" : "Add New Employee"}</h2>

          {/* name information  */}
          <div className="flex bg-[#E2EBFF] font-bold flex-col py-3.5 px-5 mt-2">
            <p className="text-1xl font-bold mb-2">Name</p>

            <div className="flex flex-row gap-5 flex-wrap">
              {/* first name */}
              <Field className="flex gap-2 flex-col w-fit">
                <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="firstName">First Name</FieldLabel>
                <Input
                  className=" rounded border-[#ccc] text-xs bg-white w-24 !font-normal"
                  id="firstName"
                  name="fname"
                  value={formData.fname}
                  onChange={handleChange}
                  type="text"
                />
              </Field>
              {/* middle initial */}
              <Field className="flex gap-2 flex-col w-fit">
                <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="middleInitial">Middle Initial</FieldLabel>
                <Input
                  className="py-1 px-3 rounded border-[#ccc] text-xs bg-white w-24 !font-normal"
                  id="middleInitial"
                  name="mI"
                  value={formData.mI}
                  onChange={handleChange}
                  type="text"
                />
              </Field>
              {/* last name */}
              <Field className="flex gap-2 flex-col w-fit">
                <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="lastName">Last Name</FieldLabel>
                <Input
                  className="py-1 px-3 rounded border-[#ccc] text-xs bg-white w-24 !font-normal"
                  id="lastName"
                  name="lname"
                  value={formData.lname}
                  onChange={handleChange}
                  type="text"
                />
              </Field>
              {/* email */}
              <Field className="flex gap-2 flex-col w-fit" >
                <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="email">Email</FieldLabel>
                <Input
                  className="py-1 px-3 rounded border-[#ccc] text-xs bg-white w-24 !font-normal"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                />
              </Field>
              {/* user level */}
              <Field className="flex gap-2 flex-col w-fit" >
                <FieldLabel className="text-base font-semibold text-[#2D317F] " htmlFor="userlevel">User Level</FieldLabel>

                <Select 
                  value={selectedUserLevel} 
                  onValueChange={handleUserLevelChange}
                >
                  <SelectTrigger className="!font-normal !w-50 bg-white rounded">
                    <SelectValue placeholder="Select User Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className='p-2' value="Admin">Admin</SelectItem>
                    <SelectItem className='p-2' value="Warehouse Supervisor">Warehouse Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          {/* department info */}
          <div className="flex bg-[#E2EBFF] font-bold flex-col py-3.5 px-5 mt-2" >
            <p className="text-1xl font-bold mb-2">Department Information</p>
            {/* department */}
            <div className="flex flex-row gap-5 flex-wrap">
              <Field className="flex gap-2 flex-col w-fit" >
                <FieldLabel className="text-base font-semibold text-[#2D317F] " htmlFor="department">Department</FieldLabel>

                <Select 
                  value={selectedDepartment} 
                  onValueChange={handleDeptChange}
                >
                  <SelectTrigger className="!font-normal !w-60 bg-white rounded">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className='p-2' value="Quality Assurance">Quality Assurance</SelectItem>
                    <SelectItem className='p-2' value="Buffer Stock Management">Buffer Stock Management</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {/* position */}
              <Field className="flex gap-2 flex-col w-fit" >
                <FieldLabel className="text-base font-semibold text-[#2D317F] " htmlFor="department">Position</FieldLabel>

                <Select 
                  value={selectedPosition} 
                  onValueChange={handlePosChange}
                >
                  <SelectTrigger className="!font-normal !w-60 bg-white rounded">
                    <SelectValue placeholder="Select Position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className='p-2' value="Quality Assurance Officer">Quality Assurance Officer</SelectItem>
                    <SelectItem className='p-2' value="Statistician">Statistician</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {/* whse code */}
              <Field className="flex gap-2 flex-col w-fit" >
                <FieldLabel className="text-base font-semibold text-[#2D317F] " htmlFor="department">Warehouse Code</FieldLabel>

                <Select 
                  value={selectedWhseCode} 
                  onValueChange={handleWhseCodeChange}
                >
                  <SelectTrigger className="!font-normal !w-60 bg-white rounded">
                    <SelectValue placeholder="Select Warehouse Code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className='p-2' value="010501A">010501A</SelectItem>
                    <SelectItem className='p-2' value="010502A">010502A</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {/* office id */}
              <Field className="flex gap-2 flex-col w-fit" >
                <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="officeId">Office ID</FieldLabel>
                <Input
                  className="py-1 px-3 rounded border-[#ccc] text-xs bg-white w-24 !font-normal"
                  id="officeId"
                  name="Office_id"
                  value={formData.Office_id}
                  onChange={handleChange}
                  type="text"
                />
              </Field>
            </div>
          </div>

          {/* login credentials */}
          <div className="flex bg-[#E2EBFF] font-bold flex-col py-3.5 px-5 mt-2">
            <p className="text-1xl font-bold mb-2">Login Credentials</p>

            <div className="flex flex-row gap-5 flex-wrap">
            {/* username */}
              <Field className="flex gap-2 flex-col w-fit" >
                <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="username">Username</FieldLabel>
                <Input
                  className="py-1 px-3 rounded border-[#ccc] text-xs bg-white w-24 !font-normal"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  type="text"
                />
              </Field>
              {/* password */}
              <Field className="flex gap-2 flex-col w-fit" >
                <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    className="py-1 px-3 rounded border-[#ccc] text-xs bg-white !w-50 !font-normal"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D317F] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              {/* confirm password */}
              <Field className="flex gap-2 flex-col w-fit" >
                <FieldLabel className="text-base font-semibold text-[#2D317F]" htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <div className="relative"> 
                  <Input
                    className="py-1 px-3 rounded border-[#ccc] text-xs bg-white !w-50 !font-normal"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type={showConfirmPassword ? "text" : "password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D317F] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
            </div>
          </div>

          <div className="mt-2.5 flex justify-end gap-4">
            {/* cancel btn */}
            <AlertDialog>
              <AlertDialogTrigger className='flex items-center justify-center pr-7.5 '  asChild>
                <Button className="w-20 px-4 py-3 bg-[#D9D9D9] text-[#5B5B5B]" type='button'>Cancel</Button>
              </AlertDialogTrigger>

              <AlertDialogContent className='pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 max-w-[90vw] md:max-w-[600px] xl:max-w-[650px] overflow-hidden rounded-[10px] border-none'>
                <div className='h-7 bg-[#BB2325] rounded-t-lg'></div>
                <AlertDialogHeader className='p-5 text-center items-center pb-4'>
                  <div className="rounded-full px-5 py-5 bg-[#BB2325]"><FaExclamation color={'white'} size={60} /></div>
                  <AlertDialogTitle className='!font-bold text-[#2D317F] text-2xl mx-2'>{isEdit ? "Cancel Editing?" : "Cancel Adding?"}</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm px-2 !-mb-5" >
                    {isEdit ? 
                      <>
                        Your data won’t be saved! Are you sure you want to quit editing?
                      </> : (
                      <>
                        Your data won't be saved! Are you sure you want to quit adding new employee?
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className='mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0'>
                  <AlertDialogCancel className='w-23 px-5 py-4.5'>Cancel</AlertDialogCancel>
                  <AlertDialogAction className='w-23 !bg-[#BB2325] text-white hover:bg-[#770e10] px-5 py-4.5' onClick={onCancel}>Yes</AlertDialogAction>
                </AlertDialogFooter>

              </AlertDialogContent>
            </AlertDialog>

            {/* save/update btn */}
            <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
              <AlertDialogContent className='pt-0 px-0 bg-[#E6EEF6] pb-0'>
                <div className='h-7 bg-[#3E7A43] rounded-t-lg'></div>
                <AlertDialogHeader className='p-5 text-center items-center pb-4'>
                  <div className="rounded-full px-5 py-5 bg-[#3E7A43]"><FaCheck color={'white'} size={60} /></div>
                  <AlertDialogTitle className='!font-bold text-[#2D317F] text-2xl mx-2'>Success!</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm px-2 !-mb-5" >
                    {isEdit ? 
                      <>
                        Your changes have been saved
                      </> : (
                      <>
                        New employee has been added
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className='mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0'>
                  <AlertDialogAction className='w-23 !bg-[#3E7A43] text-white hover:bg-[#1f5b24] px-5 py-4.5 !-mt-3' onClick={onCancel}>Done</AlertDialogAction>
                </AlertDialogFooter>

              </AlertDialogContent>
            </AlertDialog>
            <Button className="w-20 px-4 py-3 bg-[#2D317F] text-white"type="submit">{isEdit ? "Update" : "Save"}</Button>
          </div>
        </div>
      </form>

      
        
    </>
  )
}
