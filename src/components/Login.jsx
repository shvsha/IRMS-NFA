import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import '../styles/Login.css'

// assets
import NFALogo from '../assets/NFA-logo.png'

export default function Login() {
  // US
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

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

    if (username === "admin" && password === "admin123") {
      alert("Logging in as admin...")
      navigate("/admin/dashboard")
    } else if (username === "whse" && password === "whse123") {
      alert("Logging in as warehouse supervisor...")
      navigate("/whse/dashboard")
    } else {
      alert("Wrong Credentials")
    }
  }

  return (
    <div className='whole-login-body'>
      <form className="login-container" onSubmit={handleLogin}>
        <img className='nfa-logo-login' src={NFALogo} alt="" />
        <p className='system-title-login'>Integrated Report <br/> Monitoring System</p>

          <div className="input-container">
            <label className='label-login' name="username">Username</label>
            <input className='input-login' type="text" name="username" onChange={handleCredentials} />
          </div>
          <div className="input-container">
            <label className='label-login' name="password">Password</label>
            <input className='input-login' type="password" name="password" onChange={handleCredentials}/>
          </div>
        <button className='login-btn' type="submit">Login</button>

      </form>
    </div>
  )
}
