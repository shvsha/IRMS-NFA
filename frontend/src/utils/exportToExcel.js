import XLSXStyle from 'xlsx-js-style'
import ExcelJS   from 'exceljs'
import { saveAs } from 'file-saver'


const MONTH_NAMES = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const FULL_MONTH_NAMES = ['','January','February','March','April','May','June','July','August','September','October','November','December']

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
    return `${month} ${date.getDate()}, ${date.getFullYear()}`
  }
  return String(value)
}

const fmtNum = (val) => {
  const n = parseFloat(val)
  if (val === '' || val == null || isNaN(n)) return ''
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// stockbook only

const BORDER_XS = {
  top:    { style: 'thin', color: { rgb: '8FA3C1' } },
  bottom: { style: 'thin', color: { rgb: '8FA3C1' } },
  left:   { style: 'thin', color: { rgb: '8FA3C1' } },
  right:  { style: 'thin', color: { rgb: '8FA3C1' } },
}
const HEADER_ROW1    = { font: { bold: true, color: { rgb: '0a83f5' }, name: 'Cambria', sz: 12 }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: BORDER_XS }
const HEADER_ROW2    = { font: { bold: true, color: { rgb: 'BB2325' }, name: 'Cambria', sz: 12 }, alignment: { horizontal: 'center', vertical: 'center', wrapText: true }, border: BORDER_XS }
const HEADER_ROW2_RED = HEADER_ROW2
const DATA           = { font: { name: 'Cambria', sz: 12, color: { rgb: '2D317F' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: BORDER_XS }
const DATA_RED       = { font: { name: 'Cambria', sz: 12, color: { rgb: 'BB2325' } }, alignment: { horizontal: 'center', vertical: 'center' }, border: BORDER_XS }
const RED_FIELDS     = new Set(['Moisture_Content', 'Pile_No'])

const COL_WIDTHS_SB = [
  { wch: 10 }, { wch: 10 }, { wch: 30 }, { wch: 15 },
  { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 },
  { wch: 8  }, { wch: 12 }, { wch: 12 }, { wch: 30 },
  { wch: 22 }, { wch: 22 }, { wch: 17 }, { wch: 12 },
  { wch: 12 }, { wch: 12 }, { wch: 8  }, { wch: 12 },
  { wch: 12 }, { wch: 12 }, { wch: 8  }, { wch: 30 },
  { wch: 12 }, { wch: 12 }, { wch: 12 },
]

const EJ_BORDER = {
  top:    { style: 'thin', color: { argb: 'FF8FA3C1' } },
  bottom: { style: 'thin', color: { argb: 'FF8FA3C1' } },
  left:   { style: 'thin', color: { argb: 'FF8FA3C1' } },
  right:  { style: 'thin', color: { argb: 'FF8FA3C1' } },
}

const EJ_FONT_TITLE = { name: 'Cambria', size: 13, bold: true }
const EJ_FONT_SUB   = { name: 'Cambria', size: 11, bold: true }
const EJ_FONT_META  = { name: 'Cambria', size: 10 }
const EJ_FONT_TH    = { name: 'Cambria', size: 10, bold: true }
const EJ_FONT_TD    = { name: 'Cambria', size: 10 }
const EJ_FONT_SIG_NAME  = { name: 'Cambria', size: 10, bold: true, underline: true }
const EJ_FONT_SIG_LABEL = { name: 'Cambria', size: 9 }

const CENTER = { horizontal: 'center', vertical: 'middle', wrapText: true }
const LEFT   = { horizontal: 'left',   vertical: 'middle' }
const RIGHT  = { horizontal: 'right',  vertical: 'middle' }

const FILL_HEADER = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFADCEFF' } }

/* Fetch an image URL */
async function fetchImageBuffer(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return await res.arrayBuffer()
  } catch {
    return null
  }
}

function imageExtension(url) {
  if (!url) return 'png'
  const lower = url.toLowerCase()
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'jpeg'
  if (lower.includes('.png')) return 'png'
  return 'png'
}

/**
 * Add a signature image to an ExcelJS worksheet.
 * 
 *
 * @param {ExcelJS.Workbook} wb
 * @param {ExcelJS.Worksheet} ws
 * @param {ArrayBuffer} buffer   - raw image bytes
 * @param {string} ext           - 'png' | 'jpeg'
 * @param {number} row           - 1-based row where image top should be
 * @param {number} col           - 1-based column (left edge of sig block)
 * @param {number} colSpan       - how many columns the sig block spans
 * @param {number} heightPx      - image height in pixels
 */
function addSigImage(wb, ws, buffer, ext, row, col, colSpan, heightPx = 45) {
  if (!buffer) return
  const imgId = wb.addImage({ buffer, extension: ext })
  ws.addImage(imgId, {
    tl: { col: col - 1,             row: row - 1 },
    br: { col: col - 1 + colSpan,   row: row     },
    editAs: 'oneCell',
  })
}

function buildEJHeader(ws, title, reportData, totalCols) {
  const half = Math.floor(totalCols / 2)

  // Row 1 — NFA title
  ws.mergeCells(1, 1, 1, totalCols)
  const r1 = ws.getCell(1, 1)
  r1.value = 'NATIONAL FOOD AUTHORITY'
  r1.font  = EJ_FONT_TITLE
  r1.alignment = CENTER

  // Row 2 — report title
  ws.mergeCells(2, 1, 2, totalCols)
  const r2 = ws.getCell(2, 1)
  r2.value = title
  r2.font  = EJ_FONT_SUB
  r2.alignment = CENTER

  // Row 3 — date (underlined)
  ws.mergeCells(3, 1, 3, totalCols)
  const r3 = ws.getCell(3, 1)
  r3.value = `Date: ${formatHeaderDate(reportData.date)}`
  r3.font  = { ...EJ_FONT_SUB, underline: true }
  r3.alignment = CENTER

  // Row 4 — spacer
  ws.getRow(4).height = 6

  // Row 5 — Region / Warehouse Name
  ws.mergeCells(5, 1, 5, half)
  ws.getCell(5, 1).value = `Region: ${reportData.region ?? ''}`
  ws.getCell(5, 1).font  = EJ_FONT_META
  ws.getCell(5, 1).alignment = LEFT

  ws.mergeCells(5, half + 1, 5, totalCols)
  ws.getCell(5, half + 1).value = `Warehouse Name: ${reportData.whName ?? ''}`
  ws.getCell(5, half + 1).font  = EJ_FONT_META
  ws.getCell(5, half + 1).alignment = RIGHT

  // Row 6 — Province / Warehouse Address
  ws.mergeCells(6, 1, 6, half)
  ws.getCell(6, 1).value = `Province: ${reportData.province ?? ''}`
  ws.getCell(6, 1).font  = EJ_FONT_META
  ws.getCell(6, 1).alignment = LEFT

  ws.mergeCells(6, half + 1, 6, totalCols)
  ws.getCell(6, half + 1).value = `Warehouse Address: ${reportData.whAddress ?? ''}`
  ws.getCell(6, half + 1).font  = EJ_FONT_META
  ws.getCell(6, half + 1).alignment = RIGHT

  // Row 7 — Accountable Officer / Warehouse Code
  ws.mergeCells(7, 1, 7, half)
  ws.getCell(7, 1).value = `Accountable Officer: ${reportData.officer ?? ''}`
  ws.getCell(7, 1).font  = EJ_FONT_META
  ws.getCell(7, 1).alignment = LEFT

  ws.mergeCells(7, half + 1, 7, totalCols)
  ws.getCell(7, half + 1).value = `Warehouse Code: ${reportData.whCode ?? ''}`
  ws.getCell(7, half + 1).font  = EJ_FONT_META
  ws.getCell(7, half + 1).alignment = RIGHT

  // Row 8 — spacer
  ws.getRow(8).height = 6

  return 9  // next available row
}

/**
 *
 * @param {ExcelJS.Workbook} wb
 * @param {ExcelJS.Worksheet} ws
 * @param {number} startRow  1-based
 * @param {Array}  signatories  [{label, name, role, cols:[c1,c2], buffer, ext}]
 */
async function buildEJSignatories(wb, ws, startRow, signatories) {
  const imgRow  = startRow 
  const lblRow  = startRow + 1
  const nameRow = startRow + 2
  const roleRow = startRow + 3

  // Set image row height to accommodate the signature image
  ws.getRow(imgRow).height = 45

  for (const sig of signatories) {
    const [c1, c2] = sig.cols

    // Merge all 4 rows per column range
    ws.mergeCells(imgRow,  c1, imgRow,  c2)
    ws.mergeCells(lblRow,  c1, lblRow,  c2)
    ws.mergeCells(nameRow, c1, nameRow, c2)
    ws.mergeCells(roleRow, c1, roleRow, c2)

    // Image row — embed signature if available
    if (sig.buffer) {
      addSigImage(wb, ws, sig.buffer, sig.ext, imgRow, c1, c2 - c1 + 1, 45)
    }

    // Label row
    const lblCell  = ws.getCell(lblRow, c1)
    lblCell.value     = sig.label
    lblCell.font      = EJ_FONT_SIG_LABEL
    lblCell.alignment = CENTER

    // Name row
    const nameCell = ws.getCell(nameRow, c1)
    nameCell.value     = sig.name
    nameCell.font      = EJ_FONT_SIG_NAME
    nameCell.alignment = CENTER

    // Role row
    const roleCell = ws.getCell(roleRow, c1)
    roleCell.value     = sig.role
    roleCell.font      = EJ_FONT_SIG_LABEL
    roleCell.alignment = CENTER
  }

  return roleRow + 1
}

// Stockbook export

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
  ws['!cols'] = COL_WIDTHS_SB
  const wb = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(wb, ws, 'Sheet1')
  XLSXStyle.writeFile(wb, `${filename}.xlsx`)
}

export function exportStockbookToExcel(rows, reportId) {
  const ws = {}
  const groupHeaders = [
    { label: 'DATE', span: 2 }, { label: '', span: 13 },
    { label: 'RECEIPTS', span: 4 }, { label: 'ISSUES', span: 4 },
    { label: '', span: 1 }, { label: 'BALANCE', span: 3 },
  ]
  const FIELDS = [
    'year','month','Particulars','Plate_Number','WTS','WSR','WSI',
    'Batch_No','Age','AI_Number','OR_Number','Moisture_Content',
    'Classifier','Transaction','Pile_No',
    'R_Bags','R_GKG','R_NKG','R_Cond',
    'I_Bags','I_GKG','I_NKG','I_Cond',
    'Fillers','B_Bags','B_GKG','B_NKG',
  ]
  const subHeaders = [
    'YEAR','MONTH','PARTICULARS','PLATE #','WTS #','WSR #','WSI #',
    'BATCH NO.','AGE','AI#','OR#','MOISTURE CONTENT','CLASSIFIER','TRANSACTION','PILE NO.',
    'BAGS','GKG','NKG','COND','BAGS','GKG','NKG','COND','FILLERS','BAGS','GKG','NKG',
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
    Object.entries(r).some(([k, v]) => !['B_Bags','B_GKG','B_NKG'].includes(k) && v !== '')
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
  ws['!cols']   = COL_WIDTHS_SB
  ws['!rows']   = [{ hpt: 30 }, { hpt: 20 }]
  const wb = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(wb, ws, 'Stock Book')
  XLSXStyle.writeFile(wb, `stockbook_R-${String(reportId).padStart(3, '0')}.xlsx`)
}

// helper to apply TH style to a cell
function applyTH(cell) {
  cell.font      = EJ_FONT_TH
  cell.alignment = CENTER
  cell.fill      = FILL_HEADER
  cell.border    = EJ_BORDER
}

function applyTD(cell, alignOverride) {
  cell.font      = EJ_FONT_TD
  cell.alignment = alignOverride ?? CENTER
  cell.border    = EJ_BORDER
}

// WSR export (ExcelJS)

export async function exportWSRToExcel(reportData, wsrData) {
  const COLS = 12

  const wb = new ExcelJS.Workbook()
  wb.creator = 'NFA RMS'
  const ws = wb.addWorksheet('WSR')

  // Column widths
  ws.columns = [
    { width: 14 }, { width: 12 }, { width: 18 }, { width: 20 },
    { width: 14 }, { width: 8  }, { width: 8  }, { width: 8  },
    { width: 12 }, { width: 10 }, { width: 12 }, { width: 12 },
  ]

  // Header block (rows 1–8)
  buildEJHeader(ws, 'Statement of Daily Warehouse Receipts', {
    date:      reportData.date,
    region:    reportData.region    ?? '1',
    province:  reportData.province  ?? 'La Union',
    officer:   reportData.officer   ?? '',
    whName:    reportData.whName    ?? 'San Juan GID 2A',
    whAddress: reportData.whAddress ?? 'San Juan, La Union',
    whCode:    reportData.whCode    ?? '',
  }, COLS)

  // Table headers (rows 9–10)
  ws.getRow(9).height  = 28
  ws.getRow(10).height = 30

  // Row 9 group headers
  const grpDefs = [
    { c1: 1,  c2: 1,  label: 'Cereal Type /\nVariety',  sub: false },
    { c1: 2,  c2: 2,  label: 'WSR# /\nWTS#',            sub: false },
    { c1: 3,  c2: 3,  label: 'Nature of\nTransaction',   sub: false },
    { c1: 4,  c2: 5,  label: 'From Whom Received',       sub: true  },
    { c1: 6,  c2: 6,  label: 'Age',                      sub: false },
    { c1: 7,  c2: 7,  label: 'Cond.',                    sub: false },
    { c1: 8,  c2: 8,  label: 'MC',                       sub: false },
    { c1: 9,  c2: 9,  label: 'Truck No.',                sub: false },
    { c1: 10, c2: 12, label: 'Quantity',                  sub: true  },
  ]
  grpDefs.forEach(({ c1, c2, label, sub }) => {
    if (c1 !== c2) ws.mergeCells(9, c1, 9, c2)
    if (!sub)      ws.mergeCells(9, c1, 10, c2)
    const cell = ws.getCell(9, c1)
    cell.value = label
    applyTH(cell)
  })

  // Row 10 sub-headers (only for sub:true groups)
  ;[
    { c: 4, label: 'Name'      },
    { c: 5, label: 'PR/BL/'    },
    { c: 10, label: 'Bags'     },
    { c: 11, label: 'Gross Kg.'},
    { c: 12, label: 'Net Kg.'  },
  ].forEach(({ c, label }) => {
    const cell = ws.getCell(10, c)
    cell.value = label
    applyTH(cell)
  })

  // Data rows (starting row 11)
  const DATA_START_ROW = 11
  const dataLen        = Math.max(wsrData.length, 10)

  for (let i = 0; i < dataLen; i++) {
    const row   = wsrData[i] ?? {}
    const rowNo = DATA_START_ROW + i
    ws.getRow(rowNo).height = 18

    const vals = [
      i < wsrData.length ? (reportData.cerealType ?? '') : '',
      row.WSR_no ?? row.WTS_no  ?? '',
      row.Transaction_ref       ?? '',
      row.Particulars           ?? '',
      '',                                   // PR/BL
      row.Age                   ?? '',
      row.Cond_R                ?? '',
      row.Moisture_Content      ?? '',
      row.Plate_Number          ?? '',
      fmtNum(row.R_Bags),
      fmtNum(row.R_GKG),
      fmtNum(row.R_NKG),
    ]
    vals.forEach((v, ci) => {
      const cell = ws.getCell(rowNo, ci + 1)
      cell.value = v
      applyTD(cell)
    })
  }

  // Signatory block
  const SIGN_ROW = DATA_START_ROW + dataLen + 1

  // Fetch signature images
  const [buf0, buf1, buf2, buf3] = await Promise.all([
    reportData.ws_signature         ? fetchImageBuffer(reportData.ws_signature)          : Promise.resolve(null),
    reportData.asst_bm_signature    ? fetchImageBuffer(reportData.asst_bm_signature)    : Promise.resolve(null),
    reportData.accountant_signature ? fetchImageBuffer(reportData.accountant_signature) : Promise.resolve(null),
    reportData.branch_m_signature   ? fetchImageBuffer(reportData.branch_m_signature)   : Promise.resolve(null),
  ])

  await buildEJSignatories(wb, ws, SIGN_ROW, [
    { label: 'Certified Correct:', name: reportData.certifiedBy  ?? '', role: 'Warehouse Supervisor', cols: [1, 3],   buffer: buf0, ext: imageExtension(reportData.ws_signature) },
    { label: 'Verified Correct:',  name: reportData.verifiedBy1 ?? '', role: 'Asst. Branch Manager', cols: [4, 6],   buffer: buf1, ext: imageExtension(reportData.asst_bm_signature) },
    { label: 'Verified Correct:',  name: reportData.verifiedBy2 ?? '', role: 'Accountant III',        cols: [7, 9],   buffer: buf2, ext: imageExtension(reportData.accountant_signature) },
    { label: 'Noted by:',          name: reportData.notedBy     ?? '', role: 'Branch Manager',        cols: [10, 12], buffer: buf3, ext: imageExtension(reportData.branch_m_signature) },
  ])

  // Write file
  const buffer = await wb.xlsx.writeBuffer()
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `WSR-${reportData.wsrId ?? 'export'}.xlsx`)
}

// WSI export (ExcelJS)

export async function exportWSIToExcel(reportData, wsiData) {
  const COLS = 14

  const wb = new ExcelJS.Workbook()
  wb.creator = 'NFA RMS'
  const ws = wb.addWorksheet('WSI')

  ws.columns = [
    { width: 14 }, { width: 10 }, { width: 10 }, { width: 10 },
    { width: 18 }, { width: 20 }, { width: 14 }, { width: 8  },
    { width: 8  }, { width: 8  }, { width: 12 }, { width: 10 },
    { width: 12 }, { width: 12 },
  ]

  buildEJHeader(ws, 'Statement of Daily Warehouse Issue', {
    date:      reportData.date,
    region:    reportData.region    ?? '1',
    province:  reportData.province  ?? 'La Union',
    officer:   reportData.officer   ?? '',
    whName:    reportData.whName    ?? 'San Juan GID 2A',
    whAddress: reportData.whAddress ?? 'San Juan, La Union',
    whCode:    reportData.whCode    ?? '',
  }, COLS)

  ws.getRow(9).height  = 28
  ws.getRow(10).height = 30

  const grpDefs = [
    { c1: 1,  c2: 1,  label: 'Cereal Type /\nVariety', sub: false },
    { c1: 2,  c2: 2,  label: 'WSI#',                   sub: false },
    { c1: 3,  c2: 3,  label: 'WTS#',                   sub: false },
    { c1: 4,  c2: 4,  label: 'AI#',                    sub: false },
    { c1: 5,  c2: 5,  label: 'Nature of\nTransaction', sub: false },
    { c1: 6,  c2: 7,  label: 'Issued to',              sub: true  },
    { c1: 8,  c2: 8,  label: 'Age',                    sub: false },
    { c1: 9,  c2: 9,  label: 'Cond.',                  sub: false },
    { c1: 10, c2: 10, label: 'MC',                     sub: false },
    { c1: 11, c2: 11, label: 'Truck No.',              sub: false },
    { c1: 12, c2: 14, label: 'Quantity',               sub: true  },
  ]
  grpDefs.forEach(({ c1, c2, label, sub }) => {
    if (c1 !== c2) ws.mergeCells(9, c1, 9, c2)
    if (!sub)      ws.mergeCells(9, c1, 10, c2)
    const cell = ws.getCell(9, c1)
    cell.value = label
    applyTH(cell)
  })

  ;[
    { c: 6,  label: 'Name'           },
    { c: 7,  label: 'OR/BL/\nWSR No.'},
    { c: 12, label: 'Bags'           },
    { c: 13, label: 'Gross Kg.'      },
    { c: 14, label: 'Net Kg.'        },
  ].forEach(({ c, label }) => {
    const cell = ws.getCell(10, c)
    cell.value = label
    applyTH(cell)
  })

  const DATA_START_ROW = 11
  const dataLen        = Math.max(wsiData.length, 10)

  for (let i = 0; i < dataLen; i++) {
    const row   = wsiData[i] ?? {}
    const rowNo = DATA_START_ROW + i
    ws.getRow(rowNo).height = 18

    const vals = [
      i < wsiData.length ? (reportData.cerealType ?? '') : '',
      row.WSI_no             ?? '',
      row.WTS_no             ?? '',
      row.AI_Number          ?? '',
      row.Transaction_ref    ?? '',
      row.Particulars        ?? '',
      '',                                  // OR/BL/WSR No.
      row.Age                ?? '',
      row.Cond_I             ?? '',
      row.Moisture_Content   ?? '',
      row.Plate_Number       ?? '',
      fmtNum(row.I_Bags),
      fmtNum(row.I_GKG),
      fmtNum(row.I_NKG),
    ]
    vals.forEach((v, ci) => {
      const cell = ws.getCell(rowNo, ci + 1)
      cell.value = v
      applyTD(cell)
    })
  }

  const SIGN_ROW = DATA_START_ROW + dataLen + 1

  const [buf0, buf1, buf2, buf3] = await Promise.all([
    reportData.ws_signature         ? fetchImageBuffer(reportData.ws_signature)          : Promise.resolve(null),
    reportData.asst_bm_signature    ? fetchImageBuffer(reportData.asst_bm_signature)    : Promise.resolve(null),
    reportData.accountant_signature ? fetchImageBuffer(reportData.accountant_signature) : Promise.resolve(null),
    reportData.branch_m_signature   ? fetchImageBuffer(reportData.branch_m_signature)   : Promise.resolve(null),
  ])

  await buildEJSignatories(wb, ws, SIGN_ROW, [
    { label: 'Certified Correct:', name: reportData.certifiedBy  ?? '', role: 'Warehouse Supervisor', cols: [1, 4],   buffer: buf0, ext: imageExtension(reportData.ws_signature) },
    { label: 'Verified Correct:',  name: reportData.verifiedBy1 ?? '', role: 'Asst. Branch Manager', cols: [5, 7],   buffer: buf1, ext: imageExtension(reportData.asst_bm_signature) },
    { label: 'Verified Correct:',  name: reportData.verifiedBy2 ?? '', role: 'Accountant III',        cols: [8, 10],  buffer: buf2, ext: imageExtension(reportData.accountant_signature) },
    { label: 'Noted by:',          name: reportData.notedBy     ?? '', role: 'Branch Manager',        cols: [11, 14], buffer: buf3, ext: imageExtension(reportData.branch_m_signature) },
  ])

  const buffer = await wb.xlsx.writeBuffer()
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `WSI-${reportData.wsiId ?? 'export'}.xlsx`)
}

