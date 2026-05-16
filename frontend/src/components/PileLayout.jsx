import React, { useState, useEffect, useMemo } from 'react'

import Header from '@/components/Header'
import api from '@/api/axios'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// for notif
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { getNotifRoute } from '@/utils/getNotifRoute'
import { useUnreadCount } from '@/hooks/useUnreadCount'

// shadcn components
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import { Dialog, DialogContent } from '@/components/ui/dialog'

// date filter components
import { MonthlyFilter } from '@/components/filters/MonthlyFilter'

// icons
import { FaRegCalendarAlt } from 'react-icons/fa'

const MONTHS_LIST = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const LEFT_COL  = [1, 3, 5]
const RIGHT_COL = [2, 4, 6]

function avg(arr) {
  if (!arr.length) return 0
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function buildPileMapFromTransactions(transactions, cerealType) {
  let txns = transactions
  if (cerealType !== 'ALL') {
    txns = txns.filter(t => t.cereal_type === cerealType)
  }

  const grouped = {}
  for (const t of txns) {
    const pileNo = t.Pile_No
    if (!pileNo) continue
    const num = parseInt(pileNo)
    if (isNaN(num)) continue

    if (!grouped[num]) grouped[num] = []
    grouped[num].push(t)
  }

  const result = {}
  for (const [no, txnList] of Object.entries(grouped)) {
    const ages      = txnList.map(t => parseFloat(t.Age)).filter(v => !isNaN(v))
    const moistures = txnList.map(t => parseFloat(t.Moisture_Content)).filter(v => !isNaN(v))
    const conds     = txnList.map(t => t.Cond_R || t.Cond_I).filter(Boolean)

    const rBags = txnList.reduce((s, t) => s + (parseFloat(t.R_Bags) || 0), 0)
    const rNkg  = txnList.reduce((s, t) => s + (parseFloat(t.R_NKG)  || 0), 0)
    const iBags = txnList.reduce((s, t) => s + (parseFloat(t.I_Bags) || 0), 0)
    const iNkg  = txnList.reduce((s, t) => s + (parseFloat(t.I_NKG)  || 0), 0)

    const netBags = rBags - iBags
    const netNkg  = rNkg  - iNkg

    const cerealTypes = [...new Set(txnList.map(t => t.cereal_type).filter(Boolean))]

    result[no] = {
      pile_no:      Number(no),
      cereal_type:  cerealTypes.length === 1 ? cerealTypes[0] : cerealTypes.join('/'),
      bags:         netBags,
      nkg:          netNkg,
      age:          avg(ages),
      moisture:     avg(moistures),
      condition:    conds.length ? conds[conds.length - 1] : '—',
    }
  }
  return result
}

function getPileStatus(pile) {
  if (!pile) return 'empty'
  if (pile.age > 12 || pile.moisture > 14 || pile.moisture < 12) return 'alert'
  if (pile.age > 8  || pile.moisture > 13.5)                     return 'watch'
  return 'good'
}

function getWarnings(pile) {
  const w = []
  if (pile.age > 12)             w.push({ level: 'danger',  msg: `Age ${pile.age.toFixed(1)} mo — too old, prioritize release.` })
  else if (pile.age > 8)         w.push({ level: 'warning', msg: `Age ${pile.age.toFixed(1)} mo — approaching storage limit.` })
  if (pile.moisture > 14)        w.push({ level: 'danger',  msg: `Moisture ${pile.moisture.toFixed(1)}% too high — risk of mold/spoilage.` })
  else if (pile.moisture > 13.5) w.push({ level: 'warning', msg: `Moisture ${pile.moisture.toFixed(1)}% slightly elevated — monitor.` })
  if (pile.moisture < 12)        w.push({ level: 'warning', msg: `Moisture ${pile.moisture.toFixed(1)}% too low — risk of grain cracking.` })
  return w
}

const COND_LABEL = { GQ: 'Good Quality', FQ: 'Fair Quality', PQ: 'Poor Quality' }

function generateInsight(pile) {
  const condLabel = COND_LABEL[pile.condition] || pile.condition
  const parts = []

  // Age assessment
  if (pile.age > 12) {
    parts.push(`Pile ${pile.pile_no} has been in storage for ${pile.age.toFixed(1)} months, which exceeds the 12-month safe storage limit and requires immediate attention.`)
  } else if (pile.age > 8) {
    parts.push(`Pile ${pile.pile_no} has been in storage for ${pile.age.toFixed(1)} months, approaching the 12-month storage limit and should be prioritized for release.`)
  } else {
    parts.push(`Pile ${pile.pile_no} has been in storage for ${pile.age.toFixed(1)} months, which is within the acceptable storage window.`)
  }

  // Moisture assessment
  if (pile.moisture > 14) {
    parts.push(`Moisture content is critically high at ${pile.moisture.toFixed(1)}%, posing an immediate risk of mold growth and spoilage.`)
  } else if (pile.moisture > 13.5) {
    parts.push(`Moisture content at ${pile.moisture.toFixed(1)}% is slightly above the recommended range and should be closely monitored.`)
  } else if (pile.moisture < 12) {
    parts.push(`Moisture content is low at ${pile.moisture.toFixed(1)}%, which may cause grain cracking and quality degradation.`)
  } else {
    parts.push(`Moisture content at ${pile.moisture.toFixed(1)}% is within the acceptable 12–14% range.`)
  }

  // Condition and volume
  parts.push(`The pile holds ${pile.bags.toLocaleString()} bags (${pile.nkg.toLocaleString()} kg) of ${pile.cereal_type}, currently rated ${condLabel}.`)

  // Overall summary
  const status = getPileStatus(pile)
  if (status === 'alert') {
    parts.push('Immediate action is required to prevent further quality loss or stock wastage.')
  } else if (status === 'watch') {
    parts.push('Continue monitoring this pile closely and schedule for release in the near term.')
  } else {
    parts.push('This pile is in good standing and requires only routine monitoring.')
  }

  return parts.join(' ')
}

function generateRecommendations(pile) {
  const recs = []

  // Age-based recommendation
  if (pile.age > 12) {
    recs.push('Coordinate with the distribution team to schedule an immediate release or transfer of this stock, as it has exceeded the maximum recommended storage period.')
  } else if (pile.age > 8) {
    recs.push('Prioritize this pile in the next issuance cycle to ensure it is released before reaching the 12-month storage limit.')
  } else {
    recs.push('Maintain current storage practices and reassess during the next scheduled inspection.')
  }

  // Moisture-based recommendation
  if (pile.moisture > 14) {
    recs.push('Activate warehouse ventilation or aeration systems immediately and conduct a physical inspection to identify any signs of mold, clumping, or spoilage.')
  } else if (pile.moisture > 13.5) {
    recs.push('Increase monitoring frequency to at least twice weekly and consider running ventilation to reduce moisture levels to below 13.5%.')
  } else if (pile.moisture < 12) {
    recs.push('Check for excessive drying or heat exposure and consider adjusting storage conditions to prevent further moisture loss and grain cracking.')
  } else {
    recs.push('Continue regular moisture checks on a weekly basis to ensure levels remain within the 12–14% acceptable range.')
  }

  // Condition-based recommendation
  if (pile.condition === 'PQ') {
    recs.push('Flag this pile for quality review and evaluate whether the stock is still suitable for distribution or should be downgraded and segregated from other stocks.')
  } else if (pile.condition === 'FQ') {
    recs.push('Document the current condition and ensure this pile is inspected in the next quarterly quality assessment to track any further degradation.')
  } else {
    recs.push('Document current quality rating and maintain standard inspection records to support traceability and future audit requirements.')
  }

  return recs.map((r, i) => `${i + 1}. ${r}`).join('\n')
}

// Data Row
function DataRow({ label, value, danger, warning }) {
  return (
    <div className="flex justify-between items-center leading-snug">
      <span className="text-[10px] text-gray-400 font-medium">{label}</span>
      <span className={`text-[10px] font-bold font-mono ${danger ? 'text-red-600' : warning ? 'text-amber-600' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  )
}

// Pile Card
function PileCard({ pileNo, pile, onClick }) {
  const status = getPileStatus(pile)

  const statusStyles = {
    alert: 'bg-red-50 border-red-300',
    watch: 'bg-yellow-50 border-yellow-300',
    good:  'bg-green-50 border-green-300',
    empty: 'bg-gray-50 border-gray-200',
  }
  const topBarStyles = {
    alert: 'bg-red-400',
    watch: 'bg-yellow-400',
    good:  'bg-green-400',
    empty: 'bg-gray-300',
  }

  return (
    <div
      onClick={pile ? onClick : undefined}
      className={`
        border-[1.5px] rounded-lg overflow-hidden flex flex-col min-h-[130px]
        shadow-sm transition-all duration-150
        ${statusStyles[status]}
        ${pile ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : 'cursor-default'}
      `}
    >
      <div className={`h-1.5 flex-shrink-0 ${topBarStyles[status]}`} />
      <div className="px-2.5 py-2 flex-1 flex flex-col">
        <div className={`flex justify-between items-center ${pile ? 'mb-1.5' : ''}`}>
          <span className="font-extrabold text-[11px] text-green-700 font-mono tracking-wide">
            PILE {pileNo}
          </span>
          {pile && status !== 'good' && (
            <span className={`text-[9px] font-bold tracking-wide px-1.5 py-px rounded-full ${
              status === 'alert' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-amber-700'
            }`}>
              {status === 'alert' ? '⚠ ALERT' : '⚠ WATCH'}
            </span>
          )}
        </div>

        {pile ? (
          <div className="flex flex-col gap-0.5">
            <DataRow label="Bags" value={pile.bags.toLocaleString(undefined, {maximumFractionDigits: 0})} />
            <DataRow label="NKG"  value={`${pile.nkg.toLocaleString(undefined, {maximumFractionDigits: 0})} kg`} />
            <DataRow label="Var." value={pile.cereal_type} />
            <DataRow
              label="Age"
              value={pile.age > 0 ? `${pile.age.toFixed(2)} mo` : '—'}
              danger={pile.age > 12}
              warning={pile.age > 8 && pile.age <= 12}
            />
            <DataRow
              label="MC"
              value={pile.moisture > 0 ? `${pile.moisture.toFixed(2)}%` : '—'}
              danger={pile.moisture > 14 || (pile.moisture > 0 && pile.moisture < 12)}
            />
            <DataRow label="Cond" value={pile.condition} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center py-11.5">
            <span className="text-[10px] text-gray-300 italic">No data</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Insight Modal
function InsightModal({ pile, onClose }) {
  const warnings = getWarnings(pile)
  const insight = generateInsight(pile)
  const recommendations = generateRecommendations(pile)

  const stats = [
    { label: 'Total Bags', value: pile.bags.toLocaleString(undefined, { maximumFractionDigits: 0 }), color: null },
    { label: 'Total NKG',  value: `${(pile.nkg / 1000).toFixed(1)}T`, color: null },
    { label: 'Condition',  value: pile.condition, color: null },
    { label: 'Avg Age',    value: pile.age > 0 ? `${pile.age.toFixed(2)} mo` : '—',
      color: pile.age > 12 ? 'text-red-600' : pile.age > 8 ? 'text-amber-600' : 'text-green-600' },
    { label: 'Avg MC',     value: pile.moisture > 0 ? `${pile.moisture.toFixed(2)}%` : '—',
      color: pile.moisture > 14 || pile.moisture < 12 ? 'text-red-600' : 'text-green-600' },
    { label: 'Variety',    value: pile.cereal_type, color: null },
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[620px] p-0 overflow-hidden rounded-[14px] border-none [&>button]:hidden">
        {/* Header */}
        <div className="bg-[#3E7A43] px-5 py-4 flex justify-between items-center">
          <div>
            <div className="text-green-200 text-[9px] font-bold tracking-[2px] uppercase">Pile Analysis</div>
            <div className="text-white text-lg font-extrabold font-mono mt-0.5">
              PILE {pile.pile_no} — {pile.cereal_type}
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/15 text-white w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-[13px] hover:bg-white/25 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 max-h-[75vh] overflow-y-auto -mt-4">
          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 mb-3.5">
            {stats.map(s => (
              <div key={s.label} className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-center">
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">{s.label}</div>
                <div className={`text-sm font-extrabold font-mono mt-0.5 ${s.color || 'text-gray-900'}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Warnings */}
          {warnings.map((w, i) => (
            <div key={i} className={`flex gap-2 items-start px-2.5 py-[7px] rounded-lg mb-2 ${
              w.level === 'danger' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <span className={`text-[11px] font-medium ${w.level === 'danger' ? 'text-red-800' : 'text-amber-800'}`}>
                {w.msg}
              </span>
            </div>
          ))}

          {/* Analysis */}
          <div className="bg-slate-50 rounded-[10px] p-4 border border-slate-200 mb-3">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="font-bold text-[13px] text-slate-800">Analysis</span>
            </div>
            <p className="text-xs text-justify text-gray-700 leading-relaxed">{insight}</p>
          </div>

          {/* Recommendations */}
          <div className="bg-green-50 rounded-[10px] p-4 border border-green-200">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span className="font-bold text-[13px] text-green-900">Recommendations</span>
            </div>
            <p className="text-xs text-justify text-green-900 leading-relaxed whitespace-pre-line">{recommendations}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function PileLayout() {
  const pileLayoutRef = React.useRef(null)
  const user        = useCurrentUser()
  const notifRoute  = getNotifRoute(user)
  const userName    = user ? `${user.fname} ${user.lname}` : 'User'
  const unreadCount = useUnreadCount()

  const now = new Date()
  const [cerealType,         setCerealType]         = useState('ALL')
  const [selectedMonth,      setSelectedMonth]      = useState(MONTHS_LIST[now.getMonth()])
  const [monthlyYear,        setMonthlyYear]        = useState(now.getFullYear())
  const [showCalendarFilter, setShowCalendarFilter] = useState(false)
  const [selectedPile,       setSelectedPile]       = useState(null)

  const [transactions, setTransactions] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const monthIndex = MONTHS_LIST.indexOf(selectedMonth) + 1

        const summaryRes = await api.get('/reports/summary/')
        const allSummaries = summaryRes.data

        const matchedSummaries = allSummaries.filter(s => {
          if (!s.date_covered) return false
          const d = new Date(s.date_covered)
          return d.getFullYear() === monthlyYear && (d.getMonth() + 1) === monthIndex
        })

        const stockbookIds = new Set()
        for (const s of matchedSummaries) {
          for (const sbId of (s.stockbooks ?? [])) {
            stockbookIds.add(sbId)
          }
        }

        if (stockbookIds.size === 0) {
          setTransactions([])
          setLoading(false)
          return
        }

        const txnPromises = [...stockbookIds].map(id =>
          api.get(`/reports/transactions/?stockbook=${id}`).then(r => r.data)
        )
        const txnArrays = await Promise.all(txnPromises)

        const sbPromises = [...stockbookIds].map(id =>
          api.get(`/reports/stocks/upd/${id}/`).then(r => ({ id, data: r.data }))
        )
        const sbDetails = await Promise.all(sbPromises)
        const sbCerealMap = {}
        for (const { id, data } of sbDetails) {
          sbCerealMap[id] = data.CerealType
        }

        const allTxns = txnArrays.flat().map(t => ({
          ...t,
          cereal_type: sbCerealMap[t.stockbook] ?? '—',
        }))

        setTransactions(allTxns)
      } catch (err) {
        console.error('Failed to fetch pile data:', err)
        setError('Failed to load pile data.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedMonth, monthlyYear])

  const availableCerealTypes = useMemo(() => {
    const types = [...new Set(transactions.map(t => t.cereal_type).filter(c => c && c !== '—'))]
    return types.sort()
  }, [transactions])

  useEffect(() => {
    if (cerealType !== 'ALL' && !availableCerealTypes.includes(cerealType)) {
      setCerealType('ALL')
    }
  }, [availableCerealTypes])

  const pileMap = useMemo(
    () => buildPileMapFromTransactions(transactions, cerealType),
    [transactions, cerealType]
  )

  const handleExportPDF = async () => {
    const element = pileLayoutRef.current
    if (!element) return

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
      const sheets = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]')
      sheets.forEach(sheet => {
        if (sheet.textContent?.includes('oklch')) {
          sheet.remove()
        }
      })
    },
  })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const pageWidth  = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth   = pageWidth - 20
    const imgHeight  = (canvas.height * imgWidth) / canvas.width

    // Add title
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(11)
    pdf.text('NATIONAL FOOD AUTHORITY', pageWidth / 2, 12, { align: 'center' })
    pdf.setFontSize(9)
    pdf.text('WAREHOUSE STOCK PILING LAY-OUT OF SAN JUAN GID 1-A WAREHOUSE', pageWidth / 2, 17, { align: 'center' })
    pdf.text(`AS OF ${selectedMonth.toUpperCase()} ${monthlyYear}`, pageWidth / 2, 22, { align: 'center' })

    pdf.addImage(imgData, 'PNG', 10, 26, imgWidth, Math.min(imgHeight, pageHeight - 36))

    pdf.save(`PILE-LAYOUT-${selectedMonth}-${monthlyYear}.pdf`)
  }

  return (
    <>
      <Header
        pageTitle="Pile Layout"
        notifTo={notifRoute}
        userName={userName}
        unreadCount={unreadCount}
      />

      <div className="bg-[#F5F9F9] mx-4 my-4 !min-h-[650px] h-[calc(100vh-120px)] border border-black/10 rounded-lg shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] flex flex-col overflow-auto">

        {/* Filter bar */}
        <div className="px-3 py-3 mt-3">
          <div className="flex items-center gap-3 flex-wrap">

            <Select value={cerealType} onValueChange={setCerealType}>
              <SelectTrigger className="py-5 border-[#2D317F] bg-white text-[#2D317F] shadow-[0_6px_4px_-4px_rgba(0,0,0,0.2)] w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="p-2 text-[#2D317F]" value="ALL">All Cereal Type</SelectItem>
                {availableCerealTypes.map(t => (
                  <SelectItem key={t} className="p-2 text-[#2D317F]" value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center justify-center rounded-md text-[#072560] hover:bg-[#d5e3f0] transition ease-in h-10 w-12 shadow-[0_6px_6px_-2px_rgba(0,0,0,0.2)]">
                  <FaRegCalendarAlt color='#072560' size={20} />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" sideOffset={12} className="z-40 w-80 overflow-visible rounded border-0 bg-[#E6EEF6] p-0 shadow-lg">
                <div className="absolute -top-2 left-4 h-4 w-4 rotate-45 bg-[#2D317F]" />
                <div className="bg-[#2D317F] rounded-t pl-4 py-2">
                  <p className="text-white font-semibold text-base">Date</p>
                </div>
                <div className="px-5 py-3 pb-6">
                  <p className="mb-2 text-sm font-medium text-[#2D317F]">Select month and year</p>
                  <FieldGroup>
                    <Field>
                      <FieldLabel className="font-medium text-[#2D317F]">Month</FieldLabel>
                      <button
                        type="button"
                        onClick={() => setShowCalendarFilter(p => !p)}
                        className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-none"
                      >
                        <span className="text-[#2D317F]">{selectedMonth} {monthlyYear}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                    </Field>
                  </FieldGroup>
                </div>
                {showCalendarFilter && (
                  <div className="absolute left-5 top-44 z-50 mt-2">
                    <MonthlyFilter
                      selectedMonth={selectedMonth}
                      year={monthlyYear}
                      onYearChange={y => setMonthlyYear(y)}
                      onMonthChange={m => { setSelectedMonth(m); setShowCalendarFilter(false) }}
                    />
                  </div>
                )}
              </PopoverContent>
            </Popover>

            <span className="text-xl font-semibold text-[#2D317F] ml-1">
              {selectedMonth} {monthlyYear}
            </span>

            <div className="ml-auto">
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center gap-[5px] rounded-full border border-[#BB2325] px-[14px] py-[6px] text-[13px] font-semibold text-[#BB2325] transition-colors hover:bg-[#BB2325] hover:text-white">
                ↓ Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Map area */}
        <div ref={pileLayoutRef} className="flex-1 px-3 pb-4 flex flex-col gap-3 overflow-auto">
          <div ref={pileLayoutRef} className="bg-white rounded-lg border border-black/10 shadow-[0_6px_4px_-4px_rgba(0,0,0,0.1)] flex flex-col flex-1 p-4">

            {loading ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-3 text-[#2D317F]">
                <div className="w-8 h-8 border-4 border-[#2D317F] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Loading pile layout...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center flex-1 text-gray-400 text-sm">{error}</div>
            ) : (
              <div className="grid grid-cols-2 gap-3 flex-1">
                <div className="flex flex-col gap-3">
                  {LEFT_COL.map(n => (
                    <PileCard
                      key={n}
                      pileNo={n}
                      pile={pileMap[n] || null}
                      onClick={() => setSelectedPile(pileMap[n])}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  {RIGHT_COL.map(n => (
                    <PileCard
                      key={n}
                      pileNo={n}
                      pile={pileMap[n] || null}
                      onClick={() => setSelectedPile(pileMap[n])}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="bg-white rounded-lg border border-black/10 px-4 py-2 flex flex-wrap gap-4 items-center">
            {[
              { color: 'bg-green-300 border-black/8',  label: 'Good'  },
              { color: 'bg-yellow-300 border-black/8', label: 'Watch' },
              { color: 'bg-red-300 border-black/8',    label: 'Alert' },
              { color: 'bg-gray-200 border-black/8',   label: 'Empty' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={`w-[26px] h-[13px] rounded-[3px] border ${item.color}`} />
                <span className="text-[11px] text-gray-500">{item.label}</span>
              </div>
            ))}
            <span className="ml-auto text-[10px] text-gray-400 italic">
              Click any pile with data for insights
            </span>
          </div>
        </div>
      </div>

      {selectedPile && (
        <InsightModal pile={selectedPile} onClose={() => setSelectedPile(null)} />
      )}
    </>
  )
}