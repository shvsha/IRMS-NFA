import { useState, useEffect, useRef } from "react";
import '../../styles/filters/FilterDropdown.css'

export default function FilterDropdown({ selected, options, onSelect, buttonClass }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button type="button" className={buttonClass} onClick={() => setOpen(o => !o)}>
        <span>{selected}</span>
        <span className={`dropdown-chevron${open ? ' open' : ''}`}>▼</span>
      </button>
      {open && (
        <ul className="dropdown-content">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => { onSelect(option); setOpen(false); }}
              className={selected === option ? 'dropdown-item-active' : ''}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}