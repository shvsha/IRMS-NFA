import jsPDF from 'jspdf'

// Color palette
const C = {

  greenBg:  [245, 255, 248],  
  yellowBg: [255, 254, 245],  
  redBg:    [255, 247, 247],  
  grayBg:   [252, 252, 253],

  greenBorder: [134, 239, 172],  
  yellowBorder:[253, 224, 71],   
  redBorder:   [252, 165, 165],  
  grayBorder:  [229, 231, 235],  

  greenBar:    [74,  222, 128],
  yellowBar:   [250, 204, 21],    
  redBar:      [248, 113, 113],  
  grayBar:     [209, 213, 219],  

  green:       [134, 239, 172], 
  yellow:      [253, 224, 71],   
  red:         [252, 165, 165],  
  gray:        [229, 231, 235], 

  greenBadge:  [22,  163, 74],
  yellowBadge: [161, 98,  7],
  redBadge:    [220, 38,  38],
  grayBadge:   [107, 114, 128],

  navy:        [29,  49,  127],
  white:       [255, 255, 255],
  offWhite:    [245, 249, 249],
  darkText:    [30,  30,  30],
  mutedText:   [107, 114, 128],
}


function getPileStatus(pile) {
  if (!pile) return 'empty'
  if (pile.age > 12 || pile.moisture > 14 || pile.moisture < 12) return 'alert'
  if (pile.age > 8  || pile.moisture > 13.5)                     return 'watch'
  return 'good'
}

function statusColors(status) {
  if (status === 'alert') return {
    bg: C.redBg,
    border: C.redBorder,
    bar: C.redBar,
    labelBg: [220, 38, 38], labelText: C.white,
    label: 'ALERT',
  }
  if (status === 'watch') return {
    bg: C.yellowBg,
    border: C.yellowBorder,
    bar: C.yellowBar,
    labelBg: [161, 98, 7], labelText: C.white,
    label: 'WATCH',
  }
  if (status === 'good') return {
    bg: C.greenBg,
    border: C.greenBorder,
    bar: C.greenBar,
    labelBg: [22, 163, 74], labelText: C.white,
    label: 'GOOD',
  }
  return {
    bg: C.grayBg,
    border: C.grayBorder,
    bar: C.grayBar,
    labelBg: [107, 114, 128], labelText: C.white,
    label: 'EMPTY',
  }
}

function rgb(doc, color) {
  doc.setFillColor(...color)
  doc.setDrawColor(...color)
  doc.setTextColor(...color)
}

function drawPileCard(doc, pile, pileNo, x, y, w, h) {
  const status = getPileStatus(pile)
  const sc     = statusColors(status)

  // Card background
  doc.setFillColor(...sc.bg)
  doc.setDrawColor(...sc.border)
  doc.setLineWidth(0.4)
  doc.roundedRect(x, y, w, h, 2, 2, 'FD')

  // Top accent bar
  doc.setFillColor(...sc.bar)
  doc.roundedRect(x, y, w, 2.5, 1, 1, 'F')
  doc.rect(x, y + 1, w, 1.5, 'F')

  // Pile number
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...C.navy)
  doc.text(`PILE ${pileNo}`, x + 3, y + 7)

  if (!pile) {
    // Empty state
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(7)
    doc.setTextColor(...C.gray)
    doc.text('No data', x + w / 2, y + h / 2 + 2, { align: 'center' })
    return
  }

  // Status badge
  const badgeW = 14
  const badgeX = x + w - badgeW - 2
  doc.setFillColor(...sc.labelBg)
  doc.roundedRect(badgeX, y + 4, badgeW, 4, 1, 1, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.5)
  doc.setTextColor(...C.white)
  doc.text(sc.label, badgeX + badgeW / 2, y + 7, { align: 'center' })

  // Data rows
  const rows = [
    { label: 'Bags',    value: pile.bags.toLocaleString('en-US', { maximumFractionDigits: 0 }) },
    { label: 'NKG',     value: `${pile.nkg.toLocaleString('en-US',  { maximumFractionDigits: 0 })} kg` },
    { label: 'Variety', value: pile.cereal_type },
    { label: 'Age',     value: pile.age > 0 ? `${pile.age.toFixed(2)} mo` : '—',
      danger: pile.age > 12, warning: pile.age > 8 },
    { label: 'MC',      value: pile.moisture > 0 ? `${pile.moisture.toFixed(2)}%` : '—',
      danger: pile.moisture > 14 || pile.moisture < 12 },
    { label: 'Cond',    value: pile.condition },
  ]

  const rowH     = (h - 13) / rows.length
  const labelX   = x + 3
  const valueX   = x + w - 3
  let   rowY     = y + 12

  rows.forEach(({ label, value, danger, warning }) => {
    // Alternating row bg
    doc.setFillColor(255, 255, 255, 0.4)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...C.mutedText)
    doc.text(label, labelX, rowY)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    if (danger)       doc.setTextColor(...C.red)
    else if (warning) doc.setTextColor(...C.yellow)
    else              doc.setTextColor(...C.darkText)
    doc.text(value, valueX, rowY, { align: 'right' })

    // Thin divider
    if (rows.indexOf({ label, value, danger, warning }) < rows.length - 1) {
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.1)
      doc.line(labelX, rowY + 1.2, x + w - 3, rowY + 1.2)
    }

    rowY += rowH
  })
}

