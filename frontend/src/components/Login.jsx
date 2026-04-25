// react
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

// shadcn components
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Dialog, DialogContent, DialogHeader, DialogDescription,  } from "@/components/ui/dialog"

// icons
import { User, Lock, Eye, EyeOff, LockKeyhole, KeyRound, BadgeCheck } from "lucide-react"
import { MdOutlineMarkEmailUnread } from "react-icons/md";

// assets
import NFALogo from '../assets/NFA-logo.png'

export default function Login() {
  const navigate = useNavigate();

  // useState
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [checkEmailOpen, setCheckEmailOpen] = useState(false);
  const [newPasswordOpen, setNewPasswordOpen] = useState(false);
  const [successChangePasswordOpen, setSuccessChangePasswordOpen] = useState(false);

  // for toggle / for set new password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validationError, setValidationError] = useState(false)

  // custom functions
  const handleCredentials = (e) => {
    const {name, value} = e.target;

    if (name === "username") {
      setUsername(value);
    }

    if (name === "password") {
      setPassword(value);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username === "" || password === "") {
      alert("Incomplete Credentials")
      return
    }

    try {
      const response = await api.post('/api/auth/login/', {
        username,
        password,
      });

      // save tokens and info of the user
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // navigate based on user level
      const userLevel = response.data.user.user_level;
      if (userLevel === "Admin") {
        alert("Logging in as admin...") 
        navigate("/admin/dashboard")
      } else if (userLevel === "Warehouse Supervisor") {
        alert("Logging in as warehouse supervisor...")
        navigate("/whse/management")
      } else {
        alert('Unknown user level.');
      }
    } catch (err) {
      const error = err.response?.data;
      if (error) {
        const msg = Object.values(error)[0];
        alert(Array.isArray(msg) ? msg[0] : msg);
      } else {
        alert('Login failed. Please try again.');
      }
    }
  }

  const handleChangePasswordOpen = () => {
    setChangePasswordOpen(true)
  }

  // email modal code
  const handleCheckEmailOpen = () => {
    setChangePasswordOpen(false)
    setCheckEmailOpen(true)
  }
  const [otp, setOtp] = useState(Array(6).fill(''))
  const inputRefs = useRef([])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
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

  // for setting new password
  const handleNewPasswordOpen = () => {
    setCheckEmailOpen(false)
    setNewPasswordOpen(true)
    setValidationError(false)
  }

  const handleSuccessChangePasswordOpen = () => {
    const allValid = 
      newPassword.length >= 8 &&
      /[^a-zA-Z0-9]/.test(newPassword) &&
      newPassword === confirmPassword && confirmPassword !== ''

    if (!allValid) {
      setValidationError(true)
      return
    }
    
    // modals
    setValidationError(false)
    setNewPasswordOpen(false)
    setSuccessChangePasswordOpen(true)

    // reset fields
    setNewPassword('')
    setConfirmPassword('')
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  return (
    <div className='w-screen h-screen flex items-center justify-center bg-[#ADCEFF]'>
      <Card className="w-full max-w-110 p-5 py-18 bg-[#FFFAFA]">
        <CardHeader className="items-center justify-center">
          <img src={NFALogo} alt="NF Logo" className='w-35 h-35 mx-auto mb-8 -mt-3' />
          <CardTitle className='font-black text-[#2D317F] text-2xl text-center'>National Food Authority</CardTitle>
          <CardTitle className='text-[#2D317F] text-lg text-center'>Integrated Report Monitoring System</CardTitle>
        </CardHeader>
        <CardContent className='text-center'>
          <FieldGroup>
          <Field className='gap-0.5'>
              <FieldLabel className='text-[#2D317F] ' htmlFor='username'>Username</FieldLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2D317F]" />
                <Input
                  name="username"
                  id="username"
                  type="text"
                  value={username}
                  onChange={handleCredentials}
                  className='border border-[#2D317F] focus:ring-0 focus:border-[#2D317F] bg-white pl-10'          
                />
              </div>
            </Field>
            <Field className='gap-0.5'>
              <FieldLabel className='text-[#2D317F] ' htmlFor='password'>Password</FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2D317F]" />
                <Input
                  name="password"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  autoComplete="off" 
                  onChange={handleCredentials}
                  className='border border-[#2D317F] focus:ring-0 focus:border-[#2D317F] bg-white pl-10 pr-10'          
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
          </FieldGroup>
        </CardContent>
        <CardFooter className='justify-center py-0 pb-4 flex-col'>
          <Button className='w-full bg-[#2D317F] shadow-[0_8px_6px_-4px_rgba(0,0,0,0.3)] py-4.5 mb-5 cursor-pointer font-bold' onClick={handleLogin}>Login</Button>
          <a onClick={handleChangePasswordOpen} className='text-[#2D317F] underline mb-2 cursor-pointer'>Forgot Password?</a>
        </CardFooter>
      </Card>

      {/* change passsword modals */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className='bg-[#F8F8F8] [&>button]:hidden py-8 pt-14 px-0 !max-w-[400px]'>
          <div className='bg-[#E1EBFF] py-5 rounded-2xl flex justify-center mx-38 mb-3'><LockKeyhole className="w-12 h-12" color={'#2D317F'} /></div>
          <DialogHeader>
            <div className='text-center'>
              <p className='text-[#2D317F] font-bold text-xl'>Forgot your password?</p>
              <p className='text-xs mx-10 mt-2.5'>Enter your email address and a code will be sent  to help reset  your password.</p>
            </div>
            <DialogDescription className='flex flex-col gap-5'>
              <Field className='px-10'>
                <FieldLabel className='text-[#2D317F] -mb-1 mt-7' htmlFor="input-field-username">Email</FieldLabel>
                <Input
                  className=" rounded-md border-[#ccc] text-xs bg-black/6 !font-normal text-[#2D317F] py-4.5"
                  id="input-field-email"
                  type="text"
                  placeholder="e.g. abcd*****@email.com"
                />
              </Field>
              <Button className='!rounded-md mx-10 bg-[#2D317F] shadow-[0_8px_6px_-4px_rgba(0,0,0,0.3)] py-4.5 mb-5 cursor-pointer font-bold' onClick={handleCheckEmailOpen}>Reset Password</Button>

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

      {/* open check email */}
      <Dialog open={checkEmailOpen} onOpenChange={setCheckEmailOpen}>
        <DialogContent className='bg-[#F8F8F8] [&>button]:hidden py-8 pt-14 px-0 !max-w-[400px]'>
          <div className='bg-[#E1EBFF] py-5 rounded-2xl flex justify-center mx-39 mb-3'><MdOutlineMarkEmailUnread className="w-12 h-12" color={'#2D317F'} /></div>
          <DialogHeader>
            <div className='text-center'>
              <p className='text-[#2D317F] font-bold text-xl'>Check your Email</p>
              <p className='text-xs mx-10 mt-2.5 mb-7'>Input the code that was sent to <span>abcd*****@email.com</span>.</p>
            </div>
            <DialogDescription className='flex flex-col gap-5'>
              <div className='flex justify-center gap-3 px-10'>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className='w-11 h-11 text-center text-lg font-bold rounded-lg bg-gray-200 border-none outline-none focus:ring-2 focus:ring-[#2D317F] text-[#2D317F]'
                  />
                ))}
              </div>
              <Button className='!rounded-md mx-10 my-1 bg-[#2D317F] shadow-[0_8px_6px_-4px_rgba(0,0,0,0.3)] py-4.5 cursor-pointer font-bold' onClick={handleNewPasswordOpen}>Next</Button>

              <div className='text-center mb-2 -mt-1'>
                <p className='text-black'>Didn’t get any code? <a className='text-[#2D317F] cursor-pointer'>Click to resend</a></p>
              </div>

              <div className="flex items-center gap-3 px-10 -mt-5">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              <div className='flex justify-center'>
                <a onClick={() => setCheckEmailOpen(false)} className='text-[#2D317F] no-underline decoration-transparent cursor-pointer'>&lt; Back to Login</a>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* set the new password */}
      <Dialog open={newPasswordOpen} onOpenChange={setNewPasswordOpen}>
        <DialogContent className='bg-[#F8F8F8] [&>button]:hidden pt-10 px-0 !max-w-[450px]'>
          <div className='bg-[#E1EBFF] py-5 rounded-2xl flex justify-center mx-44 mb-3'>
            <KeyRound className="w-12 h-12" color={'#2D317F'} />
          </div>
          <DialogHeader>  
            <div className='text-center'>
              <p className='text-[#2D317F] font-bold text-xl'>Set a new password</p>
              <p className='text-xs mx-10 mt-2.5'>Your new password must be different from previously used passwords.</p>
            </div>
            <DialogDescription className='flex flex-col gap-5'>

              {/* new password */}
              <Field className='px-10 -mb-3'>
                <FieldLabel className='text-[#2D317F] -mb-1 mt-7' htmlFor="new-password">New Password</FieldLabel>
                <div className="relative">
                  <Input
                    className="rounded-md border-[#ccc] text-xs bg-black/6 !font-normal text-[#2D317F] py-4.5 pr-10"
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="*****"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D317F] cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              {/* confirm password */}
              <Field className='px-10'>
                <FieldLabel className='text-[#2D317F] -mb-1' htmlFor="confirm-password">Confirm New Password</FieldLabel>
                <div className="relative">
                  <Input
                    className="rounded-md border-[#ccc] text-xs bg-black/6 !font-normal text-[#2D317F] py-4.5 pr-10"
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="*****"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2D317F] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* validation rules */}
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

              <Button className='!rounded-md mx-10 bg-[#2D317F] shadow-[0_8px_6px_-4px_rgba(0,0,0,0.3)] py-4.5 cursor-pointer font-bold' onClick={handleSuccessChangePasswordOpen}>
                Reset Password
              </Button>

              <div className="flex items-center gap-3 px-10 ">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              <div className='flex justify-center pb-3'>
                <a onClick={() => setNewPasswordOpen(false)} className='text-[#2D317F] [text-decoration:none] cursor-pointer'>&lt; Back to Login</a>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* success change password modal */}
      <Dialog open={successChangePasswordOpen} onOpenChange={setSuccessChangePasswordOpen}>
        <DialogContent className='bg-[#F8F8F8] [&>button]:hidden py-10 pb-7 px-0 !max-w-[400px]'>
          <div className='bg-[#E1EBFF] py-5 rounded-2xl flex justify-center mx-39 mb-3'><BadgeCheck  className="w-12 h-12" color={'#2D317F'} /></div>
          <DialogHeader>
            <div className='text-center'>
              <p className='text-[#2D317F] font-bold text-xl'>Password Reset!</p>
              <p className='text-xs mx-10 mb-7 mt-3'>You’ve  successfully created a new password, click below to login.</p>
            </div>
            <DialogDescription className='flex flex-col gap-5'>
              <Button className='!rounded-md mx-10 bg-[#2D317F] shadow-[0_8px_6px_-4px_rgba(0,0,0,0.3)] py-4.5 mb-5 cursor-pointer font-bold' onClick={() => setSuccessChangePasswordOpen(false)}>Login</Button>

            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
