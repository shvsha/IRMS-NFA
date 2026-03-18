// react
import { useState } from "react"

// css
import '../../styles/admin/EmployeeForm.css'

//components
import FilterDropdown from "../filters/FilterDropdown"

import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function EmployeeForm({ mode = 'add', employeeData = null, onCancel }) {
  const isEdit = mode === 'edit';

  // us
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: isEdit ? employeeData?.firstName : "",
    middleInitial: isEdit ? employeeData?.middleInitial : "",
    lastName: isEdit ? employeeData?.lastName : "",
    email: isEdit ? employeeData.email: "",
    department: isEdit ? employeeData?.department : "",
    position: isEdit ? employeeData?.position : "",
    warehouseCode: isEdit ? employeeData?.warehouseCode : "",
    officeId: isEdit ? employeeData?.officeId : "",
    password: "",
    confirmPassword: "",
  })
  const [selectedDepartment, setSelectedDepartment] = useState("Quality Assurance")
  const [selectedPosition, setSelectedPosition] = useState("Admin")
  const [selectedWhseCode, setSelectedWhseCode] = useState("010502A")

  const handleDeptChange = (val) => { setSelectedDepartment(val);}
  const handlePosChange = (val) => { setSelectedPosition(val); }
  const handleWhseCodeChange = (val) => { setSelectedWhseCode(val); }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value});
  }

  const handleSubmit = () => {
    if (isEdit) {
      // update employee
    } else {
      // create new employee
    }
  }

  return (
    <>
      <div className="employee-form-whole-container">
        <h2>{isEdit ? "Edit Employee" : "Add New Employee"}</h2>

        <div className="employee-credentials-container">
          <p>Name</p>
          <div className="employee-form-fields-row">
            <div className="label-input-emp-form">
              <label htmlFor="">First Name</label>
              <input type="text" />
            </div>
            <div className="label-input-emp-form">
              <label htmlFor="">Middle Initial</label>
              <input type="text" />
            </div>
            <div className="label-input-emp-form">
              <label htmlFor="">Last Name</label>
              <input type="text" />
            </div>
            <div className="label-input-emp-form">
              <label htmlFor="">Email</label>
              <input type="text" />
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
              <input type="text" />
            </div>
          </div>
        </div>
        <div className="employee-credentials-container">
          <p>Login Credentials</p>
          <div className="employee-form-fields-row">
            <div className="label-input-emp-form">
              <label htmlFor="">Username</label>
              <input type="text" />
            </div>
            <div className="label-input-emp-form">
              <label htmlFor="">Password</label>
              <div className="password-input-wrapper">
                <input type={showPassword ? "text" : "password"} />
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
                <input type={showConfirmPassword ? "text" : "password"} />
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
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="upd-sub-btn" onClick={handleSubmit}>{isEdit ? "Update" : "Save"}</button>
        </div>
      </div>
    </>
  )
}
