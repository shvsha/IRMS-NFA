// react
import { useState } from 'react'
import api from '../../api/axios'
import Header from '../../components/Header'

// shadcn
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

// icons
import { FaExclamation, FaCheck } from "react-icons/fa"
import { CiUser } from "react-icons/ci"
import { ImageUp } from "lucide-react"

import { useUnreadCount } from '@/hooks/useUnreadCount'
import { getNotifRoute } from '@/utils/getNotifRoute'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const SIGNATORY_ROLES = ['Asst. Branch Manager', 'Accountant 3', 'Branch Manager']

export default function SignatoryForm({ mode = 'add', role = null, signatoryData = null, onCancel }) {
  // for notif
  const user       = useCurrentUser()
  const notifRoute = getNotifRoute(user)
  const userName   = user ? `${user.fname} ${user.lname}` : 'User'
  const unreadCount = useUnreadCount()

  const isEdit = mode === 'edit'

  const [toasts, setToasts] = useState([])
  // inline field errors
  const [fieldErrors, setFieldErrors] = useState({})

  const addToast = (message, color = '#1D8104') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, color }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }

  const [formData, setFormData] = useState({
    fname: isEdit ? signatoryData?.fname: '',
    mI: isEdit ? signatoryData?.mI: '',
    lname: isEdit ? signatoryData?.lname: '',
    email: isEdit ? signatoryData?.email: '',
    user_level: 'Signatory',
    signatory_role: isEdit ? signatoryData?.signatory_role : (role ?? ''),
    dept: isEdit ? signatoryData?.dept: '',
    position: isEdit ? signatoryData?.position: (role ?? ''),
    Office_id: isEdit ? signatoryData?.Office_id: '',
    username: isEdit ? signatoryData?.username: '',
  })

  const [signatureFile, setSignatureFile]     = useState(null)
  const [signaturePreview, setSignaturePreview] = useState(
    isEdit && signatoryData?.e_signature_url
      ? signatoryData.e_signature_url
      : null
  )

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleSignatureChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSignatureFile(file)
    setSignaturePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const required = ['fname', 'lname', 'dept', 'Office_id', 'email', 'signatory_role', 'username']
    const errors = {}
    for (const field of required) {
      if (!formData[field]?.trim()) {
        errors[field] = 'This field is required.'
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    try {
      const payload = new FormData()
      Object.entries(formData).forEach(([k, v]) => { if (v) payload.append(k, v) })
      if (signatureFile) payload.append('e_signature', signatureFile)

      if (isEdit) {
        await api.put(`/api/users/signatories/${signatoryData.user_id}/`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      } else {
        await api.post('/api/users/signatories/', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      addToast(isEdit ? 'Signatory successfully updated.' : 'New signatory successfully added.')
      setTimeout(() => onCancel(), 3000)

    } catch (err) {
      const errors = err.response?.data
      if (errors) {
        // Map server errors to field-level errors
        const serverErrors = {}
        Object.entries(errors).forEach(([key, val]) => {
          serverErrors[key] = Array.isArray(val) ? val[0] : val
        })
        setFieldErrors(serverErrors)
      } else {
        setFieldErrors({ general: 'Something went wrong. Please try again.' })
      }
    }
  }

  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <p className="text-red-500 text-xs flex items-center gap-1">
        <span>⊙</span> {fieldErrors[name]}
      </p>
    ) : null

  return (
    <>
      <Header 
        pageTitle="Signatory" 
        notifTo={notifRoute}
        userName={userName}
        unreadCount={unreadCount}
      />

      <div className="px-6 py-4">
        <form onSubmit={handleSubmit}>
          <div className="text-[#2D317F] pb-4 overflow-auto">
            <h2 className="font-semibold text-[25px]">{isEdit ? 'Edit Signatory' : 'Add Signatory'}</h2>

            <div className="bg-[#F5F9F9] shadow border border-black/5 rounded-lg p-6 px-8 pt-4 mt-1 !min-h-[565px]">

              {/* Form header */}
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-bold text-lg text-[#2D317F]">
                  {isEdit ? `${signatoryData?.fname} ${signatoryData?.lname}` : `New ${role ?? 'Signatory'}`}
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-[#1D8104]">
                  <CiUser className="h-4 w-4" />
                  {isEdit ? signatoryData?.status : 'Active'}
                </span>
              </div>
              <div className="flex items-center justify-between mb-4 text-sm text-[#2D317F]">
                <p>Fill in the details below for the signatory account.</p>
                <span>Office ID: {isEdit ? signatoryData?.Office_id : '-----'}</span>
              </div>

              {/* Personal Information */}
              <div className="mb-3">
                <p className="text-xs font-semibold tracking-widest mb-2">PERSONAL INFORMATION</p>
                <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
                  <div className="flex gap-4 mb-3">
                    <Field className="flex gap-1.5 flex-col w-[250px]">
                      <FieldLabel className="text-sm font-medium">First Name <span className="text-red-500">*</span></FieldLabel>
                      <Input
                        name="fname" value={formData.fname} onChange={handleChange} placeholder="e.g. Maria"
                        className={`rounded text-sm bg-white ${fieldErrors.fname ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <FieldError name="fname" />
                    </Field>
                    <Field className="flex gap-1.5 flex-col w-[250px]">
                      <FieldLabel className="text-sm font-medium">Middle Initial</FieldLabel>
                      <Input name="mI" value={formData.mI} onChange={handleChange} placeholder="e.g. C" className="rounded border-gray-300 text-sm bg-white" />
                    </Field>
                    <Field className="flex gap-1.5 flex-col w-[250px]">
                      <FieldLabel className="text-sm font-medium">Last Name <span className="text-red-500">*</span></FieldLabel>
                      <Input
                        name="lname" value={formData.lname} onChange={handleChange} placeholder="e.g. Santos"
                        className={`rounded text-sm bg-white ${fieldErrors.lname ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <FieldError name="lname" />
                    </Field>
                  </div>
                  <Field className="flex gap-1.5 flex-col w-[320px]">
                    <FieldLabel className="text-sm font-medium">Email <span className="text-red-500">*</span></FieldLabel>
                    <Input
                      name="email" value={formData.email} onChange={handleChange} type="email" placeholder="e.g. msantos@nfa.gov.ph"
                      className={`rounded text-sm bg-white ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <FieldError name="email" />
                  </Field>
                </div>
              </div>

              {/* Department & Assignment */}
              <div className="mb-3">
                <p className="text-xs font-semibold tracking-widest mb-2">DEPARTMENT & ASSIGNMENT</p>
                <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
                  <div className="flex gap-4 flex-wrap">
                    <Field className="flex gap-1.5 flex-col w-[200px]">
                      <FieldLabel className="text-sm font-medium">Department</FieldLabel>
                      <Input name="dept" value={formData.dept} onChange={handleChange} placeholder="e.g. Accounting" className={`rounded text-sm bg-white ${fieldErrors.dept ? 'border-red-500' : 'border-gray-300'}`} />
                    </Field>
                    <Field className="flex gap-1.5 flex-col w-[200px]">
                      <FieldLabel className="text-sm font-medium">Office ID</FieldLabel>
                      <Input name="Office_id" value={formData.Office_id} onChange={handleChange} placeholder="e.g. 645328" className={`rounded text-sm bg-white ${fieldErrors.Office_id ? 'border-red-500' : 'border-gray-300'} `} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Login Credentials + E-Signature side by side */}
              <div className="mb-3 flex gap-3">

                {/* Login Credentials */}
                <div className="flex-1">
                  <p className="text-xs font-semibold tracking-widest mb-2">LOGIN CREDENTIALS</p>
                  <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm h-[calc(100%-24px)]">
                    <Field className="flex gap-1.5 flex-col w-[250px]">
                      <FieldLabel className="text-sm font-medium">Username <span className="text-red-500">*</span></FieldLabel>
                      <Input
                        name="username" value={formData.username} onChange={handleChange} placeholder="e.g. MSantos"
                        className={`rounded text-sm bg-white ${fieldErrors.username ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      <FieldError name="username" />
                    </Field>
                  </div>
                </div>

                {/* E-Signature */}
                <div className="flex-1">
                  <p className="text-xs font-semibold tracking-widest mb-2">E-SIGNATURE</p>
                  <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm h-[calc(100%-24px)]">
                    <div className="flex gap-4 items-center">
                      {/* Preview */}
                      <div className="flex items-center justify-center w-36 h-14 bg-[#F5F9F9] rounded border border-dashed border-gray-300 shrink-0">
                        {signaturePreview ? (
                          <img src={signaturePreview} alt="signature preview" className="max-h-14 object-contain" />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-gray-400">
                            <ImageUp className="w-5 h-5" />
                            <span className="text-[10px]">No signature</span>
                          </div>
                        )}
                      </div>
                      {/* Upload */}
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-gray-500">PNG or JPG recommended.</p>
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-[#2D317F] text-white text-xs rounded-lg w-fit hover:opacity-80 transition-opacity">
                          <ImageUp className="w-3.5 h-3.5" />
                          {signaturePreview ? 'Change' : 'Upload'}
                          <input type="file" accept="image/*" onChange={handleSignatureChange} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* general server error */}
              {fieldErrors.general && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <span>⊙</span> {fieldErrors.general}
                </p>
              )}

              {/* Buttons */}
              <div className="mt-4 flex justify-end gap-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="px-4 py-5 bg-[#D9D9D9] text-[#5B5B5B]" type="button">Cancel</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="pt-0 px-0 bg-[#E6EEF6] pb-0 gap-0 max-w-[600px] overflow-hidden rounded-[10px] border-none">
                    <div className="h-7 bg-[#BB2325] rounded-t-lg" />
                    <AlertDialogHeader className="p-5 text-center items-center pb-4">
                      <div className="rounded-full px-5 py-5 my-2 bg-[#BB2325]"><FaExclamation color="white" size={60} /></div>
                      <AlertDialogTitle className="!font-bold text-[#BB2325] text-2xl mt-2">
                        {isEdit ? 'Cancel Editing?' : 'Cancel Adding?'}
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm px-2 mt-3 -mb-2">
                        Your data won't be saved. Are you sure you want to go back?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mx-0 mb-0 bg-transparent flex flex-row !justify-center gap-3 border-0">
                      <AlertDialogCancel className="w-23 px-5 py-4.5">Cancel</AlertDialogCancel>
                      <AlertDialogAction className="w-23 !bg-[#BB2325] text-white hover:bg-[#770e10] px-5 py-4.5 mb-3" onClick={onCancel}>Yes</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button className="px-4 py-5 bg-[#2D317F] text-white" type="submit">
                  {isEdit ? 'Save Changes' : 'Add Signatory'}
                </Button>
              </div>

            </div>
          </div>
        </form>
      </div>

      {/* Toasts */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div key={toast.id} className="flex items-center gap-3 bg-white rounded-lg shadow-2xl px-5 py-4 min-w-[300px]"
            style={{ borderLeft: `4px solid ${toast.color}` }}>
            <div className="rounded-full p-1.5 flex-shrink-0" style={{ backgroundColor: toast.color }}>
              <FaCheck size={16} color="white" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: toast.color }}>
                {toast.color === '#BB2325' ? 'Error!' : 'Success!'}
              </p>
              <p className="text-gray-500 text-xs">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}