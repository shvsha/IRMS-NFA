import { useState, useRef, useEffect } from 'react';
import { FaRegCalendarAlt } from 'react-icons/fa';
import FilterDropdown from './FilterDropdown';
import '../../styles/filters/DailyFilter.css';

const YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i);
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

export default function DatePickerInput({ value, onChange, placeholder = "MM/DD/YYYY" }) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState((value ?? new Date()).getMonth());
  const [viewYear, setViewYear]   = useState((value ?? new Date()).getFullYear());
  const containerRef = useRef(null);

  // close when click outside
  useEffect(() => {
    function handleOutsideClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (value) {
      setViewMonth(value.getMonth());
      setViewYear(value.getFullYear());
    }
  }, [value]);

  const formattedValue = value
    ? `${String(value.getMonth() + 1).padStart(2, '0')}/${String(value.getDate()).padStart(2, '0')}/${value.getFullYear()}`
    : '';

  // calendar ui math
  const daysInMonth   = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startPad      = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const trailingDays  = (7 - ((startPad + daysInMonth) % 7)) % 7;

  const isSelected = (day) =>
    value &&
    value.getFullYear() === viewYear &&
    value.getMonth()    === viewMonth &&
    value.getDate()     === day;

  const handleDayClick = (day) => {
    onChange(new Date(viewYear, viewMonth, day));
    setOpen(false);
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className='daily-filter-wrapper' ref={containerRef}>
      {/* Input trigger */}
      <div
        className={`daily-filter-input${open ? ' daily-filter-input--open' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className={`daily-filter-input-text${!value ? ' daily-filter-input-placeholder' : ''}`}>
          {formattedValue || placeholder}
        </span>
        <FaRegCalendarAlt className='dpi-icon' size={16} />
      </div>

      {/* Calendar dropdown */}
      {open && (
        <div className='daily-filter-calendar'>
          {/* Header */}
          <div className='daily-filter-cal-header'>
            <button className='daily-filter-nav-btn' onClick={handlePrevMonth}>&#8249;</button>
            <div style={{ display: 'flex', gap: '6px' }}>
              <FilterDropdown
                selected={MONTHS[viewMonth]}
                options={MONTHS}
                onSelect={(val) => setViewMonth(MONTHS.indexOf(val))}
                buttonClass='daily-filter-month-select'
              />
              <FilterDropdown
                selected={String(viewYear)}
                options={YEARS.map(String)}
                onSelect={(val) => setViewYear(Number(val))}
                buttonClass='daily-filter-year-select'
              />
            </div>
            <button className='daily-filter-nav-btn' onClick={handleNextMonth}>&#8250;</button>
          </div>

          <div className='daily-filter-grid'>
            {DAYS.map(d => (
              <div key={d} className='daily-filter-day-header'>{d}</div>
            ))}

            {Array.from({ length: startPad }, (_, i) => (
              <div key={`prev-${i}`} className='daily-filter-day daily-filter-day--other'>
                {prevMonthDays - startPad + 1 + i}
              </div>
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              return (
                <div
                  key={day}
                  className={`daily-filter-day${selected ? ' daily-filter-day--selected' : ''}`}
                  onClick={() => handleDayClick(day)}
                >
                  {day}
                </div>
              );
            })}

            {Array.from({ length: trailingDays }, (_, i) => (
              <div key={`next-${i}`} className='daily-filter-day daily-filter-day--other'>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}