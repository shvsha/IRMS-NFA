// filter components
import { WeeklyFilter } from '../../components/filters/WeeklyFilter'
import { MonthlyFilter } from '../../components/filters/MonthlyFilter'

// react icons
import { FaRegCalendarAlt } from "react-icons/fa";
import { Plus, ClipboardCheck, BarChart2, UserCheck } from "lucide-react";

// react
import { useState } from 'react';
import * as React from "react"
import { useNavigate } from 'react-router-dom';

// shadcn components
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// charts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

// dummy data
const barData = [
  { warehouse: "Warehouse 1", receipts: 10.5, issues: 7 },
  { warehouse: "Warehouse 2", receipts: 6.5,  issues: 8 },
]
const barChartConfig = {
  receipts: { label: "Statements of Receipts", color: "#2859C5" },
  issues:   { label: "Statements of Issues",   color: "#0B3B66" },
}
const pieData = [
  { name: "Approved", value: 149, color: "#3E7A43" },
  { name: "Pending",  value: 5,   color: "#AE9C0F" },
  { name: "Rejected", value: 67,  color: "#BB2325" },
]
const pieChartConfig = {
  Approved: { label: "Approved", color: "#3E7A43" },
  Pending:  { label: "Pending",  color: "#AE9C0F" },
  Rejected: { label: "Rejected", color: "#BB2325" },
}
const activities = [
  { id: 1, message: "R1004 - New report submitted - WHS1",              color: "bg-red-500"     },
  { id: 2, message: "R1003 - New report submitted - WHS2",              color: "bg-red-500"     },
  { id: 3, message: "R1002 approved by admin",                          color: "bg-green-500"   },
  { id: 4, message: "R-001 - Statement of Receipt exported to excel",   color: "bg-[#1a2f6f]"  },
]
const total = pieData.reduce((sum, d) => sum + d.value, 0)

