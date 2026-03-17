import '../../styles/filters/WeeklyFilter.css'

const styles = {
  day: { textAlign: "center", fontSize: 13, padding: "7px 0", borderRadius: 6, color: "#111827" },
  otherMonth: { color: "#d1d5db" },
  rangeStart:  { background: "#185fa5", color: "#fff", fontWeight: 500, borderRadius: "6px 0 0 6px" },
  inRange:     { background: "#b5d4f4", color: "#0c447c", borderRadius: 0 },
  rangeEnd:    { background: "#b5d4f4", color: "#0c447c", borderRadius: "0 6px 6px 0" },
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// It gets what range or what week does the user picked
function getWeekRange(week, month, year) {
  // Total days in a month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return {
    1: [1, 7],
    2: [8, 14],
    3: [15, 21],
    4: [22, daysInMonth]
  }[week];
}

function toDateString(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`
}

export default function WeeklyFilter() {
  // Rename the year, month, and week to more readable variable name
  const { year: viewYear, month: viewMonth, week: selectedWeek } = value;
  // get the start and end day
  const [starDay, endDay] = getWeekRange(selectedWeek, viewYear, viewMonth)

  // building the ui of the calendar
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startPad = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const total = startPad + daysInMonth;
  const trailingDays = (7 - (total % 7)) % 7;

  // this are for previous and next button
  // emit means sending the updated values to parent
  function prevMonth() {
    const newMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const newYear = viewMonth === 0 ? viewYear - 1 : viewYear;
    emit(newYear, newMonth, selectedWeek);
  }

  function nextMonth() {
    const newMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const newYear = viewMonth === 11 ? viewYear + 1 : viewYear;
    emit(newYear, newMonth, selectedWeek);
  }

  // Handle the change in week and converting the string to Number
  const handleWeekChange = (e) => {
    emit(viewYear, viewMonth, Number(e.target.value))
  }

  const getDayStyle = (d) => {
    if (d === startDay) return {...styles.day, ...styles.rangeStart };
    if (d === endDay) return {...styles.day, ...styles.rangeEnd };
    if (d > startDay && d < endDay) return {...styles.day, ...styles.inRange };
    return styles.day;
  }

  return (
    <>
      <div className="weekly-filter-wrapper">
        <div className='weekly-filter-field-group'>
          <label style={{fontSize: 13, fontWeight: 500, color: '#2D317F'}}></label>
          <select className='weekly-filter-select-range'>
            <option value="">Weekly</option>
            <option value="">Monthly</option>
          </select>
        </div>

        <div className='weekly-filter-field-group'>
          <label style={{fontSize: 13, fontWeight: 500, color: '#2D317F'}}></label>
          <select className='weekly-filter-select-range' value={selectedWeek} onChange={handleWeekChange}>
            <option value={1}>Week 1</option>
            <option value={2}>Week 2</option>
            <option value={3}>Week 3</option>
            <option value={4}>Week 4</option>
          </select>
        </div>

        {/* The Calendar */}
        <div className='weekly-filter-cal-box'>
          <div className='weekly-filter-cal-header'>
            <button className='weekly-filter-nav-btn' onClick={prevMonth}>&#8249</button>
            <span className='weekly-filter-month-table'>{MONTHS[viewMonth]} {viewYear}</span>
            <button className='weekly-filter-nav-btn' onClick={nextMonth}>&#8250</button>
          </div>
        </div>

        <div className='weekly-filter-grid'>
          {DAYS.map(d => (
            <div key={d} className='weekly-filter-day-of-week'>{d}</div>
          ))}

          {Array.from({length: startPad}, (_, i) => (
            <div key={`prev-${i}`} style={{...styles.day, ...styles.otherMonth}}>
              {prevMonthDays - startPad + 1 + i}
            </div>
          ))}

        {Array.from({ length: daysInMonth}, (_, i) => {
          const d = i + 1;
          return (
            <div key={d} style={getDayStyle(d)}>{d}</div>
          );
        })}

        {Array.from({length: trailingDays}, (_, i) => (
          <div key={`next-${i}`} style={{...styles.day, ...styles.otherMonth}}>
            {i + 1}
          </div>
        ))}
        </div>

      </div>
    </>
  )
}
