import '../../styles/admin/Dashboard.css'
import { FaRegCalendarAlt, FaPlus } from "react-icons/fa";
import { TbClipboardCheck, TbChartBar , TbUserSearch   } from "react-icons/tb";

export default function Dashboard() {
  return (
    <>
      <div className='whole-container-dashboard'>

       <div className='welcome-filter-container-dashboard'>
        <p>Welcome, <span>Sir </span><span>Louie</span>!</p>
        <button><FaRegCalendarAlt size={20} color={'#072560'}/></button>
       </div>

       <div className='summary-cards-dashboard-container'>
        <div className='summar-cards-dashboard'>
          <div style={{borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: '#2D317F', height: '10px' }}></div>
          <div className='label-dashboard'>Total Reports</div>
          <div className='value-dashbaord'><span>159</span></div>
        </div>
        <div className='summar-cards-dashboard'>
          <div style={{borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: '#3E7A43', height: '10px' }}></div>
          <div className='label-dashboard'>Approved</div>
          <div className='value-dashbaord'><span>148</span></div>
        </div>
        <div className='summar-cards-dashboard'>
          <div style={{borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: '#AE9C0F', height: '10px' }}></div>
          <div className='label-dashboard'>Pending Review</div>
          <div className='value-dashbaord'><span>12</span></div>
        </div>
        <div className='summar-cards-dashboard'>
            <div style={{borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: '#B72132', height: '10px' }}></div>
          <div className='label-dashboard'>Rejected</div>
          <div className='value-dashbaord'><span>67</span></div>
        </div>
       </div>

       <div>
        <div className='bar-graph-container'>
          <div className='bar-graph-filter-container'>
            <span>Weekly Trend</span>
            <button>Cereal Type</button>
          </div>
          <div className='bar-graph'>

          </div>
        </div>

        <div className='pie-graph-container'>
          <div className='pie-graph-filter-container'>
            <span>Report Status</span>
            <span>This week</span>
          </div>
          <div className='pie-graph'>

          </div>

        </div>
        
        <div className='recent-quick-act-container'>
          <div className='recent-act-container'>
            <div style={{display: 'flex'}}>
              <p style={{color: '#2859C5'}}>Recent Activities</p>
            </div>
            <div className='recent-activities-dashboard'>

            </div>
            {/* add more */}
          </div>
          <div className='quick-act-container'>
            <div style={{display: 'flex'}}>
              <p>Quick Actions</p>
            </div>
            <div className='top-quick-act-container'>
              <button><FaPlus/> Add User</button>
              <button><TbClipboardCheck/> Evalutaion</button>
            </div>
            <div className='top-quick-act-container'>
              <button><TbChartBar/> Summary</button>
              <button><TbUserSearch/> Audit Logs</button>

            </div>

          </div>

        </div>


       </div>
      </div>
    </>
  )
}
