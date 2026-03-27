// css
import '../../styles/admin/Dashboard.css'

// filter components
import { WeeklyFilter } from '../filters/WeeklyFilter'
import { MonthlyFilter } from '../filters/MonthlyFilter'


// react icons
import { FaRegCalendarAlt } from "react-icons/fa";

// react
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// shadcn components
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function Dashboard() {
  // for routers
  const navigate = useNavigate();
  // dropdown
  const [cerealType, setCerealType] = useState("All Cereal Type");
  const [rangeDate, setRangeDate] = useState("Weekly");
  // popup
  const [showCalendarFilter, setShowCalendarFilter] = useState(false);
  // for range
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState("January");

  // for date range
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });

  const [weeklyYear, setWeeklyYear] = useState(new Date().getFullYear());
  const [weeklyMonth, setWeeklyMonth] = useState(new Date().getMonth());
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());

  // call the API whenver dateRange updates
  // useEffect(() => {
  //   if (!dateRange.startDate || !dateRange.endDate) return;
  //   fetchDashboardData(dateRange.startDate, dateRange.endDate);
  // }, [dateRange]);

  // async function fetchDashboardData(startDate, endDate) {
  //   try {
  //     const res = await fetch(`/api/dashboard?startDate=${startDate}&endDate=${endDate}`);
  //     const data = await res.json();
  //     console.log("Dashboard data:", data); // replace with your state setters
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  const handlePrevMonth = () => {
    if (weeklyMonth === 0) {
      setWeeklyMonth(11);
      setWeeklyYear(y => y - 1);
    } else {
      setWeeklyMonth(m => m - 1);
    }
  }
  const handleNextMonth = () => {
    if (weeklyMonth === 11) {
      setWeeklyMonth(0);
      setWeeklyYear(y => y + 1);
    } else {
      setWeeklyMonth(m => m + 1);
    }
  }
  const handleDropdownAreaClick = () => {
    setShowCalendarFilter(prev => !prev)
  }
  const handleWeekSelect = (week) => {
    setSelectedWeek(week)
  }

  return (
    <div className='whole-container-dashboard'>

      <div style={{ position: 'relative' }}>
        <div className='welcome-filter-container-dashboard'>
          <p>Welcome, <span>Sir </span><span>Louie</span>!</p>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[#072560] border border-[#2D317F] rounded-md">
                <FaRegCalendarAlt className="h-5 w-5" />
              </Button>
            </PopoverTrigger>

            <PopoverContent 
              align="end" 
              sideOffset={12}
              className="p-0 bg-[#E6EEF6] w-80 rounded-lg shadow-lg border-0 overflow-visible"
            >
              {/* Arrow pointing to trigger */}
              <div className="absolute -top-2 right-4 w-4 h-4 bg-[#2D317F] rotate-45" />
              
              {/* Header */}
              <div className="h-11 bg-[#2D317F] rounded-t-lg flex items-center px-4 relative">
                <p className="text-white font-semibold text-base">Date</p>
              </div>
              
              {/* Content */}
              <div className="px-5 py-1 pb-8">
                <p className="text-[#2D317F] font-medium mb-4 text-lg">Select range type and date</p>
                
                <FieldGroup>
                  {/* Range Dropdown */}
                  <Field>
                    <FieldLabel className="text-[#2D317F] font-medium">Range</FieldLabel>
                    <Select 
                      value={rangeDate} 
                      onValueChange={(v) => {
                        setRangeDate(v)
                        setShowCalendarFilter(false)
                      }}
                    >
                      <SelectTrigger className="w-full bg-white border-gray-300">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  {/* Week/Month Selection */}
                  {rangeDate === "Weekly" && (
                    <Field>
                      <FieldLabel className="text-[#2D317F] font-medium">Week</FieldLabel>
                      <Select value={selectedWeek} onValueChange={setSelectedWeek} onOpenChange={(open) => {
                        if (open) setShowCalendarFilter(true)
                      }}>
                        <SelectTrigger className="w-full bg-white border-gray-300">
                          <SelectValue placeholder="Select week" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Week 1</SelectItem>
                          <SelectItem value="2">Week 2</SelectItem>
                          <SelectItem value="3">Week 3</SelectItem>
                          <SelectItem value="4">Week 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}

                  {rangeDate === "Monthly" && (
                    <Field>
                      <FieldLabel className="text-[#2D317F] font-medium">Month</FieldLabel>
                      <Select value={selectedMonth} onValueChange={setSelectedMonth} onOpenChange={(open) => {
                        if (open) setShowCalendarFilter(true)
                      }}>
                        <SelectTrigger className="w-full bg-white border-gray-300">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="January">January</SelectItem>
                          <SelectItem value="February">February</SelectItem>
                          <SelectItem value="March">March</SelectItem>
                          <SelectItem value="April">April</SelectItem>
                          <SelectItem value="May">May</SelectItem>
                          <SelectItem value="June">June</SelectItem>
                          <SelectItem value="July">July</SelectItem>
                          <SelectItem value="August">August</SelectItem>
                          <SelectItem value="September">September</SelectItem>
                          <SelectItem value="October">October</SelectItem>
                          <SelectItem value="November">November</SelectItem>
                          <SelectItem value="December">December</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                </FieldGroup>
              </div>

              {showCalendarFilter && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50">
                  {rangeDate === "Weekly" ? (
                    <WeeklyFilter
                      selectedWeek={selectedWeek}
                      year={weeklyYear}
                      month={weeklyMonth}
                      onPrevMonth={handlePrevMonth}
                      onNextMonth={handleNextMonth}
                      onMonthChange={setWeeklyMonth}
                      onYearChange={setWeeklyYear}
                      onWeekSelect={handleWeekSelect}
                    />
                  ) : (
                    <MonthlyFilter
                      selectedMonth={selectedMonth}
                      year={monthlyYear}
                      onYearChange={setMonthlyYear}
                      onMonthChange={setSelectedMonth}
                    />
                  )}
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
{/* 

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
        </div>*/}

      </div> 
    </div>
  );
}
