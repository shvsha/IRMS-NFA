import '../../styles/filters/MonthlyFilter.css'

// filter dropdown component
import FilterDropdown from './FilterDropdown';

// 2020 - 2030
const YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i);
const MONTHS = [
  'January', 'February', 'March',
  'April', 'May', 'June',
  'July', 'August', 'September',
  'October', 'November', 'December'
];

const rows = [];
for (let i = 0; i < MONTHS.length; i += 3) {
  rows.push(MONTHS.slice(i, i + 3));
}

export default function MonthlyFilter({ selectedMonth, year, onYearChange, onMonthChange }) {
  return (
    <> 
      <div className='monthly-filter-container'>
        <div className='monthly-filter-header'>
          <span style={{ color: 'black'}}>{selectedMonth}</span>
          <FilterDropdown
            selected={String(year)}
            options={YEARS.map(String)}
            onSelect={(val) => onYearChange(Number(val))}
            buttonClass={'monthly-filter-year-select'}
          />
        </div>

        <div className='monthly-filter-grid'>
          {rows.map((row, rowIndex) => (
            <div className='three-month-row' key={rowIndex}>
              {row.map(month => (
                <button
                  key={month}
                  className={`monthly-btn ${selectedMonth === month ? 'active' : ''}`}
                  onClick={() => onMonthChange(month)}
                >
                  {month}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

    </> 
  )
}