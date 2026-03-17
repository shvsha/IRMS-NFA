import '../../styles/filters/WeeklyFilter.css'

import FilterDropdown from './FilterDropdown';

import { getWeekRange } from '../../utils/dateUtils'

// 2020 - 2030
const YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i);
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateString(year, month, day) {
  return `${year}-${String(month+1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function WeeklyFilter({ selectedWeek, year, month, onPrevMonth, onNextMonth, onMonthChange, onYearChange }) {

  const [startDay, endDay] = getWeekRange(selectedWeek, year, month);

  // building the ui of the calendar
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startPad = new Date(year, month, 1).getDay();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const trailingDays = (7 - ((startPad + daysInMonth) % 7)) % 7;

  return (
    <>
      <div className="weekly-filter-container">
        {/* The Calendar */}
        <div className='weekly-filter-cal-header'>
          <button className='weekly-filter-nav-btn' onClick={onPrevMonth}>&#8249;</button>

          <div style={{display: 'flex', gap: '6px'}}>
            <FilterDropdown
              selected={MONTHS[month]}
              options={MONTHS}
              onSelect={(val) => onMonthChange(MONTHS.indexOf(val))}
              buttonClass={'weekly-filter-month-select'}
            />
            <FilterDropdown
              selected={String(year)}
              options={YEARS.map(String)}
              onSelect={(val) => onYearChange(Number(val))}
              buttonClass={'weekly-filter-year-select'}
            />

          </div>

          <button className='weekly-filter-nav-btn' onClick={onNextMonth}>&#8250;</button>

        </div>

        <div className='weekly-filter-grid'>
          {DAYS.map(d => (
            <div key={d} className='weekly-filter-day-of-week'>{d}</div>
          ))}

          {Array.from({length: startPad}, (_, i) => (
            <div key={`prev-${i}`} className='weekly-filter-day other-month'>
              {prevMonthDays - startPad + 1 + i}
            </div>
          ))}

        {Array.from({ length: daysInMonth}, (_, i) => {
          const d = i + 1;
          let className = 'weekly-filter-day'
          if (d === startDay) className+= ' range-start';
          else if (d === endDay) className += ' range-end';
          else if (d > startDay && d < endDay) className += ' in-range';
          return (
            <div key={d} className={className}>{d}</div>
          );
        })}

        {Array.from({length: trailingDays}, (_, i) => (
          <div key={`next-${i}`} className='weekly-filter-day other-month'>
            {i + 1}
          </div>
        ))}
        </div>

      </div>
    </>
  )
}
