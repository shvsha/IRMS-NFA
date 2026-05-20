// react
import { useState, useEffect, useRef } from "react"
import api from '../../api/axios'

// notif
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { getNotifRoute } from "@/utils/Import & Export/getNotifRoute"
import { useUnreadCount } from "@/hooks/useUnreadCount"

// shadcn components
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

// components
import Header from '../../components/Header'
import { Toast } from "@/components/Toast"
import { useToast } from "@/hooks/useToast"

// icons
import { FaExclamation, FaCheck } from "react-icons/fa6"
import { CiUser } from "react-icons/ci"
import { ImageUp } from "lucide-react"

const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TOAST_DURATION = 3000

function FieldError({ errors, name }) {
  if (!errors[name]) return null
  return (
    <p className="text-red-500 text-xs flex items-center gap-1">
      <span>⊙</span> {errors[name]}
    </p>
  )
}

const initField = (isEdit, data, key, fallback = '') =>
  isEdit ? data?.[key] ?? fallback : fallback

function ConfirmSubmitDialog({ isEdit, onConfirm, isSubmitting, hasErrors }) {
  const color      = '#3E7A43'
  const label      = isEdit ? 'Save Changes' : 'Add Employee'
  const title      = isEdit ? 'Save Changes?' : 'Add Employee?'
  const description = isEdit
    ? 'Are you sure you want to save the changes made to this employee?'
    : 'Are you sure you want to add this new employee?'

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="px-4 py-5 bg-[#3E7A43] text-white disabled:opacity-50"
          type="button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving…' : label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 max-w-[90vw] !max-w-[320px] overflow-hidden rounded-[10px] border-none">
        <div className="h-5 rounded-t-lg" style={{ backgroundColor: color }} />
        <AlertDialogHeader className="p-5 text-center items-center pb-4">
          <div className="rounded-full px-4 py-4 my-2" style={{ backgroundColor: color }}>
            <FaCheck color="white" size={33} />
          </div>
          <AlertDialogTitle className="!font-bold text-[23px] mx-2 -mb-2" style={{ color }}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[12px] px-2 mt-3 -mb-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0 -mt-2">
          <AlertDialogCancel className="w-23 px-4 py-4">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="w-23 text-white hover:opacity-80 px-4 py-4 mb-1"
            style={{ backgroundColor: color }}
            onClick={onConfirm}
          >
            Yes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function EmployeeForm({ mode = 'add', employeeData = null, onCancel }) {
  const currentUser = useCurrentUser()
  const notifRoute  = getNotifRoute(currentUser)
  const userName    = currentUser ? `${currentUser.fname} ${currentUser.lname}` : 'User'
  const unreadCount = useUnreadCount()

  const isEdit = mode === 'edit'

  const { toasts, addToast } = useToast(TOAST_DURATION)
  const [fieldErrors,  setFieldErrors]  = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const cancelTimerRef = useRef(null)

  // Cleanup redirect timer on unmount
  useEffect(() => {
    return () => { if (cancelTimerRef.current) clearTimeout(cancelTimerRef.current) }
  }, [])

  const [formData, setFormData] = useState({
    fname:      initField(isEdit, employeeData, 'fname'),
    mI:         initField(isEdit, employeeData, 'mI'),
    lname:      initField(isEdit, employeeData, 'lname'),
    email:      initField(isEdit, employeeData, 'email'),
    user_level: initField(isEdit, employeeData, 'user_level', 'Warehouse Supervisor'),
    dept:       initField(isEdit, employeeData, 'dept',       'Quality Assurance'),
    position:   initField(isEdit, employeeData, 'position',   'Warehouse Supervisor'),
    WHCode:     initField(isEdit, employeeData, 'WHCode',     '010501A'),
    Office_id:  initField(isEdit, employeeData, 'Office_id'),
    username:   initField(isEdit, employeeData, 'username'),
  })

  const [signature, setSignature] = useState({
    file:    null,
    preview: isEdit && employeeData?.e_signature_url ? employeeData.e_signature_url : null,
  })

  // Handler for text inputs
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  // Handler for Select dropdowns
  const handleSelectChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }))
    setFieldErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleSignatureChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSignature({ file, preview: URL.createObjectURL(file) })
  }

  // Validates the form and sets field errors; returns true if valid
  const validate = () => {
    const requiredFields = ['fname', 'lname', 'email', 'dept', 'WHCode', 'Office_id', 'username']
    const errors = {}

    for (const field of requiredFields) {
      if (!formData[field]?.trim()) errors[field] = 'This field is required.'
    }
    if (formData.email && !EMAIL_REGEX.test(formData.email)) {
      errors.email = 'Please enter a valid email address.'
    }
    if (!signature.preview) {
      errors.e_signature = 'E-signature is required.'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Called when the user confirms submission from the dialog
  const handleConfirmedSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const payload = new FormData()
      Object.entries(formData).forEach(([k, v]) => { if (v !== '' && v != null) payload.append(k, v) })
      if (signature.file) payload.append('e_signature', signature.file)

      if (isEdit) {
        await api.put(`/api/users/${employeeData.user_id}/`, payload)
      } else {
        await api.post('/api/users/', payload)
      }

      // Navigate after toast so user always sees the message
      addToast(isEdit ? 'Employee successfully updated.' : 'New employee successfully added.')
      cancelTimerRef.current = setTimeout(() => onCancel(), TOAST_DURATION)

    } catch (error) {
      const serverData = error.response?.data
      if (serverData) {
        const serverErrors = {}
        Object.entries(serverData).forEach(([key, val]) => {
          serverErrors[key] = Array.isArray(val) ? val[0] : val
        })
        setFieldErrors(serverErrors)
      } else {
        setFieldErrors({ general: 'Something went wrong. Please try again.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pre-validates before opening the confirm dialog, blocks dialog if form is invalid
  const handleSubmitClick = (e) => {
    e.preventDefault()
    validate()
  }

  return (
    <>
      <Header
        pageTitle="Supervisor"
        notifTo={notifRoute}
        userName={userName}
        unreadCount={unreadCount}
      />

      <div className="px-6 py-4">
        <form onSubmit={handleSubmitClick}>
          <div className="text-[#2D317F] pb-4 overflow-auto">
            <h2 className="m-0 font-semibold text-[25px]">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>

            <div className="bg-[#F5F9F9] shadow border border-black/5 rounded-lg p-6 px-8 pt-4 mt-1 !min-h-[565px] text-black">

              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-bold text-lg text-[#2D317F]">
                  {isEdit
                    ? `${employeeData?.fname} ${employeeData?.mI} ${employeeData?.lname}`
                    : 'New Employee'}
                </p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  (isEdit ? employeeData?.status : 'Active') === 'Active'
                    ? 'bg-green-100 text-[#1D8104]'
                    : 'bg-red-100 text-[#BB2325]'
                }`}>
                  <CiUser className="h-4 w-4" />
                  {isEdit ? employeeData?.status : 'Active'}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4 text-sm text-[#2D317F]">
                <p>Fill in the details below for the supervisor account.</p>
                <span>Office ID: {isEdit ? employeeData?.Office_id : '-----'}</span>
              </div>

              {/* Personal Information */}
              <div className="mb-3">
                <p className="text-xs text-[#2D317F] font-semibold tracking-widest mb-2">PERSONAL INFORMATION</p>
                <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
                  <div className="flex flex-row gap-4 mb-3">
                    <Field className="flex gap-1.5 flex-col w-[250px]">
                      <FieldLabel className="text-[#2D317F] text-sm font-medium">First Name <span className="text-red-500">*</span></FieldLabel>
                      <Input
                        name="fname" value={formData.fname} onChange={handleChange} placeholder="e.g. Febrose"
                        className={`text-[#2D317F] rounded text-sm bg-white !font-normal ${fieldErrors.fname ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <FieldError errors={fieldErrors} name="fname" />
                    </Field>
                    <Field className="flex gap-1.5 flex-col w-[250px]">
                      <FieldLabel className="text-[#2D317F] text-sm font-medium">Middle Initial</FieldLabel>
                      <Input name="mI" value={formData.mI} onChange={handleChange} placeholder="e.g. C"
                        className="text-[#2D317F] rounded border-gray-300 text-sm bg-white !font-normal" />
                    </Field>
                    <Field className="flex gap-1.5 flex-col w-[250px]">
                      <FieldLabel className="text-[#2D317F] text-sm font-medium">Last Name <span className="text-red-500">*</span></FieldLabel>
                      <Input
                        name="lname" value={formData.lname} onChange={handleChange} placeholder="e.g. Valenzuela"
                        className={`text-[#2D317F] rounded text-sm bg-white !font-normal ${fieldErrors.lname ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <FieldError errors={fieldErrors} name="lname" />
                    </Field>
                  </div>
                  <Field className="flex gap-1.5 flex-col w-[320px]">
                    <FieldLabel className="text-[#2D317F] text-sm font-medium">Email <span className="text-red-500">*</span></FieldLabel>
                    <Input
                      name="email" value={formData.email} onChange={handleChange} type="email" placeholder="e.g. febvalenzuela@nfa.gov.ph"
                      className={`text-[#2D317F] rounded text-sm bg-white !font-normal ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <FieldError errors={fieldErrors} name="email" />
                  </Field>
                </div>
              </div>

              {/* Department & Assignment */}
              <div className="mb-3 text-[#2D317F]">
                <p className="text-xs font-semibold tracking-widest mb-2">DEPARTMENT & ASSIGNMENT</p>
                <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
                  <div className="flex flex-row gap-4 flex-wrap">
                    <Field className="flex gap-1.5 flex-col flex-1 min-w-[150px]">
                      <FieldLabel className="text-sm font-medium">Department <span className="text-red-500">*</span></FieldLabel>
                      <Select value={formData.dept} onValueChange={(v) => handleSelectChange('dept', v)}>
                        <SelectTrigger className={`!font-normal bg-white rounded ${fieldErrors.dept ? 'border-red-500' : 'border-gray-300'}`}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem className="text-[#2D317F] p-2" value="Quality Assurance">Quality Assurance</SelectItem>
                          <SelectItem className="text-[#2D317F] p-2" value="Buffer Stock Management">Buffer Stock Management</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError errors={fieldErrors} name="dept" />
                    </Field>
                    <Field className="flex gap-1.5 flex-col flex-1 min-w-[150px]">
                      <FieldLabel className="text-sm font-medium">Warehouse Code <span className="text-red-500">*</span></FieldLabel>
                      <Select value={formData.WHCode} onValueChange={(v) => handleSelectChange('WHCode', v)}>
                        <SelectTrigger className={`!font-normal bg-white rounded ${fieldErrors.WHCode ? 'border-red-500' : 'border-gray-300'}`}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem className="p-2" value="010501A">010501A</SelectItem>
                          <SelectItem className="p-2" value="010502A">010502A</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError errors={fieldErrors} name="WHCode" />
                    </Field>
                    <Field className="flex gap-1.5 flex-col flex-1 min-w-[120px]">
                      <FieldLabel className="text-sm font-medium">Office ID <span className="text-red-500">*</span></FieldLabel>
                      <Input
                        name="Office_id" value={formData.Office_id} onChange={handleChange} placeholder="e.g. 645328"
                        className={`rounded text-sm bg-white !font-normal ${fieldErrors.Office_id ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <FieldError errors={fieldErrors} name="Office_id" />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Login Credentials + E-Signature */}
              <div className="mb-3 flex gap-3">

                {/* Login Credentials */}
                <div className="flex-1">
                  <p className="text-xs text-[#2D317F] font-semibold tracking-widest mb-2">LOGIN CREDENTIALS</p>
                  <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm h-[calc(100%-24px)]">
                    <Field className="flex gap-1.5 flex-col w-[250px]">
                      <FieldLabel className="text-[#2D317F] text-sm font-medium">Username <span className="text-red-500">*</span></FieldLabel>
                      <Input
                        name="username" value={formData.username} onChange={handleChange} placeholder="e.g. FebValenzuela"
                        className={`rounded text-sm bg-white !font-normal ${fieldErrors.username ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <FieldError errors={fieldErrors} name="username" />
                    </Field>
                  </div>
                </div>

                {/* E-Signature */}
                <div className="flex-1">
                  <p className="text-xs text-[#2D317F] font-semibold tracking-widest mb-2">E-SIGNATURE</p>
                  <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm h-[calc(100%-24px)]">
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center justify-center w-36 h-14 bg-[#F5F9F9] rounded border border-dashed border-gray-300 shrink-0">
                        {signature.preview ? (
                          <img src={signature.preview} alt="signature preview" className="max-h-14 object-contain" />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-gray-400">
                            <ImageUp className="w-5 h-5" />
                            <span className="text-[10px]">No signature</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-gray-500">PNG or JPG recommended.</p>
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-[#2D317F] text-white text-xs rounded-lg w-fit hover:opacity-80 transition-opacity">
                          <ImageUp className="w-3.5 h-3.5" />
                          {signature.preview ? 'Change' : 'Upload'}
                          <input type="file" accept="image/*" onChange={handleSignatureChange} className="hidden" />
                        </label>
                        <FieldError errors={fieldErrors} name="e_signature" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* General server error */}
              {fieldErrors.general && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⊙</span> {fieldErrors.general}
                </p>
              )}

              {/* Buttons */}
              <div className="mt-4 flex justify-end gap-4">

                {/* Cancel with confirmation */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="px-4 py-5 bg-[#D9D9D9] text-[#5B5B5B]" type="button" disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 max-w-[90vw] !max-w-[320px] overflow-hidden rounded-[10px] border-none">
                    <div className="h-5 bg-[#BB2325] rounded-t-lg" />
                    <AlertDialogHeader className="p-5 text-center items-center pb-4">
                      <div className="rounded-full px-4 py-4 my-2 bg-[#BB2325]">
                        <FaExclamation color="white" size={33} />
                      </div>
                      <AlertDialogTitle className="!font-bold text-[#BB2325] text-[23px] mx-2 -mb-2">
                        {isEdit ? 'Cancel Editing?' : 'Cancel Adding?'}
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-[12px] px-2 mt-3 -mb-2">
                        {isEdit
                          ? "Your data won't be saved! Are you sure you want to quit editing?"
                          : "Your data won't be saved! Are you sure you want to quit adding new employee?"}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0 -mt-2">
                      <AlertDialogCancel className="w-23 px-4 py-4">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="w-23 !bg-[#BB2325] text-white hover:bg-[#770e10] px-4 py-4 mb-1"
                        onClick={onCancel}
                      >
                        Yes
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Submit with confirmation */}
                <ConfirmSubmitDialog
                  isEdit={isEdit}
                  onConfirm={handleConfirmedSubmit}
                  isSubmitting={isSubmitting}
                />

              </div>

            </div>
          </div>
        </form>
      </div>

      <Toast toasts={toasts} />
    </>
  )
}