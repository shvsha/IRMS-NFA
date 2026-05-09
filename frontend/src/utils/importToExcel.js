import * as XLSX from 'xlsx'

export function parseStockbookExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

        const dataRows = raw.slice(2)

        const transactions = dataRows
          .map(row => {
            const get = (i) => String(row[i] ?? '').trim()

            const txn = {
              particulars:     get(2),
              plateNo:         get(3),
              wts:             get(4),
              wsr:             get(5),
              wsi:             get(6),
              batchNo:         get(7),
              age:             get(8),
              aiNo:            get(9),
              orNo:            get(10),
              moistureContent: get(11),
              classifier:      get(12),
              transaction:     get(13),
              pileNo:          get(14),
              rBags:           get(15),
              rGkg:            get(16),
              rNkg:            get(17),
              rCondition:      get(18),
              iBags:           get(19),
              iGkg:            get(20),
              iNkg:            get(21),
              iCondition:      get(22),
              fillers:         get(23),
            }

            const hasData = Object.values(txn).some(v => v !== '')
            return hasData ? txn : null
          })
          .filter(Boolean)

        if (transactions.length === 0) {
          reject(new Error('No transaction data found in the file.'))
          return
        }

        resolve(transactions)
      } catch (err) {
        reject(new Error('Failed to parse Excel file: ' + err.message))
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsArrayBuffer(file)
  })
}