export function exportPileLayoutToPDF(pileMap, meta = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const PW = doc.internal.pageSize.getWidth()   // 210
  const PH = doc.internal.pageSize.getHeight()  // 297
  const M  = 12   // margin

  // Header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...C.navy)
  doc.text('NATIONAL FOOD AUTHORITY', PW / 2, 9, { align: 'center' })

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...C.mutedText)
  doc.text('WAREHOUSE STOCK PILING LAY-OUT OF SAN JUAN GID WAREHOUSE', PW / 2, 14.5, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...C.navy)
  const dateLabel = meta.month && meta.year
    ? `AS OF ${String(meta.month).toUpperCase()} ${meta.year}`
    : 'AS OF _______________'
  doc.text(dateLabel, PW / 2, 19.5, { align: 'center' })

  doc.setDrawColor(220, 220, 220)
  doc.setLineWidth(0.3)
  doc.line(M, 27, PW - M, 27)

  // Pile grid
  const LEFT_COL  = [1, 3, 5]
  const RIGHT_COL = [2, 4, 6]

  const gridTop = 30
  const gridH   = PH - gridTop - 22   // leave room for legend at bottom
  const rowH    = gridH / 3
  const cardW   = (PW - M * 2 - 5) / 2   // 5mm gap between columns
  const gap     = 4

  const leftX  = M
  const rightX = M + cardW + 5

  for (let i = 0; i < 3; i++) {
    const cardY  = gridTop + i * rowH
    const cardH  = rowH - gap

    drawPileCard(doc, pileMap[LEFT_COL[i]]  || null, LEFT_COL[i],  leftX,  cardY, cardW, cardH)
    drawPileCard(doc, pileMap[RIGHT_COL[i]] || null, RIGHT_COL[i], rightX, cardY, cardW, cardH)
  }

  // ── Legend ───────────────────────────────────────────────
  const legendY = PH - 17
  doc.setFillColor(...C.offWhite)
  doc.setDrawColor(210, 210, 210)
  doc.setLineWidth(0.3)
  doc.roundedRect(M, legendY, PW - M * 2, 10, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...C.navy)
  doc.text('LEGEND:', M + 3, legendY + 6)

  const items = [
    { color: C.green,  label: 'Good'  },
    { color: C.yellow, label: 'Watch' },
    { color: C.red,    label: 'Alert' },
    { color: C.gray,   label: 'Empty' },
  ]

  let lx = M + 22
  items.forEach(({ color, label }) => {
    doc.setFillColor(...color)
    doc.roundedRect(lx, legendY + 3.5, 8, 4, 1, 1, 'F')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...C.darkText)
    doc.text(label, lx + 10, legendY + 6.5)
    lx += 28
  })

  // ── Footer ───────────────────────────────────────────────
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(6)
  doc.setTextColor(...C.gray)
  doc.text('Generated by NFA Warehouse Management System', PW / 2, PH - 4, { align: 'center' })

  doc.save(`PILE-LAYOUT-${meta.month ?? 'export'}-${meta.year ?? ''}.pdf`)
}