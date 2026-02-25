import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import '../styles/Login.css'

// assets
import NFALogo from '../assets/login/NFA-logo.png'

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

  console.log(username)
  console.log(password)

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "" || password === "") {
      alert("Incomplete Credentials")
      return
    }

    if (username === "admin" && password === "admin123") {
      alert("Loggin in...")
      navigate("/dashboard")
    } else {
      alert("Wrong Credentials")
    }

    console.log(username)
    console.log(password)
  }

  return (
    <form className="login-container" onSubmit={handleLogin}>
      <img src={NFALogo} alt="" />
      <p>Integrated Report <br/> Monitoring System</p>

        <div className="input-container">
          <label name="username">Username</label>
          <input type="text" name="username" onChange={handleCredentials} />
        </div>
        <div className="input-container">
          <label name="password">Password</label>
          <input type="password" name="password" onChange={handleCredentials}/>
        </div>
      <button type="submit">Login</button>

    </form>
  )
}
