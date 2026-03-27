// react
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// shadcn components
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { User, Lock, Eye, EyeOff } from "lucide-react"

// assets
import NFALogo from '../assets/NFA-logo.png'

export default function Login() {
  // useState
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate();

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

  console.log("Username: ", username)
  console.log("Password: ", password)

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "" || password === "") {
      alert("Incomplete Credentials")
      return
    }

    // change this later on if the database is connected already
    if (username === "admin" && password === "admin123") {
      alert("Logging in as admin...") 
      navigate("/admin/dashboard")
    } else if (username === "whse" && password === "whse123") {
      alert("Logging in as warehouse supervisor...")
      navigate("/whse/management")
    } else {
      alert("Wrong Credentials")
    }
  }

  return (
    <div className='w-screen h-screen flex items-center justify-center'>
      <Card className="w-full max-w-110 p-5 bg-[#E2EBFF]">
        <CardHeader className="items-center justify-center">
          <img src={NFALogo} alt="NF Logo" className='w-35 h-35 mx-auto' />
          <CardTitle className='font-black text-[#2D317F] text-2xl text-center'>Integrated Report</CardTitle>
          <CardTitle className='font-black text-[#2D317F] text-2xl text-center'>Monitoring System</CardTitle>
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
        <CardFooter className='justify-center py-0 pb-4'>
          <Button className='w-full bg-[#2D317F] drop-shadow-md py-4.5 mb-5 cursor-pointer font-bold' onClick={handleLogin}>Login</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
