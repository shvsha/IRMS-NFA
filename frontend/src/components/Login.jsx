// react
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

// shadcn components
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Dialog, DialogContent, DialogHeader, DialogDescription } from "@/components/ui/dialog"

// icons
import { User, Lock, Eye, EyeOff, LockKeyhole, KeyRound, BadgeCheck } from "lucide-react"
import { MdOutlineMarkEmailUnread } from "react-icons/md"

// assets
import NFALogo from '../assets/NFA-logo.png'

const RESEND_COOLDOWNS = [0, 60, 180, 3600]
const RESEND_LIMIT = RESEND_COOLDOWNS.length

export default function Login() {
  const navigate = useNavigate()

  // login
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoadingLogin, setIsLoadingLogin] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [fieldError, setFieldError] = useState('')

  // modal states
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [checkEmailOpen, setCheckEmailOpen] = useState(false)
  const [newPasswordOpen, setNewPasswordOpen] = useState(false)
  const [successChangePasswordOpen, setSuccessChangePasswordOpen] = useState(false)

  // forgot password
  const [resetEmail, setResetEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isLoadingEmail, setIsLoadingEmail] = useState(false)

  // otp
  const [otp, setOtp] = useState(Array(6).fill(''))
  const [codeError, setCodeError] = useState('')
  const [isLoadingCode, setIsLoadingCode] = useState(false)
  const inputRefs = useRef([])

  // resend otp
  const [resendCount, setResendCount] = useState(0)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [cooldownInterval, setCooldownInterval] = useState(null)

  // new password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationError, setValidationError] = useState(false)
  const [isLoadingReset, setIsLoadingReset] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [isLoadingResend, setIsLoadingResend] = useState(false)

  const handleCredentials = (e) => {
    const { name, value } = e.target
    if (name === "username") setUsername(value)
    if (name === "password") setPassword(value)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setFieldError('')

    if (username === "" || password === "") {
      setFieldError('Please fill in all fields.')
      return
    }

    setIsLoadingLogin(true)
    try {
      const response = await api.post('/api/auth/login/', { username, password })
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      const userLevel = response.data.user.user_level
      if (userLevel === "Admin") {
        navigate("/admin/dashboard")
      } else if (userLevel === "Warehouse Supervisor") {
        navigate("/whse/management")
      } else if (userLevel === "Signatory") {
        navigate("/signa/evaluation")
      } else {
        setLoginError('Unknown user level.')
      }
      
      await api.post('/audit/log-login/')
    } catch (err) {
      const error = err.response?.data
      if (error) {
        const msg = Object.values(error)[0]
        setLoginError(Array.isArray(msg) ? msg[0] : msg)
      } else {
        setLoginError('Login faild. Please try again.')
      }
    } finally {
      setIsLoadingLogin(false)
    }
  }

  // submit email
  const handleCheckEmailOpen = async () => {
    setEmailError('')
    setIsLoadingEmail(true)
    try {
      await api.post('/api/auth/forgot-password/', { email: resetEmail })
      setChangePasswordOpen(false)
      setCheckEmailOpen(true)
      setOtp(Array(6).fill(''))
      setCodeError('')
      setResendCount(0)
      setCooldownSeconds(0)
      if (cooldownInterval) clearInterval(cooldownInterval)
    } catch (err) {
      const msg = err.response?.data?.email || 'Something went wrong.'
      setEmailError(msg)
    } finally {
      setIsLoadingEmail(false)
    }
  }

  // otp handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setCodeError('')
    if (value && index < 5) inputRefs.current[index + 1].focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(paste)) return
    const newOtp = paste.split('')
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')])
    inputRefs.current[Math.min(paste.length, 5)].focus()
  }

  const startCooldown = (seconds) => {
    setCooldownSeconds(seconds)
    const interval = setInterval(() => {
      setCooldownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setCooldownInterval(interval)
  }

  const handleCloseOtpDialog = () => {
    if (cooldownInterval) clearInterval(cooldownInterval)
    setCooldownSeconds(0)
    setCheckEmailOpen(false)
  }

  // verify otp
  const handleNewPasswordOpen = async () => {
    setCodeError('')
    setIsLoadingCode(true)
    const code = otp.join('')
    try {
      await api.post('/api/auth/verify-code/', { email: resetEmail, code })
      setCheckEmailOpen(false)
      setNewPasswordOpen(true)
      setValidationError(false)
    } catch (err) {
      const msg = err.response?.data?.code || 'That code is incorrect. Please try again.'
      setCodeError(msg)
    } finally {
      setIsLoadingCode(false)
    }
  }

  // reset password
  const handleSuccessChangePasswordOpen = async () => {
    const allValid =
      newPassword.length >= 8 &&
      /[^a-zA-Z0-9]/.test(newPassword) &&
      newPassword === confirmPassword && confirmPassword !== ''

    if (!allValid) {
      setValidationError(true)
      return
    }

    setIsLoadingReset(true)
    try {
      const code = otp.join('')
      await api.post('/api/auth/reset-password/', {
        email: resetEmail,
        code,
        password: newPassword,
      })
      setValidationError(false)
      setNewPasswordOpen(false)
      setSuccessChangePasswordOpen(true)
      setNewPassword('')
      setConfirmPassword('')
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      setOtp(Array(6).fill(''))
      setResetEmail('')
    } catch (err) {
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoadingReset(false)
    }
  }

  // resend code
  const handleResendCode = async () => {
    if (cooldownSeconds > 0 || resendCount >= RESEND_LIMIT) return

    setIsLoadingResend(true)
    try {
      await api.post('/api/auth/forgot-password/', { email: resetEmail })
      setOtp(Array(6).fill(''))
      setCodeError('')
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 3000)
      inputRefs.current[0]?.focus()

      const nextCount = resendCount + 1
      setResendCount(nextCount)  

      if (RESEND_COOLDOWNS[nextCount] > 0) {
        startCooldown(RESEND_COOLDOWNS[nextCount])
      }
    } catch (err) {
      alert('Failed to resend code. Please try again.')
    } finally {
      setIsLoadingResend(false)
    }
  }

  const formatCooldown = (secs) => {
    if (secs >= 3600) {
      const h = Math.floor(secs / 3600)
      const m = Math.floor((secs % 3600) / 60)
      const s = secs % 60
      return `${h}h ${m}m ${s}s`
    }
    if (secs >= 60) {
      const m = Math.floor(secs / 60)
      const s = secs % 60
      return `${m}m ${s}s`
    }
    return `${secs}s`
  }

  return (
    <div className='w-screen h-screen flex items-center justify-center bg-[#ADCEFF]'>
      <Card className="w-full max-w-110 p-5 py-18 bg-[#FFFAFA] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)]">
        <CardHeader className="items-center justify-center">
          <img src={NFALogo} alt="NF Logo" className='w-35 h-35 mx-auto mb-8 -mt-3' />
          <CardTitle className='font-black text-[#2D317F] text-2xl text-center'>National Food Authority</CardTitle>
          <CardTitle className='text-[#2D317F] text-lg text-center'>Integrated Report Monitoring System</CardTitle>
        </CardHeader>
        <CardContent className='text-center'>
          <FieldGroup>
            <Field className='gap-0.5'>
              <FieldLabel className='text-[#2D317F]' htmlFor='username'>Username</FieldLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2D317F]" />
                <Input
                  name="username"
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => { handleCredentials(e); setFieldError(''); setLoginError('') }}
                  className={`border focus:ring-0 bg-white pl-10 ${
                    fieldError || loginError ? 'border-red-500' : 'border-[#2D317F] focus:border-[#2D317F]'
                  }`}
                />
              </div>
            </Field>

            <Field className='gap-0.5 -mt-2'>
              <FieldLabel className='text-[#2D317F]' htmlFor='password'>Password</FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2D317F]" />
                <Input
                  name="password"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  autoComplete="off"
                  onChange={e => { handleCredentials(e); setFieldError(''); setLoginError('') }}
                  className={`border focus:ring-0 bg-white pl-10 pr-10 ${
                    fieldError || loginError ? 'border-red-500' : 'border-[#2D317F] focus:border-[#2D317F]'
                  }`}
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
            
            {/* inline error mssges */}
            {fieldError && (
              <p className="text-red-500 text-xs -mt-3 flex items-center gap-1">
                <span>⊙</span> {fieldError}
              </p>
            )}
            {loginError && (
              <p className="text-red-500 text-xs -mt-3 flex items-center gap-1">
                <span>⊙</span> {loginError}
              </p>
            )}
          </FieldGroup>
        </CardContent>
        <CardFooter className='justify-center py-0 pb-4 flex-col'>
          <Button
            className='w-full bg-[#2D317F] shadow-[0_8px_6px_-4px_rgba(0,0,0,0.3)] py-4.5 mb-5 cursor-pointer font-bold'
            onClick={handleLogin}
            disabled={isLoadingLogin}
          >
            {isLoadingLogin ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logging in...
              </div>
            ) : 'Login'}
          </Button>
          <a onClick={() => { setChangePasswordOpen(true); setEmailError(''); setResetEmail('') }} className='text-[#2D317F] underline mb-2 cursor-pointer'>Forgot Password?</a>
        </CardFooter>
      </Card>

      {/* forgot password / email */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className='bg-[#F8F8F8] [&>button]:hidden py-7 px-0 !max-w-[400px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)]'>
          <div className='bg-[#E1EBFF] py-5 rounded-2xl flex justify-center mx-38 mb-3'>
            <LockKeyhole className="w-12 h-12" color={'#2D317F'} />
          </div>
          <DialogHeader>
            <div className='text-center'>
              <p className='text-[#2D317F] font-bold text-xl'>Forgot your password?</p>
              <p className='text-xs mx-10 mt-2.5'>Enter your email address and a code will be sent to help reset your password.</p>
            </div>
            <DialogDescription className='flex flex-col gap-5'>
              <Field className='px-10'>
                <FieldLabel className='text-[#2D317F] -mb-1 mt-7' htmlFor="input-field-email">Email</FieldLabel>
                <Input
                  className={`rounded-md text-xs bg-black/6 !font-normal text-[#2D317F] py-4.5 ${emailError ? 'border-red-500' : 'border-[#ccc]'}`}
                  id="input-field-email"
                  type="email"
                  placeholder="e.g. abcd*****@email.com"
                  value={resetEmail}
                  onChange={e => { setResetEmail(e.target.value); setEmailError('') }}
                />
                {emailError && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span>⊙</span> {emailError}
                  </p>
                )}
              </Field>
              <Button
                className='!rounded-md mx-10 bg-[#2D317F] shadow-[0_8px_6px_-4px_rgba(0,0,0,0.3)] py-4.5 mb-5 cursor-pointer font-bold'
                onClick={handleCheckEmailOpen}
                disabled={isLoadingEmail}
              >
                {isLoadingEmail ? 'Sending...' : 'Reset Password'}
              </Button>

              <div className="flex items-center gap-3 px-10 -mt-5">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              <div className='flex justify-center'>
                <a onClick={() => setChangePasswordOpen(false)} className='text-[#2D317F] no-underline decoration-transparent cursor-pointer'>&lt; Back to Login</a>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* check email / otp */}
      <Dialog open={checkEmailOpen} onOpenChange={handleCloseOtpDialog}>
        <DialogContent className='bg-[#F8F8F8] [&>button]:hidden py-7 px-0 !max-w-[400px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)]'>
          <div className='bg-[#E1EBFF] py-5 rounded-2xl flex justify-center mx-39 '>
            <MdOutlineMarkEmailUnread className="w-12 h-12" color={'#2D317F'} />
          </div>
          <DialogHeader>
            <div className='text-center'>
              <p className='text-[#2D317F] font-bold text-xl'>Check your Email</p>
              <p className='text-xs mx-10 mt-2.5 mb-7'>Input the code that was sent to <span className='font-medium'>{resetEmail}</span>.</p>
            </div>
            <DialogDescription className='flex flex-col gap-5'>
              <div className='flex justify-center gap-3 px-10 -mt-2'>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-11 h-11 text-center text-lg font-bold rounded-lg border-2 outline-none focus:ring-2 focus:ring-[#2D317F] text-[#2D317F] ${
                      codeError ? 'bg-white border-red-500' : 'bg-gray-200 border-transparent'
                    }`}
                  />
                ))}
              </div>

              {codeError && (
                <p className="text-red-500 text-xs text-center -mt-3 flex items-center justify-center gap-1">
                  <span>⊙</span> {codeError}
                </p>
              )}

              <Button
                className='!rounded-md mx-10 my-1 bg-[#2D317F] shadow-[0_8px_6px_-4px_rgba(0,0,0,0.3)] py-4.5 cursor-pointer font-bold'
                onClick={handleNewPasswordOpen}
                disabled={isLoadingCode}
              >
                {isLoadingCode ? 'Verifying...' : 'Next'}
              </Button>

              <div className='text-center mb-2 -mt-1'>
                {resendCount >= RESEND_LIMIT ? (
                  <p className='text-red-500 text-xs font-medium text-center'>
                    Too many attempts. Please try again later.
                  </p>
                ) : cooldownSeconds > 0 ? (
                  <p className='text-gray-400 text-xs text-center'>
                    Resend available in <span className='text-[#2D317F] font-semibold'>{formatCooldown(cooldownSeconds)}</span>
                  </p>
                ) : resendSuccess ? (
                  <p className='text-[#1D8104] text-xs font-medium text-center'>
                    A new code has been sent to your email.
                  </p>
                ) : isLoadingResend ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-3 h-3 border-2 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
                    <p className='text-[#2D317F] text-xs'>Sending new code...</p>
                  </div>
                ) : (
                  <p className='text-black text-xs text-center'>
                    Didn't get any code?{' '}
                    <a onClick={handleResendCode} className='text-[#2D317F] cursor-pointer'>Click to resend</a>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 px-10 -mt-5">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              <div className='flex justify-center'>
                <a onClick={() => handleCloseOtpDialog()} className='text-[#2D317F] no-underline decoration-transparent cursor-pointer'>&lt; Back to Login</a>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* set new password */}
      <Dialog open={newPasswordOpen} onOpenChange={setNewPasswordOpen}>
        <DialogContent className='bg-[#F8F8F8] [&>button]:hidden pt-10 px-0 !max-w-[450px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)]'>
          {isLoadingReset ? (
            /* loading state */
            <div className="flex flex-col items-center justify-center py-10 px-10 gap-5 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)]">
              <div className='bg-[#E1EBFF] py-7 px-7 rounded-2xl flex justify-center mb-3'>
                <div className="w-13 h-13 border-4 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
              </div>
              <div className='text-center'>
                <p className='text-[#2D317F] font-bold text-xl'>Updating Password</p>
                <p className='text-xs mx-5 mt-4 text-gray-500'>Please wait while we securely update your password.</p>
              </div>
              <div className="flex gap-2 mt-6">
                <div className="w-2.5 h-2.5 bg-[#2D317F] rounded-full animate-bounce [animation-delay:0ms]" />
                <div className="w-2.5 h-2.5 bg-[#2D317F] rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-2.5 h-2.5 bg-[#2D317F] rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          ) : (
            /* normal content */
            <>
              <div className='bg-[#E1EBFF] py-5 rounded-2xl flex justify-center mx-44 -mt-2.5'>
                <KeyRound className="w-12 h-12" color={'#2D317F'} />
              </div>
              <DialogHeader>
                <div className='text-center'>
                  <p className='text-[#2D317F] font-bold text-xl'>Set a new password</p>
                  <p className='text-xs mx-10 mt-2.5 -mb-3'>Your new password must be different from previously used passwords.</p>
                </div>
                <DialogDescription className='flex flex-col gap-5'>
                  <Field className='px-10 -mb-3'>
                    <FieldLabel className='text-[#2D317F] -mb-1 mt-7' htmlFor="new-password">New Password</FieldLabel>
                    <div className="relative">
                      <Input className="rounded-md border-[#ccc] text-xs bg-black/6 !font-normal text-[#2D317F] py-4.5 pr-10" id="new-password" type={showNewPassword ? "text" : "password"} placeholder="*****" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D317F] cursor-pointer">
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>

                  <Field className='px-10'>
                    <FieldLabel className='text-[#2D317F] -mb-1' htmlFor="confirm-password">Confirm New Password</FieldLabel>
                    <div className="relative">
                      <Input className="rounded-md border-[#ccc] text-xs bg-black/6 !font-normal text-[#2D317F] py-4.5 pr-10" id="confirm-password" type={showConfirmPassword ? "text" : "password"} placeholder="*****" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D317F] cursor-pointer">
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className='flex flex-col gap-1 mt-2'>
                      {validationError && (
                        <p className='text-red-500 text-xs mb-1'>Please satisfy all requirements before proceeding.</p>
                      )}
                      {[
                        { label: 'Must be at least 8 characters', valid: newPassword.length >= 8 },
                        { label: 'Must contain one special character', valid: /[^a-zA-Z0-9]/.test(newPassword) },
                        { label: 'Passwords must match', valid: newPassword === confirmPassword && confirmPassword !== '' },
                      ].map(({ label, valid }) => (
                        <div key={label} className={`flex items-center gap-2 text-xs ${valid ? 'text-green-500' : validationError ? 'text-red-500' : 'text-gray-400'}`}>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${valid ? 'bg-green-500' : validationError ? 'bg-red-400' : 'bg-gray-300'}`}>
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          {label}
                        </div>
                      ))}
                    </div>
                  </Field>

                  <Button
                    className='!rounded-md mx-10 bg-[#2D317F] shadow-[0_8px_6px_-4px_rgba(0,0,0,0.3)] py-4.5 cursor-pointer font-bold'
                    onClick={handleSuccessChangePasswordOpen}
                  >
                    Reset Password
                  </Button>

                  <div className="flex items-center gap-3 px-10">
                    <div className="flex-1 h-px bg-gray-300" />
                    <span className="text-xs text-gray-400">or</span>
                    <div className="flex-1 h-px bg-gray-300" />
                  </div>

                  <div className='flex justify-center pb-3'>
                    <a onClick={() => setNewPasswordOpen(false)} className='text-[#2D317F] [text-decoration:none] cursor-pointer'>&lt; Back to Login</a>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* success */}
      <Dialog open={successChangePasswordOpen} onOpenChange={setSuccessChangePasswordOpen}>
        <DialogContent className='bg-[#F8F8F8] [&>button]:hidden py-10 pb-7 px-0 !max-w-[400px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.4)]'>
          <div className='bg-[#E1EBFF] py-5 rounded-2xl flex justify-center mx-39 mb-3'>
            <BadgeCheck className="w-12 h-12" color={'#2D317F'} />
          </div>
          <DialogHeader>
            <div className='text-center'>
              <p className='text-[#2D317F] font-bold text-xl'>Password Reset!</p>
              <p className='text-xs mx-10 mb-7 mt-3'>You've successfully created a new password, click below to login.</p>
            </div>
            <DialogDescription className='flex flex-col gap-5'>
              <Button className='!rounded-md mx-10 bg-[#2D317F] shadow-[0_8px_6px_-4px_rgba(0,0,0,0.3)] py-4.5 mb-5 cursor-pointer font-bold' onClick={() => setSuccessChangePasswordOpen(false)}>
                Login
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}