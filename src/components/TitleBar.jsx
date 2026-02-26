import '../styles/TitleBar.css'
import NFALogo from '../assets/NFA-logo.png'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TitleBar() {
  // US
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  
  // custom functions
  const logoutHandler = () => {
    setShowModal(true)
    return
  }

  return (
    <>
      <div className='title-bar-container'>
        <div className='logo-title-container'>
          <img className='nfa-logo-titlebar' src={NFALogo} alt="" />
          <p className='title-titlebar'>Integrated Report Monitoring System</p>
        </div>
        <div className='logout-container'>
          <button onClick={logoutHandler} className='logout-btn-titlebar'>Logout</button>
        </div>
      </div>

      <div className={"logout-validation-modal-overlay" + (showModal ? " show" : "")}>
        <div className='logout-validation-modal'>
          <p>Are you sure you want to logout?</p>
          <div className='validation-btns-modal'>
            <button className='validation-btns' onClick={() => setShowModal(false)}>Cancel</button>
            <button className='validation-btns' onClick={() => navigate("/")}>Confirm</button>
          </div>
        </div>
      </div>
    </>
  )
}
