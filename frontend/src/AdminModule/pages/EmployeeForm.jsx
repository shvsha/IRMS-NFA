// shadcn
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

// react
import { useState } from "react"
import api from '../../api/axios'

// for notif
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { getNotifRoute } from "@/utils/getNotifRoute"
import { useUnreadCount } from "@/hooks/useUnreadCount"

// icons
import { FaExclamation } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
import { CiUser } from "react-icons/ci"

// components
import Header from '../../components/Header'

export default function EmployeeForm({ mode = 'add', employeeData = null, onCancel }) {
  // for notif
  const user       = useCurrentUser()
  const notifRoute = getNotifRoute(user)
  const userName   = user ? `${user.fname} ${user.lname}` : 'User'
  const unreadCount = useUnreadCount()

  const isEdit = mode === 'edit';

  const [toasts, setToasts] = useState([])
  // inline field errors
  const [fieldErrors, setFieldErrors] = useState({})

  const addToast = (message) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  // fields
  const [formData, setFormData] = useState({
    fname: isEdit ? employeeData?.fname : "",
    mI: isEdit ? employeeData?.mI : "",
    lname: isEdit ? employeeData?.lname : "",
    email: isEdit ? employeeData?.email : "",
    user_level: "Warehouse Supervisor",
    dept: isEdit ? employeeData?.dept : "Quality Assurance",
    position:   "Warehouse Supervisor",  
    WHCode: isEdit ? employeeData?.WHCode : "010501A",
    Office_id: isEdit ? employeeData?.Office_id : "",
    username: isEdit ? employeeData?.username : "",
  })

  // dropdown for form
  const [selectedDepartment, setSelectedDepartment] = useState(
    isEdit ? employeeData?.dept : "Quality Assurance"
  )
  const [selectedWhseCode, setSelectedWhseCode] = useState(
    isEdit ? employeeData?.WHCode : "010501A"
  )

  const handleDeptChange = (val) => { 
    setSelectedDepartment(val);
    setFormData( prev => ({ ...prev, dept: val }));
    setFieldErrors(prev => ({ ...prev, dept: '' }));
  }
  const handleWhseCodeChange = (val) => { 
    setSelectedWhseCode(val); 
    setFormData( prev => ({ ...prev, WHCode: val }));
    setFieldErrors(prev => ({ ...prev, WHCode: '' }));
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build inline errors for all required fields
    const requiredFields = ['fname', 'lname', 'email', 'dept', 'WHCode', 'Office_id', 'username'];
    const errors = {}
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        errors[field] = 'This field is required.'
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    try {
      if (isEdit) {
        await api.put(`/api/users/${employeeData.user_id}/`, formData);
      } else {
        await api.post('api/users/', formData);
      }
      addToast(isEdit ? 'Employee successfully updated.' : 'New employee successfully added.')
      setTimeout(() => onCancel(), 3000)

    } catch (error) {
      const errors = error.response?.data;
      if (errors) {
        // Map server errors back to field-level errors if possible
        const serverErrors = {}
        Object.entries(errors).forEach(([key, val]) => {
          serverErrors[key] = Array.isArray(val) ? val[0] : val
        })
        setFieldErrors(serverErrors)
      } else {
        setFieldErrors({ general: "Something went wrong. Please try again." })
      }
    }
  }

  // Helper: renders the red inline error message
  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <p className="text-red-500 text-xs flex items-center gap-1">
        <span>⊙</span> {fieldErrors[name]}
      </p>
    ) : null

  return (
    <>
     <Header
        pageTitle="Supervisor"
        notifTo={notifRoute}
        userName={userName}
        unreadCount={unreadCount}
      />
      
      <div className="px-6 py-4 ">
        <form onSubmit={handleSubmit}>
          <div className="text-[#2D317F]  pb-4 overflow-auto">
            <h2 className="m-0 font-semibold text-[25px]">{isEdit ? "Edit Employee" : "Add Employee"}</h2>

            <div className="bg-[#F5F9F9] shadow border border-black/5 rounded-lg p-6 px-8 pt-4 mt-1 !min-h-[565px] text-black">
              {/* header */}
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-bold text-lg text-[#2D317F]">
                  {isEdit ? `${employeeData?.fname} ${employeeData?.mI} ${employeeData?.lname}` : "New Employee"}
                </p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  (isEdit ? employeeData?.status : 'Active') === 'Active' ? 'bg-green-100 text-[#1D8104]' : 'bg-red-100 text-[#BB2325]'
                }`}>
                  <CiUser className='h-4 w-4'/>
                  {isEdit ? employeeData?.status : 'Active'}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4 text-sm text-[#2D317F]">
                <p>Fill in the details below for the supervisor account.</p>
                <span>Office ID: {isEdit ? employeeData?.Office_id : '-----'}</span>
              </div>

              {/* personal information */}
              <div className="mb-3">
                <p className="text-xs text-[#2D317F] font-semibold tracking-widest mb-2">PERSONAL INFORMATION</p>
                <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
                  {/* name */}
                  <div className="flex flex-row gap-4 mb-3">
                    <Field className="flex gap-1.5 flex-col w-[250px]">
                      <FieldLabel className="text-[#2D317F] text-sm font-medium" htmlFor="firstName">First Name<span className="text-red-500">*</span></FieldLabel>
                      <Input
                        className={`text-[#2D317F] rounded text-sm bg-white !font-normal ${fieldErrors.fname ? 'border-red-500' : 'border-gray-300'}`}
                        id="firstName" name="fname" value={formData.fname} onChange={handleChange} type="text" placeholder="e.g. Febrose"
                      />
                      <FieldError name="fname" />
                    </Field>
                    <Field className="flex gap-1.5 flex-col w-[250px]">
                      <FieldLabel className="text-[#2D317F] text-sm font-medium" htmlFor="middleInitial">Middle Initial</FieldLabel>
                      <Input className="text-[#2D317F] rounded border-gray-300 text-sm bg-white !font-normal" id="middleInitial" name="mI" value={formData.mI} onChange={handleChange} type="text" placeholder="e.g. C" />
                    </Field>
                    <Field className="flex gap-1.5 flex-col w-[250px]">
                      <FieldLabel className="text-[#2D317F] text-sm font-medium" htmlFor="lastName">Last Name<span className="text-red-500">*</span></FieldLabel>
                      <Input
                        className={`text-[#2D317F] rounded text-sm bg-white !font-normal ${fieldErrors.lname ? 'border-red-500' : 'border-gray-300'}`}
                        id="lastName" name="lname" value={formData.lname} onChange={handleChange} type="text" placeholder="e.g. Valenzuela"
                      />
                      <FieldError name="lname" />
                    </Field>
                  </div>

                  {/* email */}
                  <div className="flex flex-row gap-4">
                    <Field className="flex gap-1.5 flex-col w-[320px]">
                      <FieldLabel className="text-[#2D317F] text-sm font-medium" htmlFor="email">Email <span className="text-red-500">*</span></FieldLabel>
                      <Input
                        className={`text-[#2D317F] rounded text-sm bg-white !font-normal ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                        id="email" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="e.g. febvalenzuela@nfa.gov.ph"
                      />
                      <FieldError name="email" />
                    </Field>
                  </div>
                </div>
              </div>

              {/* department & assignment */}
              <div className="mb-3 text-[#2D317F]">
                <p className="text-xs font-semibold tracking-widest mb-2">DEPARTMENT & ASSIGNMENT</p>
                <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
                  <div className="flex flex-row gap-4 flex-wrap">
                    <Field className="flex gap-1.5 flex-col flex-1 min-w-[150px]">
                      <FieldLabel className="text-sm font-medium">Department <span className="text-red-500">*</span></FieldLabel>
                      <Select value={selectedDepartment} onValueChange={handleDeptChange}>
                        <SelectTrigger className={`!font-normal bg-white rounded ${fieldErrors.dept ? 'border-red-500' : 'border-gray-300'}`}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem className='text-[#2D317F] p-2' value="Quality Assurance">Quality Assurance</SelectItem>
                          <SelectItem className='text-[#2D317F] p-2' value="Buffer Stock Management">Buffer Stock Management</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError name="dept" />
                    </Field>
                    <Field className="flex gap-1.5 flex-col flex-1 min-w-[150px]">
                      <FieldLabel className="text-sm font-medium">Warehouse Code <span className="text-red-500">*</span></FieldLabel>
                      <Select value={selectedWhseCode} onValueChange={handleWhseCodeChange}>
                        <SelectTrigger className={`!font-normal bg-white rounded ${fieldErrors.WHCode ? 'border-red-500' : 'border-gray-300'}`}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem className='p-2' value="010501A">010501A</SelectItem>
                          <SelectItem className='p-2' value="010502A">010502A</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError name="WHCode" />
                    </Field>
                    <Field className="flex gap-1.5 flex-col flex-1 min-w-[120px]">
                      <FieldLabel className="text-sm font-medium">Office ID <span className="text-red-500">*</span></FieldLabel>
                      <Input
                        className={`rounded text-sm bg-white !font-normal ${fieldErrors.Office_id ? 'border-red-500' : 'border-gray-300'}`}
                        name="Office_id" value={formData.Office_id} onChange={handleChange} type="text" placeholder="e.g. 645328"
                      />
                      <FieldError name="Office_id" />
                    </Field>
                  </div>
                </div>
              </div>

              {/* login credentials */}
              <div className="mb-3 text-[#2D317F]">
                <p className="text-xs font-semibold tracking-widest mb-2">LOGIN CREDENTIALS</p>
                <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
                  <div className="flex flex-row gap-4 flex-wrap">
                    <Field className="flex gap-1.5 flex-col w-[250px]">
                      <FieldLabel className="text-sm font-medium" htmlFor="username">Username <span className="text-red-500">*</span></FieldLabel>
                      <Input
                        className={`rounded text-sm bg-white !font-normal ${fieldErrors.username ? 'border-red-500' : 'border-gray-300'}`}
                        id="username" name="username" value={formData.username} onChange={handleChange} type="text" placeholder="e.g. FebValenzuela"
                      />
                      <FieldError name="username" />
                    </Field>
                  </div>
                </div>
              </div>

              {/* general server error */}
              {fieldErrors.general && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⊙</span> {fieldErrors.general}
                </p>
              )}

              <div className="mt-4 flex justify-end gap-4">
                {/* cancel btn */}
                <AlertDialog>
                  <AlertDialogTrigger className='flex items-center justify-center pr-7.5' asChild>
                    <Button className="px-4 py-5 bg-[#D9D9D9] text-[#5B5B5B]" type='button'>Cancel</Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent className='pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 max-w-[90vw] md:max-w-[600px] xl:max-w-[650px] overflow-hidden rounded-[10px] border-none'>
                    <div className='h-7 bg-[#BB2325] rounded-t-lg'></div>
                    <AlertDialogHeader className='p-5 text-center items-center pb-4'>
                      <div className="rounded-full px-5 py-5 my-2 bg-[#BB2325]"><FaExclamation color={'white'} size={60} /></div>
                      <AlertDialogTitle className='!font-bold text-[#BB2325] text-2xl mx-2 mt-2'>{isEdit ? "Cancel Editing?" : "Cancel Adding?"}</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm px-2 mt-3 -mb-2">
                        {isEdit ? 
                          <>Your data won't be saved! Are you sure you want to quit editing?</> : 
                          <>Your data won't be saved! Are you sure you want to quit adding new employee?</>
                        }
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter className='mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0'>
                      <AlertDialogCancel className='w-23 px-5 py-4.5'>Cancel</AlertDialogCancel>
                      <AlertDialogAction className='w-23 !bg-[#BB2325] text-white hover:bg-[#770e10] px-5 py-4.5 mb-3' onClick={onCancel}>Yes</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button className="px-4 py-5 bg-[#2D317F] text-white" type="submit">
                  {isEdit ? "Save Changes" : "Add Employee"}
                </Button>
              </div>
            </div>
          </div>  
        </form> 
      </div>

      {/* toasts */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div key={toast.id} className="flex items-center gap-3 bg-white rounded-lg shadow-2xl px-5 py-4 min-w-[300px] border-l-4 border-[#3E7A43]">
            <div className="rounded-full p-1.5 flex-shrink-0 bg-[#3E7A43]">
              <FaCheck size={16} color="white" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#3E7A43]">Success!</p>
              <p className="text-gray-500 text-xs">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>
        
    </>
  )
}