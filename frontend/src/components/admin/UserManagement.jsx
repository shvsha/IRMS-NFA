import '../../styles/admin/UserManagement.css'
import { useState } from 'react'

// employee form component
import EmployeeForm from './EmployeeForm';

// react icon
import { FaEdit, FaSearch } from "react-icons/fa";
import { IoArchiveOutline } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";

export default function UserManagement() {
  // us
  const [search, setSearch] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // for employee form (add and edit)
  const [view, setView] = useState("list");
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  // sample user reporsts (remove later when database is present)
  const [sampleUser, setSampleUser] = useState([
    { id: '23100123', name: 'Ronnel C. Jucutan', email: 'ronneljucutan@nfa.gov.ph', userLevel: 'Admin', position: 'QA' },
    { id: '23100124', name: 'Febore Valenzuela', email: 'febrosevalenzuela@nfa.gov.ph', userLevel: 'User', position: 'Statistician' },
    { id: '23100125', name: 'Ronnel C. Jucutan', email: 'ronneljucutan@nfa.gov.ph', userLevel: 'User', position: 'QA' },
    { id: '23100126', name:  'Louie Valenzuela', email: 'louievalenzuela@nfa.gov.ph', userLevel: 'User', position: "Warehouse Supervisor"}
  ])

  // custome functions
  const filterUser = sampleUser.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleBack = () => {
    setView("list");
    setSelectedEmployee(null);
  };

  const closeValidationModal = () => {
    setIsHiding(true);
    setTimeout(() => {
      setShowValidationModal(false);
      setIsHiding(false);
    }, 300);
  };

  // archive modal
  const archiveValidationModal = () => {
    setShowValidationModal(true)
    return
  }
  const handleArchive = (id) => {
    const updatedUsers = sampleUser.filter(
      (user) => user.id !== id
    );
    setSampleUser(updatedUsers)
  }

  // success modal
  const successModal = () => {
    setShowSuccessModal(true)
    return
  }
  const closeSuccessModal = () => {
    setIsHiding(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      setIsHiding(false);
    }, 300);
  };

  // Show employee form instead of the user list when in edit or add mode
  if (view === "add") {
    return <EmployeeForm mode="add" onCancel={handleBack} />;
  }
  if (view === "edit") {
    return <EmployeeForm mode="edit" employeeData={selectedEmployee} onCancel={handleBack} />;
  }

  return (
    <>
      <div className='header-container'>
        <div> 
          <p className='header-title'>User Management</p>
        </div>
        <div style={{display: 'flex'}}>
          <div className='search-input-wrapper'>
            <input 
              className='header-search' 
              type="text" 
              placeholder='Search Name'
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <FaSearch className='search-icon-right-user' size={20} />
          </div>
          <button className='header-add-employee' onClick={() => setView("add")}>+ Add Employee</button>
        </div>    

      </div>
      <div className='table-wrapper'>
        <table className='user-table'>
          <thead>
            <tr>
              <th>Warehouse ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>UserLevel</th>
              <th>Position</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filterUser.map((user, i) => (
              <tr key={i}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.userLevel}</td>
                <td>{user.position}</td>
                <td>
                  <div>
                    <button className='action-buttons' onClick={() => {
                      setSelectedEmployee(user);
                      setView("edit");
                    }}><FaEdit color={'#2D317F'} size={20} /></button>
                    <button onClick={() => {
                      archiveValidationModal();
                      setSelectedId(user.id);
                    }} className='action-buttons'><IoArchiveOutline color={'#2D317F'} size={20} /></button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* archive modal */}
      <div
        className={
          "user-validation-modal-overlay" +
          (showValidationModal ? " show" : "") +
          (isHiding ? " hiding" : "")
        }
      >
        <div className='archive-user-modal'>
          <div className='top-part-modal-archive'></div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '25px'}}>
            <div className='icon-archive-user'><IoArchiveOutline size={50} color='#2D317F'/></div>
          </div>
          <p className='archive-user-title'>Archive User</p>
          <p>Are you sure you want to archive this user? <br/>You can restore it later if needed.</p>
          <div className='validation-btns-archive'>
            <button className='cancel-btn-archive' onClick={closeValidationModal}>Cancel</button>
            <button className='archive-btn-archive' onClick={() => {
              handleArchive(selectedId);
              closeValidationModal();
              successModal();
            }}>Archive</button>
          </div>
        </div>

      </div>

      {/* success modal */}
      <div
        className={
          "user-validation-modal-overlay" +
          (showSuccessModal ? " show" : "") +
          (isHiding ? " hiding" : "")
        }
      >
        <div className='success-modal'>
          <div className='top-part-modal-success'></div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '25px'}}>
            <div className='icon-success-user'><FaCheck size={50} color='white'/></div>
          </div>
          <p style={{color: '#2D317F', fontSize: '25px', fontWeight: 'bold'}}>Success!</p>
          <p style={{color: '#2D317F', fontSize: '15px', marginTop: '-20px'}}>Employee has been archived</p>
          <button className='success-done-btn-user' onClick={() => closeSuccessModal()}>Done</button>
        </div>
      </div>
    
    </>
  )
}
