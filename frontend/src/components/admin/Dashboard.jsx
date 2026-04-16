// css
import '../../styles/admin/Dashboard.css'

// filter components
import { WeeklyFilter } from '../filters/WeeklyFilter'
import { MonthlyFilter } from '../filters/MonthlyFilter'

// react icons
import { FaRegCalendarAlt } from "react-icons/fa";
import { Plus, ClipboardCheck, BarChart2, UserCheck } from "lucide-react";

// react
import { useState } from 'react';
import * as React from "react"
import { useNavigate } from 'react-router-dom';

// shadcn components
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger, } from "@/components/ui/popover"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
// charts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart,  Pie, Cell, Tooltip
} from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

// These data are just for demo purposes, replace with API data
const barData = [
  { warehouse: "Warehouse 1", receipts: 10.5, issues: 7},
  { warehouse: "Warehouse 2", receipts: 6.5, issues: 8},
]
const barChartConfig = {
  receipts: {
    label: "Statements of Receipts",
    color: "#2859C5",
  },
  issues: {
    label: "Statements of Issues",
    color: "#0B3B66"
  }
}
const pieData = [
  { name: "Approved", value: 149, color: "#3E7A43" },
  { name: "Pending", value: 5, color: "#AE9C0F" },
  { name: "Rejected", value: 67, color: "#BB2325" },
];

const pieChartConfig = {
  Approved: { label: "Approved", color: "#3E7A43" },
  Pending:  { label: "Pending",  color: "#AE9C0F" },
  Rejected: { label: "Rejected", color: "#BB2325" },
};

// audit logs later on
const activities = [
  { id: 1, message: "R1004 - New report submitted - WHS1", color: "bg-red-500" },
  { id: 2, message: "R1003 - New report submitted - WHS2", color: "bg-red-500" },
  { id: 3, message: "R1002 approved by admin", color: "bg-green-500" },
  { id: 4, message: "R-001 - Statement of Receipt exported to excel", color: "bg-[#1a2f6f]" },
];

