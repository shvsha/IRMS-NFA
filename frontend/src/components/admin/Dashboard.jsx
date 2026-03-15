import '../../styles/admin/Dashboard.css'
import { FaRegCalendarAlt, FaPlus } from "react-icons/fa";
import { TbClipboardCheck, TbChartBar, TbUserSearch } from "react-icons/tb";
import { useState, useRef, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

function FilterDropdown({ selected, options, onSelect, buttonClass }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button className={buttonClass} onClick={() => setOpen(o => !o)}>
        <span>{selected}</span>
        <span className={`dropdown-chevron-dashboard${open ? ' open' : ''}`}>▼</span>
      </button>
      {open && (
        <ul className="dropdown-content-dashboard">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => { onSelect(option); setOpen(false); }}
              className={selected === option ? 'dropdown-item-active-dashboard' : ''}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function WeeklyTrendChart({ cerealType }) {
  const baseData = {
    "All Cereal Type": [
      { warehouse: "Warehouse 1", receipts: 8, issues: 9 },
      { warehouse: "Warehouse 2", receipts: 8, issues: 11 },
    ],
    Rice: [
      { warehouse: "Warehouse 1", receipts: 4, issues: 5 },
      { warehouse: "Warehouse 2", receipts: 6, issues: 2 },
    ],
    Palay: [
      { warehouse: "Warehouse 1", receipts: 4, issues: 4 },
      { warehouse: "Warehouse 2", receipts: 2, issues: 9 },
    ],
  };

  const data = baseData[cerealType] || baseData["All Cereal Type"];
  const maxValue = Math.max(...data.flatMap(d => [d.receipts, d.issues]), 1);
  const CHART_HEIGHT = 200;

  const ticks = [];
  for (let i = 1; i <= maxValue + 1; i++) {
    ticks.push(i);
  }

  return (
    <div className="chart-wrapper">
      <div className="bar-chart-with-yaxis">

        <div className="y-axis" style={{ height: CHART_HEIGHT }}>
          {[...ticks].reverse().map(tick => (
            <span key={tick} className="y-tick">{tick}</span>
          ))}
        </div>

        <div className="bar-chart-inner">
          <div className="bar-chart" style={{ height: CHART_HEIGHT }}>
            {data.map(({ warehouse, receipts, issues }) => (
              <div key={warehouse} className="bar-group">
                <div className="bar-stack" style={{ height: CHART_HEIGHT }}>
                  <div
                    className="bar receipts"
                    style={{ height: `${(receipts / (maxValue + 1)) * 100}%` }}
                    title={`Receipts: ${receipts}`}
                  />
                  <div
                    className="bar issues"
                    style={{ height: `${(issues / (maxValue + 1)) * 100}%` }}
                    title={`Issues: ${issues}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="x-axis-line" />

          <div className="x-axis-labels">
            {data.map(({ warehouse }) => (
              <div key={warehouse} className="x-axis-label">{warehouse}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="bar-legend">
        <div><span className="legend-dot receipts" /> Statement of Receipts</div>
        <div><span className="legend-dot issues" /> Statement of Issues</div>
      </div>
    </div>
  );
}

function ReportStatusDonut({ approved, pending, rejected }) {
  const total = approved + pending + rejected;
  const radius = 58;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * radius;

  const approvedLen = (approved / total) * circumference;
  const pendingLen  = (pending  / total) * circumference;
  const rejectedLen = (rejected / total) * circumference;

  const approvedOffset = 0;
  const pendingOffset  = -(approvedLen);
  const rejectedOffset = -(approvedLen + pendingLen);

  return (
    <div className="donut-wrapper">
      <div style={{ position: 'relative', width: 160, height: 160 }}>
        <svg width={160} height={160} viewBox="0 0 160 160">
          <circle cx={cx} cy={cy} r={radius} fill="transparent" stroke="#E2EBFF" strokeWidth="20" />
          <circle
            cx={cx} cy={cy} r={radius}
            fill="transparent" stroke="#3E7A43" strokeWidth="20"
            strokeDasharray={`${approvedLen} ${circumference}`}
            strokeDashoffset={approvedOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          <circle
            cx={cx} cy={cy} r={radius}
            fill="transparent" stroke="#AE9C0F" strokeWidth="20"
            strokeDasharray={`${pendingLen} ${circumference}`}
            strokeDashoffset={pendingOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          <circle
            cx={cx} cy={cy} r={radius}
            fill="transparent" stroke="#B72132" strokeWidth="20"
            strokeDasharray={`${rejectedLen} ${circumference}`}
            strokeDashoffset={rejectedOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </svg>
        <div className="donut-center">
          <span>Report</span>
          <span>Status</span>
        </div>
      </div>
      <div className="donut-legend">
        <div><span className="legend-dot approved" /> Approved<span className="legend-value">{approved}</span></div>
        <div><span className="legend-dot pending" /> Pending<span className="legend-value">{pending}</span></div>
        <div><span className="legend-dot rejected" /> Rejected<span className="legend-value">{rejected}</span></div>
      </div>
    </div>
  );
}

function RecentActivities() {
  // reflect later on on audit logs
  const activities = [
    { text: "R1004 – New report submitted - WHS1", color: "#BD1C1C" },
    { text: "R1003 – New report submitted - WHS2", color: "#BD1C1C" },
    { text: "R1002 approved by admin",             color: "#2E7D32" },
    { text: "R-001 – Statement of Receipt exported to excel", color: "#2859C5" },
  ];

  return (
    <div className="recent-activities-list">
      {activities.map((activity, idx) => (
        <div key={idx} className="recent-activity-item">
          <span className="activity-dot" style={{ background: activity.color }} />
          <span>{activity.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  // us
  // dropdown
  const [cerealType, setCerealType] = useState("All Cereal Type");
  const [rangeDate, setRangeDate] = useState("Weekly");

  // for range
  const [selectedWeek, setSelectedWeek] = useState('Week 1');
  const [selectedMonth, setSelectedMonth] = useState("January");

  // popup
  const [showCalendarFilter, setShowCalendarFilter] = useState(false);

  // for routers
  const navigate = useNavigate();

  return (
    <div className='whole-container-dashboard'>

      <div className='welcome-filter-container-dashboard'>
        <p>Welcome, <span>Sir </span><span>Louie</span>!</p>
        <button onClick={() => setShowCalendarFilter(!showCalendarFilter)}><FaRegCalendarAlt size={20} color={'#072560'} /></button>
      </div>

      {showCalendarFilter && (
        <div style={{ display: "inline-block", position: 'relative'}}>
          <div className='calendar-filter-popup-dashboard'>
            <div className='top-part-filter-popup-dashboard'>
              <p>Date Picker</p>
            </div>
            <div className='title-select-range-date-container'>
              Select range type and date
            </div>
            <div className='range-date-container'>
              <label htmlFor="">Range</label>
              <FilterDropdown
                selected={rangeDate}
                options={["Weekly", "Monthly"]}
                onSelect={setRangeDate}
                buttonClass="date-filter-dashboard"
              />
            </div>
            {rangeDate === 'Weekly' && (
              <div className='range-date-container'>
                <label htmlFor="">Week</label>
                <FilterDropdown
                  selected={selectedWeek}
                  options={['Week 1', 'Week 2', 'Week 3', 'Week 4']}
                  onSelect={setSelectedWeek}
                  buttonClass="date-filter-dashboard"
                />
              </div>
            )}
            {rangeDate === 'Monthly' && (
              <div className='range-date-container'>
                <label htmlFor="">Monthly</label>
                <FilterDropdown
                  selected={selectedMonth}
                  options={['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']}
                  onSelect={setSelectedMonth}
                  buttonClass="date-filter-dashboard"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className='summary-cards-dashboard-container'>
        <div className='summar-cards-dashboard'>
          <div style={{ backgroundColor: '#2D317F' }}></div>
          <div className='label-dashboard label-value-total-reports'>Total Reports</div>
          <div className='value-dashbaord label-value-total-reports'><span>159</span></div>
        </div>
        <div className='summar-cards-dashboard'>
          <div style={{ backgroundColor: '#3E7A43' }}></div>
          <div className='label-dashboard label-value-approved'>Approved</div>
          <div className='value-dashbaord label-value-approved'><span>148</span></div>
        </div>
        <div className='summar-cards-dashboard'>
          <div style={{ backgroundColor: '#AE9C0F' }}></div>
          <div className='label-dashboard label-value-pending'>Pending Review</div>
          <div className='value-dashbaord label-value-pending'><span>12</span></div>
        </div>
        <div className='summar-cards-dashboard'>
          <div style={{ backgroundColor: '#B72132' }}></div>
          <div className='label-dashboard label-value-rejected'>Rejected</div>
          <div className='value-dashbaord label-value-rejected'><span>67</span></div>
        </div>
      </div>

      <div className='below-container-dashboard'>

        <div className='bar-graph-container'>
          <div className='bar-graph-filter-container'>
            <span>Weekly Trend</span>
            <FilterDropdown
              selected={cerealType}
              options={["All Cereal Type", "Rice", "Palay"]}
              onSelect={setCerealType}
              buttonClass="cereal-filter-dashboard"
            />
          </div>
          <div className='bar-graph'>
            <WeeklyTrendChart cerealType={cerealType} />
          </div>
        </div>

        <div className='pie-graph-container'>
          <div className='pie-graph-filter-container'>
            <span style={{ fontWeight: '700' }}>Report Status</span>
            <span style={{ fontSize: 13 }}>This week</span>
          </div>
          <div className='pie-graph'>
            <ReportStatusDonut approved={149} pending={5} rejected={67} />
          </div>
        </div>

        <div className='recent-quick-act-container'>
          <div className='recent-act-container'>
            <div className='section-title'><p>Recent Activities</p></div>
            <RecentActivities />
          </div>
          <div className='quick-act-container'>
            <div className='section-title'><p>Quick Actions</p></div>
            <div className='quick-actions-grid'>
              <button onClick={() => navigate('/admin/users')} className='quick-action-btn'><FaPlus /><span>Add User</span></button>
              <button onClick={() => navigate('/admin/evaluation')} className='quick-action-btn'><TbClipboardCheck /><span>Evaluation</span></button>
              <button onClick={() => navigate('/admin/summarization')} className='quick-action-btn'><TbChartBar /><span>Summary</span></button>
              <button onClick={() => navigate('/admin/audit')} className='quick-action-btn'><TbUserSearch /><span>Audit Logs</span></button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
