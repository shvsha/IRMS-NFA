// react
import { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header'

// react icons
import { FaRegCalendarAlt } from "react-icons/fa";

// api
import api from '@/api/axios'

// utils
import { getActivityColor } from '@/utils/activityUtils'

// notif
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getNotifRoute } from '@/utils/Import & Export/getNotifRoute';
import { useUnreadCount } from '@/hooks/useUnreadCount'

// filter components
import { WeeklyFilter } from '../../components/filters/WeeklyFilter'
import { MonthlyFilter } from '../../components/filters/MonthlyFilter'

// shadcn components
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// charts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart"

const months = ["January","February","March","April","May","June",
                 "July","August","September","October","November","December"]

const barChartConfig = {
  receipts: { label: "Statements of Receipts", color: "#2859C5" },
  issues:   { label: "Statements of Issues",   color: "#0B3B66" },
}
const pieChartConfig = {
  Approved: { label: "Approved", color: "#3E7A43" },
  Pending:  { label: "Pending",  color: "#AE9C0F" },
  Rejected: { label: "Rejected", color: "#BB2325" },
}

const knownCereals = ['PD1350', 'WD1G50']

function StatCard({ label, value, accentColor, textColor, loading }) {
  return (
    <Card className='rounded-md pt-0 flex-1 bg-[#E1EBFF] shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]'>
      <CardHeader className='p-0'>
        <div className='h-3 p-0 rounded-t-md' style={{ backgroundColor: accentColor }} />
      </CardHeader>
      <CardContent className='px-3 xl:px-4 py-1.5 xl:py-2'>
        <p className='text-xs xl:text-sm font-medium' style={{ color: accentColor }}>{label}</p>
        <div
          className='mt-1 xl:mt-1.5 ml-4 xl:ml-6 2xl:ml-10 text-2xl xl:text-3xl 2xl:text-4xl font-medium'
          style={{ color: textColor ?? accentColor }}
        >
          {loading ? (
            <div className="w-10 h-8 bg-blue-200 animate-pulse rounded" />
          ) : value}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const user        = useCurrentUser()
  const notifRoute  = getNotifRoute(user)
  const userName    = user ? `${user.fname} ${user.lname}` : 'User'
  const unreadCount = useUnreadCount()

  // data state
  const [stats,       setStats]       = useState({ total: 0, approved: 0, pending: 0, rejected: 0 })
  const [pieData,     setPieData]     = useState([])
  const [barData,     setBarData]     = useState([])
  const [activities,  setActivities]  = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  // pie chart UI state
  const [activeIndex, setActiveIndex] = useState(null)

  // filter state
  const [filterState, setFilterState] = useState({
    cerealType:         "All Cereal Type",
    rangeDate:          "Weekly",
    showCalendarFilter: false,
    filterParams:       null,
    pendingWeek:        { year: new Date().getFullYear(), month: new Date().getMonth(), week: 1 },
    pendingMonth:       { year: new Date().getFullYear(), month: "January" },
  })

  const setFilter = (patch) => setFilterState(prev => ({ ...prev, ...patch }))

  const {
    cerealType,
    rangeDate,
    showCalendarFilter,
    filterParams,
    pendingWeek,
    pendingMonth,
  } = filterState

  const weekDropdownRef  = useRef(null)
  const monthDropdownRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true)
      try {
        const params = {}
        if (filterParams) {
          params.year  = filterParams.year
          params.month = filterParams.month
          if (filterParams.week !== undefined) {
            params.week = filterParams.week
          }
        }

        const [wsrRes, wsiRes, auditRes] = await Promise.all([
          api.get('/reports/wsr-reports/', { params }),
          api.get('/reports/wsi-reports/', { params }),
          api.get('/audit/logs/'),
        ])

        const allReports = [...wsrRes.data, ...wsiRes.data]

        const total    = allReports.length
        const approved = allReports.filter(r => r.Evaluation === 'Approved' || r.Evaluation === 'Archive').length
        const pending  = allReports.filter(r => r.Evaluation === 'Pending').length
        const rejected = allReports.filter(r => r.Evaluation === 'Rejected').length
        setStats({ total, approved, pending, rejected })

        setPieData([
          { name: 'Approved', value: approved, color: '#3E7A43' },
          { name: 'Pending',  value: pending,  color: '#AE9C0F' },
          { name: 'Rejected', value: rejected, color: '#BB2325' },
        ])

        const bar = knownCereals.map(cereal => ({
          warehouse: cereal,
          receipts: wsrRes.data.filter(r =>
            (r.stockbook_cereal === cereal || r.stockbook_cereal === 'Mixed Cereal') &&
            (r.Evaluation === 'Approved' || r.Evaluation === 'Archive')
          ).length,
          issues: wsiRes.data.filter(r =>
            (r.stockbook_cereal === cereal || r.stockbook_cereal === 'Mixed Cereal') &&
            (r.Evaluation === 'Approved' || r.Evaluation === 'Archive')
          ).length,
        }))

        setBarData(bar)

        const logs = auditRes.data.slice(0, 15)
        setActivities(logs)

      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
  }, [filterParams])

  const total = pieData.reduce((sum, d) => sum + d.value, 0)

  const handleWeekNavPrev = () => {
    const p = pendingWeek
    if (p.month === 0) setFilter({ pendingWeek: { ...p, month: 11, year: p.year - 1 } })
    else               setFilter({ pendingWeek: { ...p, month: p.month - 1 } })
  }
  const handleWeekNavNext = () => {
    const p = pendingWeek
    if (p.month === 11) setFilter({ pendingWeek: { ...p, month: 0, year: p.year + 1 } })
    else                setFilter({ pendingWeek: { ...p, month: p.month + 1 } })
  }

  return (
    <>
      <Header
        pageTitle="Dashboard"
        notifTo={notifRoute}
        userName={userName}
        unreadCount={unreadCount}
      />

      <div className='flex flex-col mx-4 my-4 gap-3 !min-h-[650px]'>

        <div className='flex justify-between items-center shrink-0'>
          <p className='font-bold text-xl xl:text-2xl 2xl:text-2xl text-[#2D317F] m-0'>
            Welcome, <span>{userName}!</span>
          </p>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="bg-white px-4 py-4 xl:px-5 xl:py-5">
                <FaRegCalendarAlt size={18} className="xl:hidden" />
                <FaRegCalendarAlt size={20} className="hidden xl:block" />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              align="end" sideOffset={12}
              className="p-0 bg-[#E6EEF6] w-72 xl:w-80 rounded-lg shadow-lg border-0 overflow-visible z-40"
            >
              <div className="absolute -top-2 right-4 w-4 h-4 bg-[#2D317F] rotate-45" />
              <div className="h-8 bg-[#2D317F] rounded-t-lg flex items-center justify-between px-4">
                <p className="text-white font-medium text-sm xl:text-base">Date</p>
                {filterParams && (
                  <button
                    onClick={() => setFilter({ filterParams: null, showCalendarFilter: false })}
                    className="text-xs text-red-400 underline hover:text-red-100"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="px-4 xl:px-5 py-1 pb-7 xl:pb-8">
                <p className="text-[#2D317F] font-medium mb-1 text-xs xl:text-sm">Select range type and date</p>
                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-[#2D317F] font-medium">Range</FieldLabel>
                    <Select
                      value={rangeDate}
                      onValueChange={(v) => setFilter({ rangeDate: v, showCalendarFilter: false })}
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
                  {rangeDate === "Weekly" && (
                    <Field>
                      <FieldLabel className="text-[#2D317F] font-medium">Week</FieldLabel>
                      <div ref={weekDropdownRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setFilter({ showCalendarFilter: !showCalendarFilter })}
                          className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-none"
                        >
                          <span>Week {filterParams?.week ?? pendingWeek.week}</span>
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
                        <button
                          type="button"
                          onClick={() => setFilter({ showCalendarFilter: !showCalendarFilter })}
                          className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-none"
                        >
                          <span>{filterParams?.month ? months[filterParams.month - 1] : pendingMonth.month}</span>
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
                      selectedWeek={pendingWeek.week}
                      year={pendingWeek.year}
                      month={pendingWeek.month}
                      onPrevMonth={handleWeekNavPrev}
                      onNextMonth={handleWeekNavNext}
                      onMonthChange={(m) => setFilter({ pendingWeek: { ...pendingWeek, month: m } })}
                      onYearChange={(y)  => setFilter({ pendingWeek: { ...pendingWeek, year: y } })}
                      onWeekSelect={(week) => setFilter({
                        filterParams:       { year: pendingWeek.year, month: pendingWeek.month + 1, week },
                        pendingWeek:        { ...pendingWeek, week },
                        showCalendarFilter: false,
                      })}
                    />
                  ) : (
                    <MonthlyFilter
                      selectedMonth={pendingMonth.month}
                      year={pendingMonth.year}
                      onYearChange={(y) => setFilter({ pendingMonth: { ...pendingMonth, year: y } })}
                      onMonthChange={(month) => setFilter({
                        filterParams:       { year: pendingMonth.year, month: months.indexOf(month) + 1 },
                        pendingMonth:       { ...pendingMonth, month },
                        showCalendarFilter: false,
                      })}
                    />
                  )}
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Stat cards */}
        <div className='grid grid-cols-2 xl:grid-cols-4 gap-2 xl:gap-3 shrink-0'>
          <StatCard label="Total Reports"  value={stats.total}    accentColor="#2D317F" textColor="#2D317F" loading={dataLoading} />
          <StatCard label="Approved"       value={stats.approved} accentColor="#418447"                    loading={dataLoading} />
          <StatCard label="Pending Review" value={stats.pending}  accentColor="#AE9C0F"                    loading={dataLoading} />
          <StatCard label="Rejected"       value={stats.rejected} accentColor="#BB2325"                    loading={dataLoading} />
        </div>

        {/* Charts row */}
        <div className='flex flex-col xl:flex-row gap-2 xl:gap-2.5 flex-1 min-h-0'>

          {/* Bar chart */}
          <div className='bg-[#E1EBFF] rounded-lg flex-[2] p-3 xl:p-4 min-w-0 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]'>
            <div className='flex justify-between items-center border-b border-b-[#ADCEFF] pb-3 mb-2'>
              <p className='font-bold text-sm xl:text-base text-[#2D317F]'>Report Overview</p>
              <Select value={cerealType} onValueChange={(v) => setFilter({ cerealType: v })}>
                <SelectTrigger className='border bg-transparent border-[#0B3B66] px-2 xl:px-3 text-[#0B3B66] text-xs xl:text-sm max-w-[130px] xl:max-w-[170px]'>
                  {cerealType}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className='p-2 text-[#0B3B66]' value="All Cereal Type">All Cereal Type</SelectItem>
                  <SelectItem className='p-2 text-[#0B3B66]' value="WD1G50">Palay</SelectItem>
                  <SelectItem className='p-2 text-[#0B3B66]' value="PD1350">Rice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto w-full">
              <div className='min-w-[400px]'>
                {dataLoading ? (
                  <div className="h-40 xl:h-85 flex items-center justify-center gap-5">
                    <div className="w-8 h-8 border-4 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
                    <p className='text-[#2D317F]'>Loading Bar graph...</p>
                  </div>
                ) : (
                  <ChartContainer config={barChartConfig} className="h-[340px] w-full mt-7">
                    <BarChart
                      data={cerealType === 'All Cereal Type' ? barData : barData.filter(b => b.warehouse === cerealType)}
                      barCategoryGap="40%" barGap={6}
                      margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
                    >
                      <CartesianGrid vertical={false} stroke="#0B3B66" strokeDasharray="0" strokeWidth={0.1} />
                      <XAxis dataKey="warehouse" axisLine={false} tickLine={false} tick={{ fill: "#1A2F6F", fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 11 }} width={28} tickCount={5} allowDecimals={false} />
                      <Bar barSize={50} dataKey="receipts" fill="var(--color-receipts)" radius={[4, 4, 0, 0]} />
                      <Bar barSize={50} dataKey="issues"   fill="var(--color-issues)"   radius={[4, 4, 0, 0]} />
                      <ChartLegend verticalAlign="bottom" content={<ChartLegendContent className="pt-2" />} />
                    </BarChart>
                  </ChartContainer>
                )}
              </div>
            </div>
          </div>

          {/* Pie chart */}
          <div className='bg-[#E1EBFF] rounded-lg flex-1 p-3 xl:p-4 flex flex-col min-w-0 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]'>
            <div className='flex justify-between items-center mb-2 border-b border-b-[#ADCEFF] pb-3'>
              <span className='text-[#2D317F] font-bold text-sm xl:text-base'>Report Status</span>
            </div>
            {dataLoading ? (
              <div className="flex-1 flex items-center justify-center gap-5">
                <div className="w-8 h-8 border-4 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
                <p className='text-[#2D317F]'>Loading Pie chart...</p>
              </div>
            ) : (
              <>
                <div className="relative w-full h-[160px] xl:h-[275px]">
                  <ChartContainer config={pieChartConfig} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData} cx="50%" cy="50%"
                          innerRadius={38} outerRadius={60}
                          paddingAngle={2} dataKey="value"
                          startAngle={90} endAngle={-270} stroke="none"
                          onMouseEnter={(_, index) => setActiveIndex(index)}
                          onMouseLeave={() => setActiveIndex(null)}
                        >
                          {pieData.map((entry, index) => (
                            <Cell
                              key={entry.name} fill={entry.color}
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
              </>
            )}
          </div>

          {/* Recent Activities */}
          <div className='flex flex-col gap-2 flex-[1] min-w-0 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)]'>
            <div className='bg-[#E1EBFF] p-3 xl:p-4 rounded-lg flex-1 flex flex-col'>
              <div className='text-[#2D317F] font-bold text-sm xl:text-base mb-2 border-b border-b-[#ADCEFF] pb-2 xl:pb-3 shrink-0'>
                Recent Activities
              </div>
              {dataLoading ? (
                <div className="flex-1 flex items-center justify-center gap-5">
                  <div className="w-6 h-6 border-4 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
                  <p className='text-[#2D317F] text-sm'>Loading Recent activities...</p>
                </div>
              ) : (
                <div className='overflow-y-auto flex flex-col divide-y divide-[#b8cfe8] max-h-[330px] xl:max-h-[380px]'>
                  {activities.length === 0 ? (
                    <p className="text-xs text-gray-400 py-3">No recent activity.</p>
                  ) : activities.map((log) => (
                    <div key={log.Audit_id} className='flex items-start gap-2 xl:gap-3 py-2 xl:py-2.5 first:pt-0 last:pb-0'>
                      <span className={`mt-[3px] w-2 h-2 xl:w-2.5 xl:h-2.5 rounded-full shrink-0 ${getActivityColor(log.Action)}`} />
                      <div className="flex flex-col">
                        <span className="text-xs text-[#1a2f6f] leading-snug">{log.Action}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">
                          {log.Name && log.Name !== '-' ? `${log.Name} · ` : ''}{log.Date_audited}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}