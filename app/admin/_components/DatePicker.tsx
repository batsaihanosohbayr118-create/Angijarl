"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "./Icon";
import { buildCalendarCells, monthLabels, parseDateValue, toDateValue, weekdayLabels } from "../_lib/date";

export default function DatePicker({
  value,
  onChange,
  placeholder = "Огноо сонгох",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(() => parseDateValue(value)?.year ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => parseDateValue(value)?.month ?? today.getMonth());

  const openPicker = () => {
    const parsed = parseDateValue(value);
    setViewYear(parsed?.year ?? today.getFullYear());
    setViewMonth(parsed?.month ?? today.getMonth());
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const cells = buildCalendarCells(viewYear, viewMonth);
  const todayValue = toDateValue(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className={`admin-date${open ? " open" : ""}`} ref={ref}>
      <button
        type="button"
        className="admin-select-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openPicker())}
      >
        <span className={value ? undefined : "placeholder"}>{value || placeholder}</span>
        <span className="admin-date-icon" aria-hidden="true">
          <Icon name="bookings" />
        </span>
      </button>

      {open && (
        <div className="admin-date-popup" role="dialog" aria-label="Огноо сонгох">
          <div className="admin-date-head">
            <button type="button" aria-label="Өмнөх сар" onClick={goPrevMonth}>‹</button>
            <strong>{monthLabels[viewMonth]} {viewYear}</strong>
            <button type="button" aria-label="Дараах сар" onClick={goNextMonth}>›</button>
          </div>

          <div className="admin-date-weekdays">
            {weekdayLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="admin-date-grid">
            {cells.map((day, index) => {
              if (day === null) return <span key={`blank-${index}`} />;
              const dateValue = toDateValue(viewYear, viewMonth, day);
              const isSelected = dateValue === value;
              const isToday = dateValue === todayValue;
              return (
                <button
                  key={dateValue}
                  type="button"
                  className={`${isSelected ? "selected" : ""}${isToday ? " today" : ""}`}
                  onClick={() => {
                    onChange(dateValue);
                    setOpen(false);
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {value && (
            <button
              type="button"
              className="admin-date-clear"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Цэвэрлэх
            </button>
          )}
        </div>
      )}
    </div>
  );
}