// Summary export

export async function exportSummaryToExcel(summary) {
  const COLS = 10

  const wb = new ExcelJS.Workbook()
  wb.creator = 'NFA RMS'
  const ws = wb.addWorksheet('Summary')

  ws.columns = [
    { width: 16 }, { width: 10 }, { width: 12 }, { width: 12 },
    { width: 12 }, { width: 12 }, { width: 12 }, { width: 12 },
    { width: 16 }, { width: 16 },
  ]

  buildEJHeader(ws, 'Statement of Daily Warehouse Receipt, Issues, and Balances', {
    date:      summary.date_covered ?? '',
    region:    '1',
    province:  'La Union',
    officer:   summary.Name      ?? '',
    whName:    'San Juan GID 2A',
    whAddress: 'San Juan, La Union',
    whCode:    summary.WHCode    ?? '',
  }, COLS)

  // Table headers rows 9–10
  ws.getRow(9).height  = 20
  ws.getRow(10).height = 18

  // Row 9 group headers
  ws.mergeCells(9, 1, 10, 1); const hCereal = ws.getCell(9, 1); hCereal.value = 'Cereal Type'; applyTH(hCereal)
  ws.mergeCells(9, 2, 10, 2); const hCond   = ws.getCell(9, 2); hCond.value   = 'Cond.';       applyTH(hCond)
  ws.mergeCells(9, 3, 9, 4);  const hBB     = ws.getCell(9, 3); hBB.value     = 'Beginning Balance'; applyTH(hBB)
  ws.mergeCells(9, 5, 9, 6);  const hRec    = ws.getCell(9, 5); hRec.value    = 'Receipts';    applyTH(hRec)
  ws.mergeCells(9, 7, 9, 8);  const hIss    = ws.getCell(9, 7); hIss.value    = 'Issues';      applyTH(hIss)
  ws.mergeCells(9, 9, 9, 10); const hEB     = ws.getCell(9, 9); hEB.value     = 'Ending Balance'; applyTH(hEB)

  ;[3,4,5,6,7,8,9,10].forEach((c, i) => {
    const cell = ws.getCell(10, c)
    cell.value = ['Bags','Nkg','Bags','Nkg','Bags','Nkg','Bags','Nkg'][i]
    applyTH(cell)
  })

  // Data rows
  const dataRows   = summary.rows ?? []
  const MIN_ROWS   = 8
  const DATA_START = 11

  for (let i = 0; i < Math.max(dataRows.length, MIN_ROWS); i++) {
    const row   = dataRows[i] ?? {}
    const rowNo = DATA_START + i
    ws.getRow(rowNo).height = 18

    const vals = [
      row.cerealType ?? '',
      row.condition  ?? '',
      fmtNum(row.beginBags),
      fmtNum(row.beginNkg),
      fmtNum(row.R_Bags),
      fmtNum(row.R_NKG),
      fmtNum(row.I_Bags),
      fmtNum(row.I_NKG),
      fmtNum(row.endBags),
      fmtNum(row.endNkg),
    ]
    vals.forEach((v, ci) => {
      const cell = ws.getCell(rowNo, ci + 1)
      cell.value = v
      applyTD(cell)
    })
  }

  // Totals row
  const totalRow = DATA_START + Math.max(dataRows.length, MIN_ROWS)
  ws.getRow(totalRow).height = 18
  ws.mergeCells(totalRow, 1, totalRow, 2)
  const totCell = ws.getCell(totalRow, 1)
  totCell.value = 'TOTAL'
  totCell.font  = { ...EJ_FONT_TD, bold: true }
  totCell.alignment = CENTER
  totCell.border    = EJ_BORDER

  const sum = (key) => dataRows.reduce((s, r) => s + parseFloat(r[key] || 0), 0)
  ;[
    fmtNum(sum('beginBags')), fmtNum(sum('beginNkg')),
    fmtNum(sum('R_Bags')),    fmtNum(sum('R_NKG')),
    fmtNum(sum('I_Bags')),    fmtNum(sum('I_NKG')),
    fmtNum(sum('endBags')),   fmtNum(sum('endNkg')),
  ].forEach((v, i) => {
    const cell = ws.getCell(totalRow, i + 3)
    cell.value = v
    cell.font  = { ...EJ_FONT_TD, bold: true }
    cell.alignment = CENTER
    cell.border    = EJ_BORDER
  })

  // Signatories
  const SIGN_ROW = totalRow + 2

  // Summary = fully approved → all 3 signature URLs always present
  const [buf0, buf1, buf2, buf3] = await Promise.all([
    summary.WS_signature         ? fetchImageBuffer(summary.WS_signature)         : Promise.resolve(null),
    summary.Assist_BM_signature  ? fetchImageBuffer(summary.Assist_BM_signature)  : Promise.resolve(null),
    summary.Account_II_signature ? fetchImageBuffer(summary.Account_II_signature) : Promise.resolve(null),
    summary.Branch_M_signature   ? fetchImageBuffer(summary.Branch_M_signature)   : Promise.resolve(null),
  ])

  await buildEJSignatories(wb, ws, SIGN_ROW, [
    { label: 'Certified Correct:', name: summary.Name       ?? '', role: 'Warehouse Supervisor', cols: [1, 3],  buffer: buf0, ext: imageExtension(summary.WS_signature) },
    { label: 'Verified Correct:',  name: summary.Assist_BM  ?? '', role: 'Asst. Branch Manager', cols: [4, 6],  buffer: buf1, ext: imageExtension(summary.Assist_BM_signature) },
    { label: 'Verified Correct:',  name: summary.Account_II ?? '', role: 'Accountant III',        cols: [7, 8],  buffer: buf2, ext: imageExtension(summary.Account_II_signature) },
    { label: 'Noted by:',          name: summary.Branch_M   ?? '', role: 'Branch Manager',        cols: [9, 10], buffer: buf3, ext: imageExtension(summary.Branch_M_signature) },
  ])

  const buffer = await wb.xlsx.writeBuffer()
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `SUMMARY-${summary.summary_id ?? 'export'}.xlsx`)
}