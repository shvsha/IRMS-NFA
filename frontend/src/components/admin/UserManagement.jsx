import '../../styles/admin/UserManagement.css'
import { useState } from 'react'

// react icon
import { FaEdit, FaSearch } from "react-icons/fa";
import { IoArchiveOutline } from "react-icons/io5";

export default function UserManagement() {
  // us
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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

  const closeModal = () => {
    setIsHiding(true);
    setTimeout(() => {
      setShowModal(false);
      setIsHiding(false);
    }, 300);
  };

  const archiveModal = () => {
    setShowModal(true)
    return
  }

  const handleArchive = (id) => {
    const updatedUsers = sampleUser.filter(
      (user) => user.id !== id
    );
    setSampleUser(updatedUsers)
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
          <button className='header-add-employee'>+ Add Employee</button>
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
                    <button className='action-buttons'><FaEdit size={20} /></button>
                    <button onClick={() => {
                      archiveModal();
                      setSelectedId(user.id);
                    }} className='action-buttons'><IoArchiveOutline size={20} /></button>
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
          "archive-user-validation-modal-overlay" +
          (showModal ? " show" : "") +
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
            <button className='cancel-btn-archive' onClick={closeModal}>Cancel</button>
            <button className='archive-btn-archive' onClick={() => {
              handleArchive(selectedId);
              closeModal();
            }}>Archive</button>
          </div>
        </div>

      </div>
    
    </>
  )
}
