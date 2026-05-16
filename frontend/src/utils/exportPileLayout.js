import XLSXStyle from 'xlsx-js-style'

const PILE_BORDER = {
  top:    { style: 'medium', color: { rgb: '888888' } },
  bottom: { style: 'medium', color: { rgb: '888888' } },
  left:   { style: 'medium', color: { rgb: '888888' } },
  right:  { style: 'medium', color: { rgb: '888888' } },
}

const INNER_BORDER = {
  top:    { style: 'thin', color: { rgb: 'AAAAAA' } },
  bottom: { style: 'thin', color: { rgb: 'AAAAAA' } },
  left:   { style: 'thin', color: { rgb: 'AAAAAA' } },
  right:  { style: 'thin', color: { rgb: 'AAAAAA' } },
}

function pileHeaderStyle(hasData) {
  return {
    font:      { bold: true, name: 'Cambria', sz: 10, color: { rgb: '000000' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    fill:      { fgColor: { rgb: hasData ? '92D050' : 'FFFF00' }, patternType: 'solid' },
    border:    PILE_BORDER,
  }
}

function pileDataStyle(hasData, isDanger, isWarning) {
  const textColor = isDanger ? 'C00000' : isWarning ? 'C55A00' : '000000'
  return {
    font:      { name: 'Cambria', sz: 9, color: { rgb: textColor } },
    alignment: { horizontal: 'left', vertical: 'center' },
    fill:      { fgColor: { rgb: hasData ? 'E2EFDA' : 'FFFF99' }, patternType: 'solid' },
    border:    INNER_BORDER,
  }
}

function pileEmptyStyle() {
  return {
    font:      { name: 'Cambria', sz: 9, color: { rgb: '999999' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    fill:      { fgColor: { rgb: 'FFFF99' }, patternType: 'solid' },
    border:    INNER_BORDER,
  }
}

const TITLE_STYLE = {
  font:      { bold: true, name: 'Cambria', sz: 13, color: { rgb: '000000' } },
  alignment: { horizontal: 'center', vertical: 'center' },
}
const SUBTITLE_STYLE = {
  font:      { bold: true, name: 'Cambria', sz: 11, color: { rgb: '000000' } },
  alignment: { horizontal: 'center', vertical: 'center' },
}
const DATE_STYLE = {
  font:      { bold: true, name: 'Cambria', sz: 11, color: { rgb: '000000' }, underline: true },
  alignment: { horizontal: 'center', vertical: 'center' },
}
const LEGEND_LABEL = {
  font:      { name: 'Cambria', sz: 9, color: { rgb: '000000' } },
  alignment: { horizontal: 'left', vertical: 'center' },
}
const LEGEND_CELL_YELLOW = {
  fill:   { fgColor: { rgb: 'FFFF00' }, patternType: 'solid' },
  border: INNER_BORDER,
}
const LEGEND_CELL_GREEN = {
  fill:   { fgColor: { rgb: '92D050' }, patternType: 'solid' },
  border: INNER_BORDER,
}

export function exportPileLayoutToExcel(pileMap, meta = {}) {
  const ws = {}
  const merges = []

  const TOTAL_COLS = 14   // A–N
  const LEFT_COLS  = 6    // columns 0–5  (left pile)
  const GAP_COL    = 6    // column 6 (spacer)
  const RIGHT_START = 7   // columns 7–13 (right pile)

  const set = (r, c, v, style) => {
    ws[XLSXStyle.utils.encode_cell({ r, c })] = { v: v ?? '', s: style }
  }
  const merge = (r1, c1, r2, c2) => {
    merges.push({ s: { r: r1, c: c1 }, e: { r: r2, c: c2 } })
    for (let r = r1; r <= r2; r++)
      for (let c = c1; c <= c2; c++)
        if (!(r === r1 && c === c1))
          ws[XLSXStyle.utils.encode_cell({ r, c })] = { v: '', s: TITLE_STYLE }
  }
  const fillBlank = (r, c1, c2, style) => {
    for (let c = c1; c <= c2; c++) set(r, c, '', style)
  }

  // ── Title block (rows 0–2) ───────────────────────────────
  set(0, 0, 'NATIONAL FOOD AUTHORITY', TITLE_STYLE);   merge(0, 0, 0, TOTAL_COLS - 1)
  set(1, 0, meta.whName ? `${meta.whName}` : 'La Union Branch Office', SUBTITLE_STYLE); merge(1, 0, 1, TOTAL_COLS - 1)
  set(2, 0, meta.whAddress ?? 'San Juan, La Union', SUBTITLE_STYLE); merge(2, 0, 2, TOTAL_COLS - 1)
  set(3, 0, `WAREHOUSE STOCK PILING LAY-OUT OF SAN JUAN GID 1-A WAREHOUSE`, SUBTITLE_STYLE); merge(3, 0, 3, TOTAL_COLS - 1)
  const dateLabel = meta.month && meta.year ? `AS OF ${meta.month} ${meta.year}` : 'AS OF _______________'
  set(4, 0, dateLabel, DATE_STYLE); merge(4, 0, 4, TOTAL_COLS - 1)

  // blank spacer row
  fillBlank(5, 0, TOTAL_COLS - 1, LEGEND_LABEL)

  // ── Pile layout ──────────────────────────────────────────
  // Each pile takes PILE_ROWS rows in the sheet
  const PILE_ROWS = 8   // 1 header + 6 data rows + 1 bottom padding
  const LEFT_PILES  = [1, 3, 5]
  const RIGHT_PILES = [2, 4, 6]

  const DATA_START = 6

  function writePile(pileNo, startRow, colStart, colEnd) {
    const pile    = pileMap[pileNo] || null
    const hasData = !!pile

    const status  = pile ? getPileStatus(pile) : 'empty'
    const isDanger  = status === 'alert'
    const isWarning = status === 'watch'

    // Header row: "PILE X"  + status badge
    const headerLabel = `PILE ${pileNo}${!hasData ? '' : status === 'alert' ? '  ⚠ ALERT' : status === 'watch' ? '  ⚠ WATCH' : ''}`
    set(startRow, colStart, headerLabel, pileHeaderStyle(hasData))
    merge(startRow, colStart, startRow, colEnd)

    if (!hasData) {
      // empty pile – just shade it
      for (let r = startRow + 1; r < startRow + PILE_ROWS - 1; r++) {
        set(r, colStart, r === startRow + 3 ? 'No data' : '', pileEmptyStyle())
        merge(r, colStart, r, colEnd)
      }
    } else {
      const rows = [
        { label: 'Bags:', value: pile.bags.toLocaleString('en-US', { maximumFractionDigits: 0 }) },
        { label: 'Nkg:',  value: pile.nkg.toLocaleString('en-US',  { maximumFractionDigits: 0 }) },
        { label: 'Variety:', value: pile.cereal_type },
        { label: 'Cond:', value: pile.condition },
        {
          label: 'Age:',
          value: pile.age > 0 ? `${pile.age.toFixed(2)} mo` : '—',
          danger: pile.age > 12, warning: pile.age > 8 && pile.age <= 12,
        },
        {
          label: 'MC:',
          value: pile.moisture > 0 ? `${pile.moisture.toFixed(2)}%` : '—',
          danger: pile.moisture > 14 || (pile.moisture > 0 && pile.moisture < 12),
        },
      ]

      const half = Math.floor((colEnd - colStart + 1) / 2)

      rows.forEach(({ label, value, danger, warning }, i) => {
        const r       = startRow + 1 + i
        const labelCol = colStart
        const valCol   = colStart + half

        set(r, labelCol, label, {
          font:      { name: 'Cambria', sz: 9, bold: true, color: { rgb: '000000' } },
          alignment: { horizontal: 'left', vertical: 'center' },
          fill:      { fgColor: { rgb: 'E2EFDA' }, patternType: 'solid' },
          border:    INNER_BORDER,
        })
        merge(r, labelCol, r, valCol - 1)

        set(r, valCol, value, {
          font:      { name: 'Cambria', sz: 9, bold: false,
                       color: { rgb: danger ? 'C00000' : warning ? 'C55A00' : '333333' } },
          alignment: { horizontal: 'left', vertical: 'center' },
          fill:      { fgColor: { rgb: 'E2EFDA' }, patternType: 'solid' },
          border:    INNER_BORDER,
        })
        merge(r, valCol, r, colEnd)
      })
    }

    // bottom padding row
    const padRow = startRow + PILE_ROWS - 1
    fillBlank(padRow, colStart, colEnd, {
      fill:   { fgColor: { rgb: hasData ? 'E2EFDA' : 'FFFF99' }, patternType: 'solid' },
      border: INNER_BORDER,
    })
    merge(padRow, colStart, padRow, colEnd)
  }

  for (let i = 0; i < 3; i++) {
    const rowStart = DATA_START + i * PILE_ROWS
    writePile(LEFT_PILES[i],  rowStart, 0,           LEFT_COLS - 1)
    writePile(RIGHT_PILES[i], rowStart, RIGHT_START,  TOTAL_COLS - 1)
    // gap column blank
    for (let r = rowStart; r < rowStart + PILE_ROWS; r++) {
      set(r, GAP_COL, '', LEGEND_LABEL)
    }
  }

  // ── Legend ───────────────────────────────────────────────
  const legendRow = DATA_START + 3 * PILE_ROWS + 1
  set(legendRow, 0, 'LEGEND:', LEGEND_LABEL)
  set(legendRow, 1, '', LEGEND_CELL_YELLOW); merge(legendRow, 1, legendRow, 2)
  set(legendRow, 3, 'SAN JUAN GID 1', LEGEND_LABEL); merge(legendRow, 3, legendRow, 5)
  set(legendRow, 6, '', LEGEND_CELL_GREEN); merge(legendRow, 6, legendRow, 7)
  set(legendRow, 8, 'SAN JUAN GID 1-A', LEGEND_LABEL); merge(legendRow, 8, legendRow, 10)

  // ── Sheet range & column widths ───────────────────────────
  const lastRow = legendRow + 1
  ws['!ref']    = XLSXStyle.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: lastRow, c: TOTAL_COLS - 1 } })
  ws['!merges'] = merges
  ws['!cols'] = [
    { wch: 8  }, { wch: 8  }, { wch: 8  }, { wch: 8  }, { wch: 8  }, { wch: 8  }, // left pile cols
    { wch: 2  },                                                                      // gap
    { wch: 8  }, { wch: 8  }, { wch: 8  }, { wch: 8  }, { wch: 8  }, { wch: 8  }, { wch: 8 }, // right
  ]
  ws['!rows'] = [
    { hpt: 16 }, { hpt: 14 }, { hpt: 14 }, { hpt: 14 }, { hpt: 14 }, { hpt: 8 }, // title rows
    ...Array(3 * PILE_ROWS).fill({ hpt: 16 }),
    { hpt: 8 }, { hpt: 16 },
  ]

  const wb = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(wb, ws, 'Pile Layout')
  const filename = `PILE-LAYOUT-${meta.month ?? 'export'}-${meta.year ?? ''}.xlsx`
  XLSXStyle.writeFile(wb, filename)
}

// ── Helpers (mirrored from PileLayout.jsx) ───────────────────
function getPileStatus(pile) {
  if (!pile) return 'empty'
  if (pile.age > 12 || pile.moisture > 14 || pile.moisture < 12) return 'alert'
  if (pile.age > 8  || pile.moisture > 13.5)                     return 'watch'
  return 'good'
}