function StatCard({ label, value, accentColor, textColor }) {
  return (
    <Card className='rounded-md pt-0 flex-1 bg-[#E1EBFF]'>
      <CardHeader className='p-0'>
        <div className='h-3 p-0 rounded-t-md' style={{ backgroundColor: accentColor }} />
      </CardHeader>
      <CardContent className='px-3 xl:px-4 py-1.5 xl:py-2'>
        <p className='text-xs xl:text-sm font-medium' style={{ color: accentColor }}>{label}</p>
        <div
          className='mt-1 xl:mt-1.5 ml-4 xl:ml-6 2xl:ml-10 text-2xl xl:text-3xl 2xl:text-4xl font-medium'
          style={{ color: textColor ?? accentColor }}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

// main
export default function Dashboard() {
  const navigate = useNavigate()

  const [cerealType, setCerealType]               = useState("All Cereal Type")
  const [rangeDate, setRangeDate]                 = useState("Weekly")
  const [showCalendarFilter, setShowCalendarFilter] = useState(false)
  const [selectedWeek, setSelectedWeek]           = useState(1)
  const [selectedMonth, setSelectedMonth]         = useState("January")
  const [weeklyYear, setWeeklyYear]               = useState(new Date().getFullYear())
  const [weeklyMonth, setWeeklyMonth]             = useState(new Date().getMonth())
  const [monthlyYear, setMonthlyYear]             = useState(new Date().getFullYear())
  const [activeIndex, setActiveIndex]             = useState(null)

  const weekDropdownRef  = React.useRef(null)
  const monthDropdownRef = React.useRef(null)

  const handlePrevMonth = () => {
    if (weeklyMonth === 0) { setWeeklyMonth(11); setWeeklyYear(y => y - 1) }
    else setWeeklyMonth(m => m - 1)
  }
  const handleNextMonth = () => {
    if (weeklyMonth === 11) { setWeeklyMonth(0); setWeeklyYear(y => y + 1) }
    else setWeeklyMonth(m => m + 1)
  }
  const handleDropdownAreaClick = () => setShowCalendarFilter(prev => !prev)
  const handleWeekSelect        = (week) => setSelectedWeek(week)

  return (
     <div className='px-5 xl:px-7 2xl:px-8 py-3 xl:py-4 flex flex-col gap-2 xl:gap-3 h-full'>

      <div className='flex justify-between items-center shrink-0 mb-0'>
        <p className='font-bold text-xl xl:text-2xl 2xl:text-3xl text-[#2D317F] m-0'>
          Welcome, <span>Sir </span><span>Louie</span>!
        </p>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="bg-white px-4 py-4 xl:px-5 xl:py-5">
              <FaRegCalendarAlt size={18} className="xl:hidden" />
              <FaRegCalendarAlt size={20} className="hidden xl:block" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            align="end"
            sideOffset={12}
            className="p-0 bg-[#E6EEF6] w-72 xl:w-80 rounded-lg shadow-lg border-0 overflow-visible z-40"
          >
            <div className="absolute -top-2 right-4 w-4 h-4 bg-[#2D317F] rotate-45" />
            <div className="h-8 bg-[#2D317F] rounded-t-lg flex items-center px-4">
              <p className="text-white font-medium text-sm xl:text-base">Date</p>
            </div>
            <div className="px-4 xl:px-5 py-1 pb-7 xl:pb-8">
              <p className="text-[#2D317F] font-medium mb-1 text-xs xl:text-sm">Select range type and date</p>
              <FieldGroup>
                <Field>
                  <FieldLabel className="text-[#2D317F] font-medium">Range</FieldLabel>
                  <Select value={rangeDate} onValueChange={(v) => { setRangeDate(v); setShowCalendarFilter(false) }}>
                    <SelectTrigger className="w-full bg-white border-gray-300">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className='p-2' value="Weekly">Weekly</SelectItem>
                      <SelectItem className='p-2' value="Monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {rangeDate === "Weekly" && (
                  <Field>
                    <FieldLabel className="text-[#2D317F] font-medium">Week</FieldLabel>
                    <div ref={weekDropdownRef} className="relative">
                      <button type="button" onClick={handleDropdownAreaClick}
                        className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-none">
                        <span>Week {selectedWeek}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className="h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6" /></svg>
                      </button>
                    </div>
                  </Field>
                )}
                {rangeDate === "Monthly" && (
                  <Field>
                    <FieldLabel className="text-[#2D317F] font-medium">Month</FieldLabel>
                    <div ref={monthDropdownRef} className="relative">
                      <button type="button" onClick={handleDropdownAreaClick}
                        className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-none">
                        <span>{selectedMonth}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className="h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6" /></svg>
                      </button>
                    </div>
                  </Field>
                )}
              </FieldGroup>
            </div>

            {showCalendarFilter && (
              <div className="absolute left-1/2 -right-175 top-30 -translate-x-1/2 mt-2 z-50">
                {rangeDate === "Weekly" ? (
                  <WeeklyFilter
                    selectedWeek={selectedWeek} year={weeklyYear} month={weeklyMonth}
                    onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth}
                    onMonthChange={setWeeklyMonth} onYearChange={setWeeklyYear}
                    onWeekSelect={handleWeekSelect}
                  />
                ) : (
                  <MonthlyFilter
                    selectedMonth={selectedMonth} year={monthlyYear}
                    onYearChange={setMonthlyYear} onMonthChange={setSelectedMonth}
                  />
                )}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <div className='grid grid-cols-2 xl:grid-cols-4 gap-2 xl:gap-3 shrink-0'>
        <StatCard label="Total Reports"  value={158} accentColor="#2D317F" textColor="#2D317F" />
        <StatCard label="Approved"       value={148} accentColor="#418447" />
        <StatCard label="Pending Review" value={12}  accentColor="#AE9C0F" />
        <StatCard label="Rejected"       value={67}  accentColor="#BB2325" />
      </div>

      <div className='flex flex-col xl:flex-row gap-2 xl:gap-2.5 flex-1 min-h-0'>

        {/* Bar chart  */}
        <div className='bg-[#E1EBFF] rounded-md flex-[2] p-3 xl:p-4 min-w-0'>
          <div className='flex justify-between items-center border-b border-b-[#ADCEFF] pb-3 mb-2'>
            <p className='font-bold text-sm xl:text-base text-[#2D317F]'>Weekly Trend</p>
            <Select value={cerealType} onValueChange={(v) => setCerealType(v)}>
              <SelectTrigger className='border bg-transparent border-[#0B3B66] px-2 xl:px-3 text-[#0B3B66] text-xs xl:text-sm max-w-[130px] xl:max-w-[170px]'>
                {cerealType}
              </SelectTrigger>
              <SelectContent>
                <SelectItem className='p-2 text-[#0B3B66]' value="All Cereal Type">All Cereal Type</SelectItem>
                <SelectItem className='p-2 text-[#0B3B66]' value="Palay">Palay</SelectItem>
                <SelectItem className='p-2 text-[#0B3B66]' value="Rice">Rice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto w-full">
            <div className='min-w-[400px]'>
              <ChartContainer config={barChartConfig} className="h-40 xl:h-48 2xl:h-56 w-full mt-2">
                <BarChart
                  data={barData}
                  barCategoryGap="40%"
                  barGap={6}
                  margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
                >
                  <CartesianGrid vertical={false} stroke="#0B3B66" strokeDasharray="0" strokeWidth={0.1} />
                  <XAxis dataKey="warehouse" axisLine={false} tickLine={false} tick={{ fill: "#1A2F6F", fontSize: 12 }} />
                  <YAxis domain={[1, 11]} ticks={[1, 3, 5, 7, 9, 11]} axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} width={28} />
                  <Bar barSize={36} dataKey="receipts" fill="var(--color-receipts)" radius={[4, 4, 0, 0]} />
                  <Bar barSize={36} dataKey="issues"   fill="var(--color-issues)"   radius={[4, 4, 0, 0]} />
                  <ChartLegend verticalAlign="bottom" content={<ChartLegendContent className="pt-2" />} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>

        {/* Pie chart */}
        <div className='bg-[#E1EBFF] rounded-md flex-[1] p-3 xl:p-4 flex flex-col min-w-0'>
          <div className='flex justify-between items-center mb-2 border-b border-b-[#ADCEFF] pb-3'>
            <span className='text-[#2D317F] font-bold text-sm xl:text-base'>Report Status</span>
            <span className='text-[#2D317F] text-xs xl:text-sm'>This Week</span>
          </div>

          {/* Donut chart */}
          <div className="relative h-[130px] xl:h-[150px] w-full">
            <ChartContainer config={pieChartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={38} outerRadius={60}
                    paddingAngle={2} dataKey="value"
                    startAngle={90} endAngle={-270}
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
                    contentStyle={{ borderRadius: 10, border: "none", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", fontSize: 12 }}
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl xl:text-2xl font-extrabold text-[#1a2f6f] leading-none">{total}</span>
              <span className="text-xs text-[#6b86a8] mt-1">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2 xl:gap-3 mt-3">
            {pieData.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
                style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.45 }}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <span className="w-3 h-3 xl:w-3.5 xl:h-3.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="flex-1 text-xs xl:text-sm font-medium text-[#1a2f6f]">{item.name}</span>
                <span className="text-xs xl:text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities + Quick Actions */}
        <div className='flex flex-col gap-2 flex-[1] min-w-0'>

          {/* Recent Activities */}
          <div className='bg-[#E1EBFF] p-3 xl:p-4 rounded-md flex-1'>
            <div className='text-[#2859C5] font-medium text-xs xl:text-sm mb-2 border-b border-b-[#ADCEFF] pb-2 xl:pb-3'>
              Recent Activities
            </div>
            <div className='max-h-[90px] xl:max-h-[110px] overflow-y-auto flex flex-col divide-y divide-[#b8cfe8]'>
              {activities.map((activity) => (
                <div key={activity.id} className='flex items-start gap-2 xl:gap-3 py-2 xl:py-3 first:pt-0 last:pb-0'>
                  <span className={`mt-[3px] w-2 h-2 xl:w-2.5 xl:h-2.5 rounded-full shrink-0 ${activity.color}`} />
                  <span className="text-xs text-[#1a2f6f] leading-snug">{activity.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className='bg-[#E1EBFF] p-3 xl:p-4 rounded-md'>
            <div className='text-[#2859C5] font-medium text-xs xl:text-sm mb-2 xl:mb-3 border-b border-b-[#ADCEFF] pb-2 xl:pb-3'>
              Quick Actions
            </div>
            <div className='grid grid-cols-2 gap-1.5 xl:gap-2'>
              <Button onClick={() => navigate('/admin/users')}
                className="w-full py-3 xl:py-4 bg-[#8FBFFA] border border-[#8FBFFA] text-[#2D317F] text-xs xl:text-sm">
                <Plus className="w-3 h-3 xl:w-4 xl:h-4" />Add User
              </Button>
              <Button onClick={() => navigate('/admin/evaluation')}
                className="w-full py-3 xl:py-4 bg-[#8FBFFA] border border-[#8FBFFA] text-[#2D317F] text-xs xl:text-sm">
                <ClipboardCheck className="w-3 h-3 xl:w-4 xl:h-4" />Evaluation
              </Button>
              <Button onClick={() => navigate('/admin/summarization')}
                className="w-full py-3 xl:py-4 bg-[#8FBFFA] border border-[#8FBFFA] text-[#2D317F] text-xs xl:text-sm">
                <BarChart2 className="w-3 h-3 xl:w-4 xl:h-4" />Summary
              </Button>
              <Button onClick={() => navigate('/admin/audit')}
                className="w-full py-3 xl:py-4 bg-[#8FBFFA] border border-[#8FBFFA] text-[#2D317F] text-xs xl:text-sm">
                <UserCheck className="w-3 h-3 xl:w-4 xl:h-4" />Audit Logs
              </Button>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}