import XLSXStyle from 'xlsx-js-style'

const MONTH_NAMES = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const FULL_MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function formatValue(header, value) {
  if (header === 'month') {
    const num = Number(value)
    if (num >= 1 && num <= 12) return MONTH_NAMES[num]
  }
  return value ?? ''
}

function formatHeaderDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isNaN(date.getTime())) {
    const month = FULL_MONTH_NAMES[date.getMonth() + 1]
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month} ${day}, ${year}`
  }
  return String(value)
}

const fmtNum = (val) => {
  const n = parseFloat(val)
  if (val === '' || val == null || isNaN(n)) return ''
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const BORDER = {
  top:    { style: 'thin', color: { rgb: '8FA3C1' } },
  bottom: { style: 'thin', color: { rgb: '8FA3C1' } },
  left:   { style: 'thin', color: { rgb: '8FA3C1' } },
  right:  { style: 'thin', color: { rgb: '8FA3C1' } },
}

const HEADER_ROW1 = {
  font:      { bold: true, color: { rgb: '0a83f5' }, name: 'Cambria', sz: 12 },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border:    BORDER,
}

const HEADER_ROW2 = {
  font:      { bold: true, color: { rgb: 'BB2325' }, name: 'Cambria', sz: 12 },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border:    BORDER,
}

const HEADER_ROW2_RED = {
  font:      { bold: true, color: { rgb: 'BB2325' }, name: 'Cambria', sz: 12 },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border:    BORDER,
}

const DATA = {
  font:      { name: 'Cambria', sz: 12, color: { rgb: '2D317F' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border:    BORDER,
}

const DATA_RED = {
  font:      { name: 'Cambria', sz: 12, color: { rgb: 'BB2325' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border:    BORDER,
}

const RED_FIELDS = new Set(['Moisture_Content', 'Pile_No'])

const COL_WIDTHS = [
  { wch: 10  }, { wch: 10  }, { wch: 30  }, { wch: 15 },
  { wch: 12  }, { wch: 12  }, { wch: 12  }, { wch: 18 },
  { wch: 8   }, { wch: 12  }, { wch: 12  }, { wch: 30 },
  { wch: 22  }, { wch: 22  }, { wch: 17  }, { wch: 12 },
  { wch: 12  }, { wch: 12  }, { wch: 8   }, { wch: 12 },
  { wch: 12  }, { wch: 12  }, { wch: 8   }, { wch: 30 },
  { wch: 12  }, { wch: 12  }, { wch: 12  },
]

// Shared wsr and wsi report style
const RPT_TITLE = {
  font:      { bold: true, name: 'Cambria', sz: 13, color: { rgb: '000000' } },
  alignment: { horizontal: 'center', vertical: 'center' },
}
const RPT_SUBTITLE = {
  font:      { bold: true, name: 'Cambria', sz: 11, color: { rgb: '000000' } },
  alignment: { horizontal: 'center', vertical: 'center' },
}
const RPT_HEADER_DATE = {
  font:      { bold: true, name: 'Cambria', sz: 11, color: { rgb: '000000' }, underline: true },
  alignment: { horizontal: 'center', vertical: 'center' },
}
const RPT_META = {
  font:      { name: 'Cambria', sz: 10, color: { rgb: '000000' } },
  alignment: { horizontal: 'left', vertical: 'center' },
}
const RPT_META_RIGHT = {
  font:      { name: 'Cambria', sz: 10, color: { rgb: '000000' } },
  alignment: { horizontal: 'right', vertical: 'center' },
}
const RPT_META_VALUE = {
  font:      { name: 'Cambria', sz: 10, color: { rgb: '000000' } },
  alignment: { horizontal: 'left', vertical: 'center' },
}
const RPT_META_RIGHT_VALUE = {
  font:      { name: 'Cambria', sz: 10, color: { rgb: '000000' } },
  alignment: { horizontal: 'right', vertical: 'center' },
}
const RPT_TH = {
  font:      { bold: true, name: 'Cambria', sz: 10, color: { rgb: '000000' } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border:    BORDER,
  fill:      { fgColor: { rgb: 'ADCEFF' }, patternType: 'solid' },
}
const RPT_TD = {
  font:      { name: 'Cambria', sz: 10, color: { rgb: '000000' } },
  alignment: { horizontal: 'center', vertical: 'center' },
  border:    BORDER,
}
const RPT_SIG = {
  font:      { bold: true, name: 'Cambria', sz: 10, color: { rgb: '000000' } },
  alignment: { horizontal: 'center', vertical: 'center' },
}
const RPT_SIG_NAME = {
  font:      { bold: true, name: 'Cambria', sz: 10, color: { rgb: '000000' }, underline: true },
  alignment: { horizontal: 'center', vertical: 'center' },
}
const RPT_SIG_LABEL = {
  font:      { name: 'Cambria', sz: 9, color: { rgb: '000000' } },
  alignment: { horizontal: 'center', vertical: 'center' },
}

// ── Shared builder helpers ────────────────────────────────────
function makeSheetBuilder(COLS) {
  const ws = {}
  const merges = []

  const set = (r, c, v, style) => {
    ws[XLSXStyle.utils.encode_cell({ r, c })] = { v: v ?? '', s: style }
  }

  const merge = (r1, c1, r2, c2) => {
    merges.push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } })
    for (let r = r1; r <= r2; r++)
      for (let c = c1; c <= c2; c++)
        if (!(r === r1 && c === c1))
          ws[XLSXStyle.utils.encode_cell({ r, c })] = { v: '', s: RPT_TITLE }
  }

  const fillRow = (r, style) => {
    for (let c = 0; c < COLS; c++) set(r, c, '', style)
  }

  // Rows 0-7: title block + meta
  const buildHeader = (title, subtitle, reportData) => {
    set(0, 0, 'NATIONAL FOOD AUTHORITY', RPT_TITLE);  merge(0, 0, 0, COLS - 1)
    set(1, 0, title, RPT_SUBTITLE);                    merge(1, 0, 1, COLS - 1)
    set(2, 0, `Date: ${formatHeaderDate(reportData.date)}`, RPT_HEADER_DATE); merge(2, 0, 2, COLS - 1)
    fillRow(3, RPT_META)

    const half = Math.floor(COLS / 2)

    const metaLeft  = (r, label, value) => {
      set(r, 0, `${label} ${value}`, RPT_META_VALUE)
      merge(r, 0, r, half - 1)
    }
    const metaRight = (r, label, value) => {
      set(r, half, `${label} ${value}`, RPT_META_RIGHT_VALUE)
      merge(r, half, r, COLS - 1)
    }

    metaLeft(4,  'Region:', `${reportData.region   ?? ''}`)
    metaRight(4, 'Warehouse Name:', `${reportData.whName ?? ''}`)
    metaLeft(5,  'Province:', `${reportData.province ?? ''}`)
    metaRight(5, 'Warehouse Address:', `${reportData.whAddress ?? ''}`)
    metaLeft(6,  'Accountable Officer:', `${reportData.officer ?? ''}`)
    metaRight(6, 'Warehouse Code:', `${reportData.whCode ?? ''}`)
    fillRow(7, RPT_META)
  }

  // Signatories block
  const buildSignatories = (startRow, signatories) => {
    signatories.forEach(({ label, name, role, cols: [c1, c2] }) => {
      set(startRow,     c1, label, RPT_SIG_LABEL); merge(startRow,     c1, startRow,     c2)
      set(startRow + 1, c1, name,  RPT_SIG_NAME);  merge(startRow + 1, c1, startRow + 1, c2)
      set(startRow + 2, c1, role,  RPT_SIG_LABEL); merge(startRow + 2, c1, startRow + 2, c2)
    })
  }

  return { ws, merges, set, merge, fillRow, buildHeader, buildSignatories }
}

// Generic flat table export
export function exportToExcel(data, filename = 'export') {
  if (!data || data.length === 0) return

  const headers = Object.keys(data[0])
  const ws = {}
  const range = { s: { r: 0, c: 0 }, e: { r: data.length, c: headers.length - 1 } }

  headers.forEach((h, c) => {
    ws[XLSXStyle.utils.encode_cell({ r: 0, c })] = { v: h, s: HEADER_ROW1 }
  })

  data.forEach((row, r) => {
    headers.forEach((h, c) => {
      ws[XLSXStyle.utils.encode_cell({ r: r + 1, c })] = { v: formatValue(h, row[h]), s: DATA }
    })
  })

  ws['!ref']  = XLSXStyle.utils.encode_range(range)
  ws['!cols'] = COL_WIDTHS

  const wb = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSXStyle.writeFile(wb, `${filename}.xlsx`)
}

// Stockbook expor
export function exportStockbookToExcel(rows, reportId) {
  const ws = {}

  const groupHeaders = [
    { label: 'DATE',     span: 2  },
    { label: '',         span: 13 },
    { label: 'RECEIPTS', span: 4  },
    { label: 'ISSUES',   span: 4  },
    { label: '',         span: 1  },
    { label: 'BALANCE',  span: 3  },
  ]

  const FIELDS = [
    'year', 'month', 'Particulars', 'Plate_Number', 'WTS', 'WSR', 'WSI',
    'Batch_No', 'Age', 'AI_Number', 'OR_Number', 'Moisture_Content',
    'Classifier', 'Transaction', 'Pile_No',
    'R_Bags', 'R_GKG', 'R_NKG', 'R_Cond',
    'I_Bags', 'I_GKG', 'I_NKG', 'I_Cond',
    'Fillers', 'B_Bags', 'B_GKG', 'B_NKG',
  ]

  const subHeaders = [
    'YEAR', 'MONTH',
    'PARTICULARS', 'PLATE #', 'WTS #', 'WSR #', 'WSI #',
    'BATCH NO.', 'AGE', 'AI#', 'OR#', 'MOISTURE CONTENT', 'CLASSIFIER', 'TRANSACTION', 'PILE NO.',
    'BAGS', 'GKG', 'NKG', 'COND',
    'BAGS', 'GKG', 'NKG', 'COND',
    'FILLERS',
    'BAGS', 'GKG', 'NKG',
  ]

  let col = 0
  const merges = []
  groupHeaders.forEach(({ label, span }) => {
    ws[XLSXStyle.utils.encode_cell({ r: 0, c: col })] = { v: label, s: HEADER_ROW1 }
    if (span > 1) {
      merges.push({ s: { r: 0, c: col }, e: { r: 0, c: col + span - 1 } })
      for (let i = 1; i < span; i++)
        ws[XLSXStyle.utils.encode_cell({ r: 0, c: col + i })] = { v: '', s: HEADER_ROW1 }
    }
    col += span
  })

  subHeaders.forEach((label, c) => {
    ws[XLSXStyle.utils.encode_cell({ r: 1, c })] = {
      v: label,
      s: RED_FIELDS.has(FIELDS[c]) ? HEADER_ROW2_RED : HEADER_ROW2,
    }
  })

  const dataRows = rows.filter(r =>
    Object.entries(r).some(([k, v]) => !['B_Bags', 'B_GKG', 'B_NKG'].includes(k) && v !== '')
  )

  dataRows.forEach((row, r) => {
    FIELDS.forEach((field, c) => {
      ws[XLSXStyle.utils.encode_cell({ r: r + 2, c })] = {
        v: formatValue(field, row[field]),
        s: RED_FIELDS.has(field) ? DATA_RED : DATA,
      }
    })
  })

  const totalRows = dataRows.length + 2
  ws['!ref']    = XLSXStyle.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: totalRows, c: FIELDS.length - 1 } })
  ws['!merges'] = merges
  ws['!cols']   = COL_WIDTHS
  ws['!rows']   = [{ hpt: 30 }, { hpt: 20 }]

  const wb = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(wb, ws, 'Stock Book')
  XLSXStyle.writeFile(wb, `stockbook_R-${String(reportId).padStart(3, '0')}.xlsx`)
}

// Statement of Daily Warehouse Receipts 
export function exportWSRToExcel(reportData, wsrData) {
  const COLS = 12
  const { ws, merges, set, merge, fillRow, buildHeader, buildSignatories } = makeSheetBuilder(COLS)

  buildHeader('Statement of Daily Warehouse Receipts', null, reportData)

  // Row 8: group headers (spanning rows 8–9 for non-sub-headers)
  const grpHeaders = [
    { c1: 0,  c2: 0,  label: 'Cereal Type /\nVariety',  subHeader: false },
    { c1: 1,  c2: 1,  label: 'WSR# /\nWTS#',            subHeader: false },
    { c1: 2,  c2: 2,  label: 'Nature of\nTransaction',   subHeader: false },
    { c1: 3,  c2: 4,  label: 'From Whom Received',       subHeader: true  },
    { c1: 5,  c2: 5,  label: 'Age',                      subHeader: false },
    { c1: 6,  c2: 6,  label: 'Cond.',                    subHeader: false },
    { c1: 7,  c2: 7,  label: 'MC',                       subHeader: false },
    { c1: 8,  c2: 8,  label: 'Truck No.',                subHeader: false },
    { c1: 9,  c2: 11, label: 'Quantity',                 subHeader: true  },
  ]
  grpHeaders.forEach(({ c1, c2, label, subHeader }) => {
    set(8, c1, label, RPT_TH)
    if (c1 !== c2) merge(8, c1, 8, c2)
    if (!subHeader) merge(8, c1, 9, c2)   // span down to row 9
  })

  // Row 9: sub-headers
  set(9, 3,  'Name',       RPT_TH)
  set(9, 4,  'PR/BL/',     RPT_TH)
  set(9, 9,  'Bags',       RPT_TH)
  set(9, 10, 'Gross Kg.',  RPT_TH)
  set(9, 11, 'Net Kg.',    RPT_TH)

  // Data rows — using exact API field names from transaction object
  const DATA_START = 10
  const dataLen    = Math.max(wsrData.length, 10)

  for (let i = 0; i < dataLen; i++) {
    const row = wsrData[i] ?? {}
    const r   = DATA_START + i
    const cerealType = i < wsrData.length ? reportData.cerealType ?? '' : ''
    set(r, 0,  cerealType, RPT_TD)  // from stock (not on tx)
    set(r, 1,  row.WSR_no ?? row.WTS_no  ?? '', RPT_TD)  // WSR#/WTS#
    set(r, 2,  row.Transaction_ref       ?? '', RPT_TD)  // Nature of Transaction
    set(r, 3,  row.Particulars           ?? '', RPT_TD)  // From Whom (Name)
    set(r, 4,  row.OR_Number             ?? '', RPT_TD)  // PR/BL/
    set(r, 5,  row.Age                   ?? '', RPT_TD)  // Age
    set(r, 6,  row.Cond_R                ?? '', RPT_TD)  // Cond.
    set(r, 7,  row.Moisture_Content      ?? '', RPT_TD)  // MC
    set(r, 8,  row.Plate_Number          ?? '', RPT_TD)  // Truck No.
    set(r, 9,  fmtNum(row.R_Bags)        ?? '', RPT_TD)  // Bags
    set(r, 10, fmtNum(row.R_GKG)         ?? '', RPT_TD)  // Gross Kg.
    set(r, 11, fmtNum(row.R_NKG)         ?? '', RPT_TD)  // Net Kg.
  }

  const SIGN_ROW = DATA_START + dataLen + 1
  buildSignatories(SIGN_ROW, [
    { label: 'Certified Correct:', name: reportData.certifiedBy ?? '', role: 'Warehouse Supervisor', cols: [0,  2]  },
    { label: 'Verified Correct:',  name: reportData.verifiedBy1 ?? '', role: 'Asst. Branch Manager', cols: [3,  5]  },
    { label: 'Verified Correct:',  name: reportData.verifiedBy2 ?? '', role: 'Accountant III',        cols: [6,  8]  },
    { label: 'Noted by:',          name: reportData.notedBy     ?? '', role: 'Branch Manager',       cols: [9,  11] },
  ])

  ws['!ref']    = XLSXStyle.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: SIGN_ROW + 3, c: COLS - 1 } })
  ws['!merges'] = merges
  ws['!cols']   = [
    { wch: 14 }, { wch: 12 }, { wch: 18 }, { wch: 20 },
    { wch: 14 }, { wch: 8  }, { wch: 8  }, { wch: 8  },
    { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
  ]
  ws['!rows'] = [
    { hpt: 18 }, { hpt: 18 }, { hpt: 18 }, { hpt: 10 },
    { hpt: 15 }, { hpt: 15 }, { hpt: 15 }, { hpt: 10 },
    { hpt: 28 }, { hpt: 30 },
  ]

  const wb = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(wb, ws, 'WSR')
  XLSXStyle.writeFile(wb, `WSR-${reportData.wsrId ?? 'export'}.xlsx`)
}

// ── Statement of Daily Warehouse Issue ────────────────────────
export function exportWSIToExcel(reportData, wsiData) {
  const COLS = 14
  const { ws, merges, set, merge, fillRow, buildHeader, buildSignatories } = makeSheetBuilder(COLS)

  buildHeader('Statement of Daily Warehouse Issue', null, reportData)

  // Row 8: group headers
  const grpHeaders = [
    { c1: 0,  c2: 0,  label: 'Cereal Type /\nVariety',  subHeader: false },
    { c1: 1,  c2: 1,  label: 'WSI#',                    subHeader: false },
    { c1: 2,  c2: 2,  label: 'WTS#',                    subHeader: false },
    { c1: 3,  c2: 3,  label: 'AI#',                     subHeader: false },
    { c1: 4,  c2: 4,  label: 'Nature of\nTransaction',  subHeader: false },
    { c1: 5,  c2: 6,  label: 'Issued to',               subHeader: true  },
    { c1: 7,  c2: 7,  label: 'Age',                     subHeader: false },
    { c1: 8,  c2: 8,  label: 'Cond.',                   subHeader: false },
    { c1: 9,  c2: 9,  label: 'MC',                      subHeader: false },
    { c1: 10, c2: 10, label: 'Truck No.',                subHeader: false },
    { c1: 11, c2: 13, label: 'Quantity',                 subHeader: true  },
  ]
  grpHeaders.forEach(({ c1, c2, label, subHeader }) => {
    set(8, c1, label, RPT_TH)
    if (c1 !== c2) merge(8, c1, 8, c2)
    if (!subHeader) merge(8, c1, 9, c2)
  })

  // Row 9: sub-headers
  set(9, 5,  'Name',            RPT_TH)
  set(9, 6,  'OR/BL/\nWSR No.', RPT_TH)
  set(9, 11, 'Bags',            RPT_TH)
  set(9, 12, 'Gross Kg.',       RPT_TH)
  set(9, 13, 'Net Kg.',         RPT_TH)

  // Data rows — exact API field names
  const DATA_START = 10
  const dataLen    = Math.max(wsiData.length, 10)

  for (let i = 0; i < dataLen; i++) {
    const row = wsiData[i] ?? {}
    const r   = DATA_START + i
    const cerealType = i < wsiData.length ? reportData.cerealType ?? '' : ''
    set(r, 0,  cerealType, RPT_TD)  // from stock
    set(r, 1,  row.WSI_no             ?? '', RPT_TD)  // WSI#
    set(r, 2,  row.WTS_no             ?? '', RPT_TD)  // WTS#
    set(r, 3,  row.AI_Number          ?? '', RPT_TD)  // AI#
    set(r, 4,  row.Transaction_ref    ?? '', RPT_TD)  // Nature of Transaction
    set(r, 5,  row.Particulars        ?? '', RPT_TD)  // Issued to (Name)
    set(r, 6,  row.OR_Number          ?? '', RPT_TD)  // OR/BL/WSR No.
    set(r, 7,  row.Age                ?? '', RPT_TD)  // Age
    set(r, 8,  row.Cond_I             ?? '', RPT_TD)  // Cond.
    set(r, 9,  row.Moisture_Content   ?? '', RPT_TD)  // MC
    set(r, 10, row.Plate_Number       ?? '', RPT_TD)  // Truck No.
    set(r, 11, fmtNum(row.I_Bags)     ?? '', RPT_TD)  // Bags
    set(r, 12, fmtNum(row.I_GKG)      ?? '', RPT_TD)  // Gross Kg.
    set(r, 13, fmtNum(row.I_NKG)      ?? '', RPT_TD)  // Net Kg.
  }

  const SIGN_ROW = DATA_START + dataLen + 1
  buildSignatories(SIGN_ROW, [
    { label: 'Certified Correct:', name: reportData.certifiedBy ?? '', role: 'Warehouse Supervisor', cols: [0,  3]  },
    { label: 'Verified Correct:',  name: reportData.verifiedBy1 ?? '', role: 'Asst. Branch Manager', cols: [4,  6]  },
    { label: 'Verified Correct:',  name: reportData.verifiedBy2 ?? '', role: 'Accountant III',        cols: [7,  9]  },
    { label: 'Noted by:',          name: reportData.notedBy     ?? '', role: 'Branch Manager',       cols: [10, 13] },
  ])

  ws['!ref']    = XLSXStyle.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: SIGN_ROW + 3, c: COLS - 1 } })
  ws['!merges'] = merges
  ws['!cols']   = [
    { wch: 14 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 8  },
    { wch: 8  }, { wch: 8  }, { wch: 12 }, { wch: 10 },
    { wch: 12 }, { wch: 12 },
  ]
  ws['!rows'] = [
    { hpt: 18 }, { hpt: 18 }, { hpt: 18 }, { hpt: 10 },
    { hpt: 15 }, { hpt: 15 }, { hpt: 15 }, { hpt: 10 },
    { hpt: 28 }, { hpt: 30 },
  ]

  const wb = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(wb, ws, 'WSI')
  XLSXStyle.writeFile(wb, `WSI-${reportData.wsiId ?? 'export'}.xlsx`)
}

export function exportSummaryToExcel(summary) {
  const COLS = 10
  const { ws, merges, set, merge, fillRow, buildHeader, buildSignatories } = makeSheetBuilder(COLS)

  buildHeader('Statement of Daily Warehouse Receipt, Issues, and Balances', null, {
    date:      summary.date_covered ?? summary.date ?? '',
    region:    '1',
    province:  'La Union',
    officer:   summary.Name     ?? '',
    whName:    'San Juan GID 2A',
    whAddress: 'San Juan, La Union',
    whCode:    summary.WHCode   ?? '',
  })

  // Table headers
  const setHeader = (r, c, label, span, rowSpan = false) => {
    set(r, c, label, RPT_TH)
    if (span > 1) {
      merge(r, c, r, c + span - 1)
      for (let cc = c + 1; cc <= c + span - 1; cc++) set(r, cc, '', RPT_TH)
    }
    if (rowSpan) {
      merge(r, c, r + 1, c)
      set(r + 1, c, '', RPT_TH)
    }
  }

  setHeader(8, 0, 'Cereal Type', 1, true)
  setHeader(8, 1, 'Cond.',       1, true)
  setHeader(8, 2, 'Beginning Balance', 2)
  setHeader(8, 4, 'Receipts',         2)
  setHeader(8, 6, 'Issues',           2)
  setHeader(8, 8, 'Ending Balance',   2)

  const subLabels = ['Bags', 'Nkg', 'Bags', 'Nkg', 'Bags', 'Nkg', 'Bags', 'Nkg']
  subLabels.forEach((label, i) => set(9, 2 + i, label, RPT_TH))

  const dataRows = summary.rows ?? []
  const MIN_ROWS = 8
  const DATA_START = 10

  for (let i = 0; i < Math.max(dataRows.length, MIN_ROWS); i++) {
    const row = dataRows[i] ?? {}
    const r   = DATA_START + i
    set(r, 0, row.cerealType  ?? '', RPT_TD)
    set(r, 1, row.condition   ?? '', RPT_TD)
    set(r, 2, fmtNum(row.beginBags), RPT_TD)
    set(r, 3, fmtNum(row.beginNkg),  RPT_TD)
    set(r, 4, fmtNum(row.R_Bags),    RPT_TD)
    set(r, 5, fmtNum(row.R_NKG),     RPT_TD)
    set(r, 6, fmtNum(row.I_Bags),    RPT_TD)
    set(r, 7, fmtNum(row.I_NKG),     RPT_TD)
    set(r, 8, fmtNum(row.endBags),   RPT_TD)
    set(r, 9, fmtNum(row.endNkg),    RPT_TD)
  }

  const totalRow = DATA_START + Math.max(dataRows.length, MIN_ROWS)
  const sum = (key) => dataRows.reduce((s, r) => s + parseFloat(r[key] || 0), 0)

  set(totalRow, 0, 'TOTAL', RPT_TD)
  merge(totalRow, 0, totalRow, 1)
  set(totalRow, 1, '',                      RPT_TD)
  set(totalRow, 2, fmtNum(sum('beginBags')), RPT_TD)
  set(totalRow, 3, fmtNum(sum('beginNkg')),  RPT_TD)
  set(totalRow, 4, fmtNum(sum('R_Bags')),    RPT_TD)
  set(totalRow, 5, fmtNum(sum('R_NKG')),     RPT_TD)
  set(totalRow, 6, fmtNum(sum('I_Bags')),    RPT_TD)
  set(totalRow, 7, fmtNum(sum('I_NKG')),     RPT_TD)
  set(totalRow, 8, fmtNum(sum('endBags')),   RPT_TD)
  set(totalRow, 9, fmtNum(sum('endNkg')),    RPT_TD)

  const SIGN_ROW = totalRow + 2
  buildSignatories(SIGN_ROW, [
    { label: 'Certified Correct:', name: summary.Name       ?? '', role: 'Warehouse Supervisor',  cols: [0, 2] },
    { label: 'Verified Correct:',  name: summary.Assist_BM  ?? '', role: 'Asst. Branch Manager',  cols: [3, 5] },
    { label: 'Verified Correct:',  name: summary.Account_II ?? '', role: 'Accountant III',         cols: [6, 7] },
    { label: 'Noted by:',          name: summary.Branch_M   ?? '', role: 'Branch Manager',        cols: [8, 9] },
  ])

  ws['!ref']    = XLSXStyle.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: SIGN_ROW + 2, c: COLS - 1 } })
  ws['!merges'] = merges
  ws['!cols']   = [
    { wch: 16 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 16 }, { wch: 16 },
  ]
  ws['!rows'] = Array(SIGN_ROW + 3).fill(null).map((_, i) => ({ hpt: i === 2 ? 20 : 18 }))

  const wb = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(wb, ws, 'Summary')
  XLSXStyle.writeFile(wb, `SUMMARY-${summary.summary_id ?? 'export'}.xlsx`)
}