const total = pieData.reduce((sum, d) => sum + d.value, 0);
 
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

  // calendar filter
  const [weeklyYear, setWeeklyYear] = useState(new Date().getFullYear());
  const [weeklyMonth, setWeeklyMonth] = useState(new Date().getMonth());
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());

  const [activeIndex, setActiveIndex] = useState(null);
  
  // Refs for positioning
  const weekDropdownRef = React.useRef(null)
  const monthDropdownRef = React.useRef(null)

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
    <div className='m-4 xl:m-5 2xl:m-7.5 flex flex-col h-[calc(100vh-var(--titlebar-height,130px))]'>

      <div className='relative'>
        <div className='flex justify-between items-center mb-3.5 shrink-0 relative'>
          <p className='font-bold text-3xl text-[#2D317F] m-0'>Welcome, <span>Sir </span><span>Louie</span>!</p>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="text-[#072560]rounded-md bg-white px-5 py-5">
                <FaRegCalendarAlt size={20} />
              </Button>
            </PopoverTrigger>

            <PopoverContent 
              align="end" 
              sideOffset={12}
              className="p-0 bg-[#E6EEF6] w-80 rounded-lg shadow-lg border-0 overflow-visible z-40"
            >
              {/* Arrow */}
              <div className="absolute -top-2 right-4 w-4 h-4 bg-[#2D317F] rotate-45" />
              
              {/* Header */}
              <div className="h-8.5 bg-[#2D317F] rounded-t-lg flex items-center px-4 relative">
                <p className="text-white font-medium text-base">Date</p>
              </div>
              
              {/* Content */}
              <div className="px-5 py-1 pb-8">
                <p className="text-[#2D317F] font-medium mb-1 text-sm">Select range type and date</p>
                
                <FieldGroup>
                  {/* Range Dropdown */}
                  <Field>
                    <FieldLabel className="text-[#2D317F] font-medium">
                      Range
                    </FieldLabel>
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
                        <SelectItem className='p-2' value="Weekly">Weekly</SelectItem>
                        <SelectItem className='p-2' value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  {/* Week/Month Selection */}
                  {rangeDate === "Weekly" && (
                    <Field>
                      <FieldLabel className="text-[#2D317F] font-medium">
                        Week
                      </FieldLabel>
                      <div ref={weekDropdownRef} className="relative">
                        <button
                          type="button"
                          onClick={handleDropdownAreaClick}
                          className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-none"
                        >
                          <span>Week {selectedWeek}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 opacity-50"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>
                      </div>
                    </Field>
                  )}
                  {rangeDate === "Monthly" && (
                    <Field>
                      <FieldLabel className="text-[#2D317F] font-medium">
                        Month
                      </FieldLabel>
                      <div ref={monthDropdownRef} className="relative">
                        <button
                          type="button"
                          onClick={handleDropdownAreaClick}
                          className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-none"
                        >
                          <span>{selectedMonth}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 opacity-50"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>
                      </div>
                    </Field>
                  )}
                </FieldGroup>
              </div>

              {showCalendarFilter && (
                <div className="absolute left-1/2 -right-175 top-30 -translate-x-1/2  mt-2 z-50">
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

        <div className='flex w-full gap-2'>
          <Card className='rounded-md pt-0 flex-1 h-auto bg-[#E1EBFF]'>
            <CardHeader className='p-0'><div className='bg-[#2D317F] h-3 p-0'></div></CardHeader>
            <CardContent>
              <p className='text-[#2D317F]'>Total Reports</p>
              <div className='ml-15 mt-3 text-5xl text-[#2D317F] font-medium'>158</div>
            </CardContent>

          </Card>
          <Card className='rounded-md pt-0 flex-1 h-auto bg-[#E1EBFF]'>
            <CardHeader className='p-0'><div className='bg-[#418447] h-3 p-0'></div></CardHeader>
            <CardContent>
              <p className='text-[#418447]'>Approved</p>
              <div className='ml-8 xl:ml-12 2xl:ml-15 mt-2 xl:mt-3 text-3xl xl:text-4xl 2xl:text-5xl font-medium text-[#418447]'>148</div>
            </CardContent>

          </Card>
          <Card className='rounded-md pt-0 flex-1 h-auto bg-[#E1EBFF]'>
            <CardHeader className='p-0'><div className='bg-[#AE9C0F] h-3 p-0'></div></CardHeader>
            <CardContent>
              <p className='text-[#AE9C0F]'>Pending Review</p>
              <div className='ml-15 mt-3 text-5xl text-[#AE9C0F] font-medium'>12</div>
            </CardContent>

          </Card>
          <Card className='rounded-md pt-0 flex-1 h-auto bg-[#E1EBFF]'>
            <CardHeader className='p-0'><div className='bg-[#BB2325] h-3 p-0'></div></CardHeader>
            <CardContent>
              <p className='text-[#BB2325]'>Rejected</p>
              <div className='ml-15 mt-3 text-5xl text-[#BB2325] font-medium'>67</div>
            </CardContent>

          </Card>
        </div>

        <div className='flex gap-2 xl:gap2.5 flex-1 mt-2 flex-col lg:flex-row'>
          {/* bar graph */}
          <div className='bg-[#E1EBFF] rounded-md flex-1 p-3 xl:p-4 w-full'>
            {/* header */}
            <div className='flex justify-between items--center shrink overflow relative border-b border-b-[#ADCEFF] pb-3'>
              <p className='font-bold text-[#2D317F] p-1 '>Weekly Trend</p>
              <Select value={cerealType} onValueChange={(v) => setCerealType(v)}>
                <SelectTrigger className='border bg-transparent border-[#0B3B66] p-3 text-[#0B3B66]'>{cerealType}</SelectTrigger>
                <SelectContent>
                  <SelectItem className='p-2 text-[#0B3B66]' value="All Cereal Type">All Cereal Type</SelectItem>
                  <SelectItem className='p-2 text-[#0B3B66]' value="Palay">Palay</SelectItem>
                  <SelectItem className='p-2 text-[#0B3B66]' value="Rice">Rice</SelectItem>
                </SelectContent>
              </Select>

            </div>
            
          <div className="overflow-x-auto w-full">
              <div className='min-w-[400px]'>
                <ChartContainer config={barChartConfig} className="h-65 w-full mt-2">
                  <BarChart 
                    data={barData} 
                    barCategoryGap="40%" 
                    barGap={6}
                    margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
                  >
                    <CartesianGrid vertical={false} stroke="#0B3B66" strokeDasharray="0" strokeWidth={0.1} />
                    <XAxis
                      dataKey="warehouse"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#1A2F6F", fontSize: 13 }}
                    />
                    <YAxis
                      domain={[1, 11]}
                      ticks={[1, 3, 5, 7, 9, 11]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      width={30}
                    />
                    <Bar barSize={40} dataKey="receipts" fill="var(--color-receipts)" radius={[4, 4, 0, 0]} />
                    <Bar barSize={40} dataKey="issues" fill="var(--color-issues)" radius={[4, 4, 0, 0]} />
                    <ChartLegend 
                      verticalAlign="bottom"
                      content={<ChartLegendContent className="pt-2" />} 
                    />
                  </BarChart>
                </ChartContainer>
              </div>
          </div>

          </div>
          {/* pie graph */}
          <div className='bg-[#E1EBFF] rounded-md p-3 xl:p-4 w-full lg:w-auto lg:min-[220px] xl:min-[250px]'>
            {/* header */}
            <div className='flex justify-between items-center mb-2 border-b border-b-[#ADCEFF] pb-3'>
              <span className='text-[#2D317F] font-bold '>Report Status</span>
              <span className='text-[#2D317F] '>This Week</span>
            </div>

            {/* donut chart */}
            <div className="relative h-[150px] w-full">
              <ChartContainer config={pieChartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70} 
                      paddingAngle={2}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                          opacity={activeIndex === null || activeIndex === index ? 1 : 0.45}
                          style={{ cursor: "pointer", transition: "opacity 0.2s" }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "none",
                        background: "#fff",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                        fontSize: 13,
                      }}
                      formatter={(value, name) => [value, name]}
                    />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-[#1a2f6f] leading-none">{total}</span>
                  <span className="text-xs text-[#6b86a8] mt-1">Total</span>
                </div>
              </div>
              {/* LEGEND */}
            <div className="flex flex-col gap-3 mt-3">
              {pieData.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
                  style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.45 }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <span
                    className="w-[14px] h-[14px] rounded-sm flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex-1 text-sm font-medium text-[#1a2f6f]">{item.name}</span>
                  <span className="text-sm font-bold" style={{ color: item.color }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            

          </div>

          {/* audit quic act */}
          <div className='w-full lg:w-auto lg:min-[200px] xl:min-w[220px]'>
            <div className='bg-[#E1EBFF] p-2 mb-2 rounded-md px-4 py-2'>
              <div className='text-[#2859C5] font-medium mb-2 border-b border-b-[#ADCEFF] pb-3 p-1'>
                Recent Activities
              </div>
              <div className='max-h-[100px] overflow-y-auto flex flex-col divide-y divide-[#b8cfe8]'>
                {activities.map((activity) => (
                  <div key={activity.id} className='flex items-start gap-3 py-3 first:pt-0 last:pb-0'>
                    <span className={`mt-[3px] w-2.5 h-2.5 rounded-full shrink-0 ${activity.color}`} />
                    <span className="text-xs text-[#1a2f6f] leading-snug">{activity.message}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className='bg-[#E1EBFF] p-3 py-4 rounded-md h-auto'>
              <div className='text-[#2859C5] font-medium mb-3 border-b border-b-[#ADCEFF] pb-3 p-1'>
                Quick Actions
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <Button onClick={() => navigate('/admin/users')} className="w-full py-4 bg-[#8FBFFA] border border-[#8FBFFA] text-[#2D317F]">
                  <Plus className="w-4 h-4" />Add User
                </Button>
                <Button onClick={() => navigate('/admin/evaluation')} className="w-full py-4 bg-[#8FBFFA] border border-[#8FBFFA] text-[#2D317F]">
                  <ClipboardCheck className="w-4 h-4" />Evaluation
                </Button>
                <Button onClick={() => navigate('/admin/summarization')} className="w-full py-4 bg-[#8FBFFA] border border-[#8FBFFA] text-[#2D317F]">
                  <BarChart2 className="w-4 h-4" />Summary
                </Button>
                <Button onClick={() => navigate('/admin/audit')} className="w-full py-4 bg-[#8FBFFA] border border-[#8FBFFA] text-[#2D317F]">
                  <UserCheck className="w-4 h-4" />Audit Logs
                </Button>
              </div>
            </div>
          </div>
        </div>
        
      </div> 
    </div>
  );
}
