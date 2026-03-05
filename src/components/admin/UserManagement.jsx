import '../../styles/admin/UserManagement.css'
import { useState } from 'react'

// react icon
import { FaEdit, FaSearch } from "react-icons/fa";
import { IoArchiveOutline } from "react-icons/io5";

const sampleUsers = [
  { id: '23100123', name: 'Ronnel C. Jucutan', email: 'ronneljucutan@nfa.gov.ph', userLevel: 'Admin', position: 'QA' },
  { id: '23100124', name: 'Febore Valenzuela', email: 'febrosevalenzuela@nfa.gov.ph', userLevel: 'User', position: 'Statistician' },
  { id: '23100125', name: 'Ronnel C. Jucutan', email: 'ronneljucutan@nfa.gov.ph', userLevel: 'User', position: 'QA' },
  { id: '23100126', name:  'Louie Valenzuela', email: 'louievalenzuela@nfa.gov.ph', userLevel: 'User', position: "Warehouse Supervisor"}
];

export default function UserManagement() {
  // us
  const [search, setSearch] = useState("");

  const filterUser = sampleUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

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
                    <button className='action-buttons'><IoArchiveOutline size={20} /></button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
    </>
  )
}
