// react
import { useState } from "react"
import { FaExclamation } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
// css
import '../../styles/admin/EmployeeForm.css'

//components
import FilterDropdown from "../filters/FilterDropdown"

import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function EmployeeForm({ mode = 'add', employeeData = null, onCancel }) {
  const isEdit = mode === 'edit';

  // modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSuccessModal, setShowSuccesModal] = useState(false);

  // us
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  // fields
  const [formData, setFormData] = useState({
    firstName: isEdit ? employeeData?.firstName : "",
    middleInitial: isEdit ? employeeData?.middleInitial : "",
    lastName: isEdit ? employeeData?.lastName : "",
    email: isEdit ? employeeData.email: "",
    department: isEdit ? employeeData?.department : "",
    position: isEdit ? employeeData?.position : "",
    warehouseCode: isEdit ? employeeData?.warehouseCode : "",
    officeId: isEdit ? employeeData?.officeId : "",
    username: isEdit ? employeeData?.username : "",
    password: "",
    confirmPassword: "",
  })
  const [selectedDepartment, setSelectedDepartment] = useState("Quality Assurance")
  const [selectedPosition, setSelectedPosition] = useState("Admin")
  const [selectedWhseCode, setSelectedWhseCode] = useState("010502A")

  const handleDeptChange = (val) => { 
    setSelectedDepartment(val);
    setFormData( prev => ({
      ...prev,
      department: val
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
      warehouseCode: val
    }));
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value});
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData)

    // validation for the required fields
    const requiredFields = ['firstName', 'middleInitial', 'lastName', 'email', 'department', 'position', 'warehouseCode', 'officeId'];
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

    if (isEdit) {
      // update employee
    } else {
      // create new employee
    }

    successModal();
  }

  // modal functions
  // success modal
  const successModal = () => {
    setShowSuccesModal(true)
    return
  }

  // const closeSuccessModal = () => {
  //   setIsHiding(true);
  //   setTimeout(() => {
  //     setShowSuccesModal(false);
  //     setIsHiding(false);
  //   }, 300);
  // };

  // cancel modal
  const cancelModal = () => {
    setShowCancelModal(true)
    return
  }
  const closeCancelModal = () => {
    setIsHiding(true);
    setTimeout(() => {
      setShowCancelModal(false);
      setIsHiding(false);
    }, 300);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="employee-form-whole-container">
          <h2>{isEdit ? "Edit Employee" : "Add New Employee"}</h2>

          <div className="employee-credentials-container">
            <p>Name</p>
            <div className="employee-form-fields-row">
              <div className="label-input-emp-form">
                <label htmlFor="">First Name</label>
                <input name="firstName" value={formData.firstName} onChange={handleChange} type="text" />
              </div>
              <div className="label-input-emp-form">
                <label htmlFor="">Middle Initial</label>
                <input name="middleInitial" value={formData.middleInitial} onChange={handleChange} type="text" />
              </div>
              <div className="label-input-emp-form">
                <label htmlFor="">Last Name</label>
                <input name="lastName" value={formData.lastName} onChange={handleChange} type="text" />
              </div>
              <div className="label-input-emp-form">
                <label htmlFor="">Email</label>
                <input name="email" value={formData.email} onChange={handleChange} type="text" />
              </div>
            </div>
          </div>
          <div className="employee-credentials-container">
            <p>Department Information</p>
            <div className="employee-form-fields-row">
              <div className="label-input-emp-form">
                <label htmlFor="">Department</label>
                <FilterDropdown
                  selected={selectedDepartment}
                  options={["Quality Assurance", "Buffer Stock Management"]}
                  onSelect={handleDeptChange}
                  buttonClass={'dropdown-options-emp-form'}
                />
              </div>
              <div className="label-input-emp-form">
                <label htmlFor="">Position</label>
                <FilterDropdown
                  selected={selectedPosition}
                  options={["Admin", "QA", "Statistician"]}
                  onSelect={handlePosChange}
                  buttonClass={'dropdown-options-emp-form'}
                />
              </div>
              <div className="label-input-emp-form">
                <label htmlFor="">Warehouse Code</label>
                <FilterDropdown
                  selected={selectedWhseCode}
                  options={["010502A", "010502B"]}
                  onSelect={handleWhseCodeChange}
                  buttonClass={'dropdown-options-emp-form'}
                />
              </div>
              <div className="label-input-emp-form">
                <label htmlFor="">Office ID</label>
                <input name="officeId" value={formData.officeId} onChange={handleChange} type="text" />
              </div>
            </div>
          </div>
          <div className="employee-credentials-container">
            <p>Login Credentials</p>
            <div className="employee-form-fields-row">
              <div className="label-input-emp-form">
                <label htmlFor="">Username</label>
                <input name="username" value={formData.username} onChange={handleChange} type="text" />
              </div>
              <div className="label-input-emp-form">
                <label htmlFor="">Password</label>
                <div className="password-input-wrapper">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(prev => !prev)}
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>
              <div className="label-input-emp-form">
                <label htmlFor="">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}/>
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                  >
                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="cancel-sub-upd-btn-container">
            <button className="cancel-btn" type="button" onClick={cancelModal}>Cancel</button>
            <button className="upd-sub-btn" type="submit">{isEdit ? "Update" : "Save"}</button>
          </div>
        </div>
      </form>

      
      {/* cancel modal */}
      <div
        className={
          "emp-validation-modal-overlay" +
          (showCancelModal ? " show" : "") +
          (isHiding ? " hiding" : "")
        }
      >
        <div className='cancel-modal-emp'>
          <div className='top-part-modal-Cancel'></div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '25px'}}>
            <div className='icon-cancel-user'><FaExclamation  size={50} color='white'/></div>
          </div>
          <p className='cancel-emp-title'>Cancel {isEdit ? "Editing" : "Adding"}?</p>
          <p>Your data won’t be saved! Are you sure you <br/>want to quit {isEdit ? "editing" : "adding"} the employee?</p>
          <div className='validation-btns-cancel'>
            <button className='close-btn-emp' onClick={closeCancelModal}>Close</button>
            <button className='yes-btn-emp' onClick={() => {
              onCancel();
            }}>Yes</button>
          </div>
        </div>

      </div>

      {/* success modal */}
      <div
        className={
          "emp-validation-modal-overlay" +
          (showSuccessModal ? " show" : "") +
          (isHiding ? " hiding" : "")
        }
      >
        <div className='success-modal-emp'>
          <div className='top-part-modal-success-emp'></div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '25px'}}>
            <div className='icon-success-emp'><FaCheck size={50} color='white'/></div>
          </div>
          <p style={{color: '#2D317F', fontSize: '25px', fontWeight: 'bold'}}>Success!</p>
          <p style={{color: '#2D317F', fontSize: '15px', marginTop: '-20px'}}>{isEdit ? "Updated the employee." : "New employee has been added."}</p>    
          <button className='success-done-btn-emp' onClick={() => onCancel()}>Done</button>
        </div>
      </div>
        
    </>
  )
}
