"use client";

import { useEffect, useRef, useState } from "react";
import { pad2 } from "../_lib/date";

const timeHours = Array.from({ length: 24 }, (_, i) => pad2(i));
const timeMinutes = ["00", "15", "30", "45"];

export default function TimePicker({
  value,
  onChange,
  placeholder = "Цаг сонгох",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);

  const [hour, minute] = value ? value.split(":") : [undefined, undefined];

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

  useEffect(() => {
    if (!open) return;
    hourListRef.current?.querySelector(".selected")?.scrollIntoView({ block: "center" });
    minuteListRef.current?.querySelector(".selected")?.scrollIntoView({ block: "center" });
  }, [open]);

  const pickHour = (h: string) => onChange(`${h}:${minute ?? "00"}`);
  const pickMinute = (m: string) => onChange(`${hour ?? "00"}:${m}`);

  return (
    <div className={`admin-time${open ? " open" : ""}`} ref={ref}>
      <button
        type="button"
        className="admin-select-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={value ? undefined : "placeholder"}>{value || placeholder}</span>
        <span className="admin-time-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="admin-time-popup" role="dialog" aria-label="Цаг сонгох">
          <div className="admin-time-columns">
            <div className="admin-time-col">
              <span className="admin-time-col-label">Цаг</span>
              <div className="admin-time-col-list" ref={hourListRef}>
                {timeHours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={h === hour ? "selected" : ""}
                    onClick={() => pickHour(h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div className="admin-time-col">
              <span className="admin-time-col-label">Минут</span>
              <div className="admin-time-col-list" ref={minuteListRef}>
                {timeMinutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={m === minute ? "selected" : ""}
                    onClick={() => pickMinute(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
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
