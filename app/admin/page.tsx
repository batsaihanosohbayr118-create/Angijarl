"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

/* ===================== Types ===================== */

type Role = "user" | "admin";
type BookingStatus = "хүлээгдэж буй" | "баталгаажсан" | "цуцлагдсан";
type CouponDiscountType = "percent" | "amount";

interface Session {
  role: Role;
  name: string;
}

interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  joinedAt: string;
}

interface Booking {
  id: string;
  name: string;
  phone: string;
  service: string;
  specialist: string;
  preferredDate: string;
  time: string;
  status: BookingStatus;
  note: string;
  servicePrice?: number;
  couponCode?: string;
  discountAmount?: number;
  totalAmount?: number;
  createdAt: string;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  photo: string;
}

interface Teacher {
  id: string;
  name: string;
  role: string;
  years: number;
  bio: string;
  photo: string;
  createdAt: string;
  initials: string;
  serviceIds: string[];
}

interface Coupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  value: number;
  expiresAt?: string;
  active: boolean;
  usageLimit?: number;
  usedCount: number;
  createdAt: string;
}

type TabKey = "overview" | "users" | "bookings" | "teachers" | "services" | "coupons";

/* ===================== Storage keys & seed data ===================== */

const SERVICES_KEY = "angijral_admin_services_v1";

const seedServices: ServiceItem[] = [
  { id: "s1", title: "Оффис бариа засал", description: "Суудал дээр нь хийх хүзүү, толгой, мөр гарын бариа", photo: "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=900" },
  { id: "s2", title: "Байгууллагын бясалгал", description: "Стресс тайлж, бүтээмж нэмэх сонирхолтой хөтөлбөрт бүлгийн бясалгал", photo: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=900" },
  { id: "s3", title: "Хоол зүйн сургалт", description: "Хоол зүйн бүлгийн сургалт болон ганцаарчилсан зөвлөгөө, дэглэм", photo: "https://images.pexels.com/photos/5905902/pexels-photo-5905902.jpeg?auto=compress&cs=tinysrgb&w=900" },
  { id: "s4", title: "Сэтгэл зүйн сургалт", description: "Мэргэжлийн сэтгэл зүйчийн бүлгийн сургалт, зөвлөгөө", photo: "https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=900" },
];

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

const pendingSessionSnapshot = "__pending__";

const getAdminSessionSnapshot = () => {
  if (typeof window === "undefined") return pendingSessionSnapshot;

  try {
    return window.localStorage.getItem("angijral_session") ?? "null";
  } catch {
    return "null";
  }
};

const subscribeToAdminSession = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === "angijral_session") {
      callback();
    }
  };

  const handleSessionChange = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener("angijral-session-change", handleSessionChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("angijral-session-change", handleSessionChange);
  };
};

function parseAdminSession(snapshot: string): Session | null {
  if (snapshot === pendingSessionSnapshot || snapshot === "null") return null;

  try {
    const parsed = JSON.parse(snapshot) as Session;
    return parsed?.role === "admin" ? parsed : null;
  } catch {
    return null;
  }
}

/* ===================== Icons ===================== */

function Icon({ name }: { name: string }) {
  const common = { viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" } as const;
  switch (name) {
    case "overview":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
          <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
          <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
          <rect x="13" y="13" width="7.5" height="7.5" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.5 19c0-2.9 2.5-5.2 5.5-5.2s5.5 2.3 5.5 5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M15.3 5.4c1.5.2 2.6 1.5 2.6 3.1 0 1.6-1.1 2.9-2.6 3.1M17.6 13.9c2.1.5 3.6 2.3 3.6 4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "bookings":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.5 9.5h17M8 3v3.4M16 3v3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M7.5 13.2h2.4M7.5 16.5h5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "services":
      return (
        <svg {...common}>
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H15l5 5v9.5A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5v-12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M14.5 4v4.5a1 1 0 0 0 1 1H20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "coupons":
      return (
        <svg {...common}>
          <path d="M4 8.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.5a2.5 2.5 0 0 0 0 5V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5a2.5 2.5 0 0 0 0-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9 9.2h.1M15 14.8h.1M15.5 8.8l-7 6.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.5 10v8.5A1.5 1.5 0 0 0 8 20h8a1.5 1.5 0 0 0 1.5-1.5V10" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M9 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M14 8l4.5 4-4.5 4M18.3 12H9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.6" />
          <path d="m19 19-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M5 7h14M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M7.5 7l.7 11.2A2 2 0 0 0 10.2 20h3.6a2 2 0 0 0 2-1.8L16.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common}>
          <path d="M15.2 4.8 19.2 8.8 8.6 19.4l-4.6.8.8-4.6L15.2 4.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

/* ===================== Small UI helpers ===================== */

function StatCard({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="admin-stat-card">
      <span className="admin-stat-icon">
        <Icon name={icon} />
      </span>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Сонгох",
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  const selected = options.find((option) => option.value === value);

  return (
    <div className={`admin-select${open ? " open" : ""}`} ref={ref}>
      <button
        type="button"
        className="admin-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selected ? undefined : "placeholder"}>{selected ? selected.label : placeholder}</span>
        <span className={`admin-select-chevron${open ? " open" : ""}`} aria-hidden="true">
          <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <ul className="admin-select-menu" role="listbox">
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                className={option.value === value ? "active" : ""}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const weekdayLabels = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
const monthLabels = [
  "1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар",
  "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар",
];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDateValue(year: number, month: number, day: number) {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function parseDateValue(value: string): { year: number; month: number; day: number } | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
}

function buildCalendarCells(year: number, month: number) {
  const jsWeekday = new Date(year, month, 1).getDay();
  const leadingBlanks = (jsWeekday + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function DatePicker({
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

const timeHours = Array.from({ length: 24 }, (_, i) => pad2(i));
const timeMinutes = ["00", "15", "30", "45"];

function TimePicker({
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

function statusBadgeClass(status: BookingStatus) {
  if (status === "хүлээгдэж буй") return "pending";
  if (status === "баталгаажсан") return "confirmed";
  return "cancelled";
}

function formatMoney(amount?: number) {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "—";
  return `${new Intl.NumberFormat("mn-MN").format(amount)}₮`;
}

function formatCouponValue(coupon: Pick<Coupon, "discountType" | "value">) {
  return coupon.discountType === "percent" ? `${coupon.value}%` : formatMoney(coupon.value);
}

/* ===================== Main component ===================== */

export default function AdminPage() {
  const router = useRouter();

  const sessionSnapshot = useSyncExternalStore(
    subscribeToAdminSession,
    getAdminSessionSnapshot,
    () => pendingSessionSnapshot
  );
  const session = useMemo(() => parseAdminSession(sessionSnapshot), [sessionSnapshot]);
  const checkedAuth = sessionSnapshot !== pendingSessionSnapshot;

  const [tab, setTab] = useState<TabKey>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const recentBookingsWrapRef = useRef<HTMLDivElement>(null);
  const usersWrapRef = useRef<HTMLDivElement>(null);
  const bookingsWrapRef = useRef<HTMLDivElement>(null);
  const couponsWrapRef = useRef<HTMLDivElement>(null);
  const teachersGridRef = useRef<HTMLDivElement>(null);
  const servicesGridRef = useRef<HTMLDivElement>(null);

  const scrollCards = (wrapRef: React.RefObject<HTMLDivElement | null>, direction: 1 | -1) => {
    const tbody = wrapRef.current?.querySelector("tbody");
    if (!tbody) return;
    const card = tbody.querySelector("tr");
    const step = card ? card.getBoundingClientRect().width + 12 : tbody.clientWidth;
    tbody.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const scrollGridCards = (gridRef: React.RefObject<HTMLDivElement | null>, direction: 1 | -1) => {
    const grid = gridRef.current;
    if (!grid) return;
    const card = grid.querySelector(":scope > *");
    const step = card ? card.getBoundingClientRect().width + 18 : grid.clientWidth;
    grid.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const [users, setUsers] = useState<AppUser[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ServiceItem[]>(seedServices);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const [userSearch, setUserSearch] = useState("");
  const [bookingFilter, setBookingFilter] = useState<"Бүгд" | BookingStatus>("Бүгд");

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDraft, setBookingDraft] = useState({
    name: "",
    phone: "",
    service: "",
    specialist: "",
    preferredDate: "",
    time: "",
    note: "",
  });

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceDraft, setServiceDraft] = useState({ title: "", description: "", photo: "" });

  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [couponDraft, setCouponDraft] = useState({
    code: "",
    discountType: "percent" as CouponDiscountType,
    value: "10",
    expiresAt: "",
    active: "true",
    usageLimit: "",
  });

  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [teacherDraft, setTeacherDraft] = useState({
    name: "",
    role: "",
    years: "0",
    bio: "",
    photo: "",
    serviceIds: [] as string[],
  });

  const isAdmin = session?.role === "admin";

  /* auth guard */
  useEffect(() => {
    if (checkedAuth && !isAdmin) {
      router.replace("/login");
    }
  }, [checkedAuth, isAdmin, router]);

  /* load data */
  useEffect(() => {
    if (!isAdmin) return;

    const loadUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");
        const data = (await response.json()) as { users?: AppUser[] };
        setUsers(response.ok && Array.isArray(data.users) ? data.users : []);
      } catch {
        setUsers([]);
      }
    };

    const loadBookings = async () => {
      try {
        const response = await fetch("/api/admin/bookings");
        const data = (await response.json()) as { bookings?: Booking[] };
        setBookings(response.ok && Array.isArray(data.bookings) ? data.bookings : []);
      } catch {
        setBookings([]);
      }
    };

    const loadTeachers = async () => {
      try {
        const response = await fetch("/api/admin/teachers");
        const data = (await response.json()) as { teachers?: Teacher[] };
        setTeachers(response.ok && Array.isArray(data.teachers) ? data.teachers : []);
      } catch {
        setTeachers([]);
      }
    };

    const loadServices = async () => {
      try {
        const response = await fetch("/api/admin/services");
        const data = (await response.json()) as { services?: ServiceItem[] };
        setServices(response.ok && Array.isArray(data.services) ? data.services : seedServices);
      } catch {
        setServices(loadFromStorage(SERVICES_KEY, seedServices));
      }
    };

    const loadCoupons = async () => {
      try {
        const response = await fetch("/api/admin/coupons");
        const data = (await response.json()) as { coupons?: Coupon[] };
        setCoupons(response.ok && Array.isArray(data.coupons) ? data.coupons : []);
      } catch {
        setCoupons([]);
      }
    };

    void loadUsers();
    void loadBookings();
    void loadTeachers();
    void loadServices();
    void loadCoupons();
  }, [isAdmin]);

  const handleLogout = () => {
    window.localStorage.removeItem("angijral_session");
    router.push("/login");
  };

  /* derived stats */
  const pendingCount = useMemo(() => bookings.filter((b) => b.status === "хүлээгдэж буй").length, [bookings]);
  const confirmedCount = useMemo(() => bookings.filter((b) => b.status === "баталгаажсан").length, [bookings]);
  const recentBookings = useMemo(
    () => [...bookings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5),
    [bookings]
  );

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q)
    );
  }, [users, userSearch]);

  const filteredBookings = useMemo(() => {
    if (bookingFilter === "Бүгд") return bookings;
    return bookings.filter((b) => b.status === bookingFilter);
  }, [bookings, bookingFilter]);

  /* actions */
  const toggleRole = async (id: string) => {
    const previousUsers = users;
    const target = users.find((user) => user.id === id);
    if (!target) return;

    const role = target.role === "admin" ? "user" : "admin";
    setUsers((current) => current.map((u) => (u.id === id ? { ...u, role } : u)));

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });
      const data = (await response.json()) as { user?: AppUser };

      if (!response.ok || !data.user) {
        setUsers(previousUsers);
        return;
      }

      setUsers((current) => current.map((u) => (u.id === id ? data.user! : u)));
    } catch {
      setUsers(previousUsers);
    }
  };

  const deleteUser = async (id: string) => {
    const previousUsers = users;
    setUsers((current) => current.filter((u) => u.id !== id));

    try {
      const response = await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setUsers(previousUsers);
      }
    } catch {
      setUsers(previousUsers);
    }
  };

  const setBookingStatus = async (id: string, status: BookingStatus) => {
    const previousBookings = bookings;
    setBookings((current) => current.map((b) => (b.id === id ? { ...b, status } : b)));

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = (await response.json()) as { booking?: Booking };

      if (!response.ok || !data.booking) {
        setBookings(previousBookings);
        return;
      }

      setBookings((current) => current.map((b) => (b.id === id ? data.booking! : b)));
    } catch {
      setBookings(previousBookings);
    }
  };

  const deleteBooking = async (id: string) => {
    const previousBookings = bookings;
    setBookings((current) => current.filter((b) => b.id !== id));

    try {
      const response = await fetch(`/api/admin/bookings?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setBookings(previousBookings);
      }
    } catch {
      setBookings(previousBookings);
    }
  };

  const submitBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingDraft.name.trim() || !bookingDraft.phone.trim()) return;

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bookingDraft.name.trim(),
          phone: bookingDraft.phone.trim(),
          service: bookingDraft.service.trim() || services[0]?.title || "Ерөнхий үзлэг",
          specialist: bookingDraft.specialist.trim(),
          preferredDate: bookingDraft.preferredDate || new Date().toISOString().slice(0, 10),
          time: bookingDraft.time,
          note: bookingDraft.note.trim(),
        }),
      });
      const data = (await response.json()) as { booking?: Booking };

      if (response.ok && data.booking) {
        setBookings((current) => [data.booking!, ...current]);
      }
    } catch {
      /* ignore — сүлжээний алдаа гарвал захиалга нэмэгдэхгүй */
    }

    setBookingDraft({ name: "", phone: "", service: "", specialist: "", preferredDate: "", time: "", note: "" });
    setShowBookingForm(false);
  };

  const openTeacherForm = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacherId(teacher.id);
      setTeacherDraft({
        name: teacher.name,
        role: teacher.role,
        years: String(teacher.years),
        bio: teacher.bio,
        photo: teacher.photo,
        serviceIds: teacher.serviceIds ?? [],
      });
    } else {
      setEditingTeacherId(null);
      setTeacherDraft({ name: "", role: "", years: "0", bio: "", photo: "", serviceIds: [] });
    }
    setShowTeacherForm(true);
  };

  const toggleTeacherService = (serviceId: string) => {
    setTeacherDraft((d) => ({
      ...d,
      serviceIds: d.serviceIds.includes(serviceId)
        ? d.serviceIds.filter((id) => id !== serviceId)
        : [...d.serviceIds, serviceId],
    }));
  };

  const submitTeacher = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!teacherDraft.name.trim() || !teacherDraft.role.trim() || !teacherDraft.bio.trim()) return;

    const payload = {
      name: teacherDraft.name.trim(),
      role: teacherDraft.role.trim(),
      years: Number(teacherDraft.years),
      bio: teacherDraft.bio.trim(),
      photo: teacherDraft.photo.trim(),
      serviceIds: teacherDraft.serviceIds,
    };

    try {
      const response = await fetch("/api/admin/teachers", {
        method: editingTeacherId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTeacherId ? { id: editingTeacherId, ...payload } : payload),
      });
      const data = (await response.json()) as { teacher?: Teacher };

      if (response.ok && data.teacher) {
        setTeachers((current) =>
          editingTeacherId
            ? current.map((teacher) => (teacher.id === editingTeacherId ? data.teacher! : teacher))
            : [data.teacher!, ...current]
        );
      }
    } catch {
      /* ignore */
    }

    setShowTeacherForm(false);
    setEditingTeacherId(null);
    setTeacherDraft({ name: "", role: "", years: "0", bio: "", photo: "", serviceIds: [] });
  };

  const deleteTeacher = async (id: string) => {
    const previousTeachers = teachers;
    setTeachers((current) => current.filter((teacher) => teacher.id !== id));

    try {
      const response = await fetch(`/api/admin/teachers?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setTeachers(previousTeachers);
      }
    } catch {
      setTeachers(previousTeachers);
    }
  };

  const openServiceForm = (service?: ServiceItem) => {
    if (service) {
      setEditingServiceId(service.id);
      setServiceDraft({ title: service.title, description: service.description, photo: service.photo });
    } else {
      setEditingServiceId(null);
      setServiceDraft({ title: "", description: "", photo: "" });
    }
    setShowServiceForm(true);
  };

  const submitService = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!serviceDraft.title.trim()) return;

    const payload = {
      title: serviceDraft.title.trim(),
      description: serviceDraft.description.trim(),
      photo: serviceDraft.photo.trim(),
    };

    try {
      const response = await fetch("/api/admin/services", {
        method: editingServiceId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingServiceId ? { id: editingServiceId, ...payload } : payload),
      });
      const data = (await response.json()) as { service?: ServiceItem };

      if (response.ok && data.service) {
        setServices((current) =>
          editingServiceId
            ? current.map((service) => (service.id === editingServiceId ? data.service! : service))
            : [data.service!, ...current]
        );
      }
    } catch {
      const fallbackService: ServiceItem = {
        id: editingServiceId ?? makeId(),
        title: serviceDraft.title.trim(),
        description: serviceDraft.description.trim(),
        photo: serviceDraft.photo.trim() || "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=900",
      };

      setServices((current) =>
        editingServiceId
          ? current.map((service) => (service.id === editingServiceId ? fallbackService : service))
          : [fallbackService, ...current]
      );
      saveToStorage(SERVICES_KEY, editingServiceId ? services.map((service) => (service.id === editingServiceId ? fallbackService : service)) : [fallbackService, ...services]);
    }

    setShowServiceForm(false);
    setEditingServiceId(null);
    setServiceDraft({ title: "", description: "", photo: "" });
  };

  const deleteService = async (id: string) => {
    const previousServices = services;
    setServices((current) => current.filter((s) => s.id !== id));

    try {
      const response = await fetch(`/api/admin/services?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setServices(previousServices);
      }
    } catch {
      setServices(previousServices);
    }
  };

  const openCouponForm = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCouponId(coupon.id);
      setCouponDraft({
        code: coupon.code,
        discountType: coupon.discountType,
        value: String(coupon.value),
        expiresAt: coupon.expiresAt ?? "",
        active: String(coupon.active),
        usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "",
      });
    } else {
      setEditingCouponId(null);
      setCouponDraft({ code: "", discountType: "percent", value: "10", expiresAt: "", active: "true", usageLimit: "" });
    }
    setShowCouponForm(true);
  };

  const submitCoupon = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!couponDraft.code.trim()) return;

    const payload = {
      code: couponDraft.code.trim(),
      discountType: couponDraft.discountType,
      value: Number(couponDraft.value),
      expiresAt: couponDraft.expiresAt,
      active: couponDraft.active === "true",
      usageLimit: couponDraft.usageLimit ? Number(couponDraft.usageLimit) : undefined,
    };

    try {
      const response = await fetch("/api/admin/coupons", {
        method: editingCouponId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCouponId ? { id: editingCouponId, ...payload } : payload),
      });
      const data = (await response.json()) as { coupon?: Coupon };

      if (response.ok && data.coupon) {
        setCoupons((current) =>
          editingCouponId
            ? current.map((coupon) => (coupon.id === editingCouponId ? data.coupon! : coupon))
            : [data.coupon!, ...current]
        );
      }
    } catch {
      /* ignore */
    }

    setShowCouponForm(false);
    setEditingCouponId(null);
    setCouponDraft({ code: "", discountType: "percent", value: "10", expiresAt: "", active: "true", usageLimit: "" });
  };

  const deleteCoupon = async (id: string) => {
    const previousCoupons = coupons;
    setCoupons((current) => current.filter((coupon) => coupon.id !== id));

    try {
      const response = await fetch(`/api/admin/coupons?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setCoupons(previousCoupons);
      }
    } catch {
      setCoupons(previousCoupons);
    }
  };

  if (!session) {
    return (
      <main className="admin-page">
        <div className="admin-loading">Түр хүлээнэ үү…</div>
      </main>
    );
  }

  const navItems: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview", label: "Ерөнхий тойм", icon: "overview" },
    { key: "users", label: "Хэрэглэгчид", icon: "users" },
    { key: "bookings", label: "Цаг захиалга", icon: "bookings" },
    { key: "teachers", label: "Бариачид", icon: "users" },
    { key: "services", label: "Үйлчилгээ", icon: "services" },
    { key: "coupons", label: "Купон", icon: "coupons" },
  ];

  return (
    <main className="admin-page">
      <aside className={`admin-sidebar${mobileNavOpen ? " mobile-open" : ""}`}>
        <div className="admin-sidebar-topline">
          <div className="admin-sidebar-brand">
            <Image className="admin-sidebar-logo" src="/logo.jpg" alt="АНГИЖРАЛ" width={40} height={40} />
            <div>
              <strong>АНГИЖРАЛ</strong>
              <span>Админ самбар</span>
            </div>
          </div>

          <button
            type="button"
            className={`admin-nav-toggle${mobileNavOpen ? " open" : ""}`}
            aria-expanded={mobileNavOpen}
            aria-controls="admin-primary-nav"
            aria-label={mobileNavOpen ? "Цэс хаах" : "Цэс нээх"}
            onClick={() => setMobileNavOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav id="admin-primary-nav" className="admin-nav" aria-label="Админ цэс">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={tab === item.key ? "active" : ""}
              onClick={() => {
                setTab(item.key);
                setMobileNavOpen(false);
              }}
            >
              <span className="admin-nav-icon">
                <Icon name={item.icon} />
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <Link href="/" onClick={() => setMobileNavOpen(false)}>
            <span className="admin-nav-icon">
              <Icon name="home" />
            </span>
            Нүүр хуудас руу очих
          </Link>
          <button type="button" className="admin-logout" onClick={handleLogout}>
            <span className="admin-nav-icon">
              <Icon name="logout" />
            </span>
            Гарах
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <div className="admin-topbar">
          <div>
            <p className="admin-eyebrow">Админ эрх</p>
            <h1>
              {tab === "overview" && "Ерөнхий тойм"}
              {tab === "users" && "Хэрэглэгчид"}
              {tab === "bookings" && "Цаг захиалга"}
              {tab === "teachers" && "Бариачид"}
              {tab === "services" && "Үйлчилгээ"}
              {tab === "coupons" && "Купон"}
            </h1>
          </div>
        </div>

        {tab === "overview" && (
          <>
            <div className="admin-stats-grid">
              <StatCard icon="users" value={users.length} label="Нийт хэрэглэгч" />
              <StatCard icon="bookings" value={pendingCount} label="Хүлээгдэж буй захиалга" />
              <StatCard icon="overview" value={confirmedCount} label="Баталгаажсан захиалга" />
              <StatCard icon="users" value={teachers.length} label="Бариач" />
              <StatCard icon="services" value={services.length} label="Идэвхтэй үйлчилгээ" />
              <StatCard icon="coupons" value={coupons.length} label="Купон" />
            </div>

            <section className="admin-panel">
              <div className="admin-panel-head">
                <h2>Сүүлийн захиалгууд</h2>
                <button type="button" className="admin-link-button" onClick={() => setTab("bookings")}>
                  Бүгдийг харах
                </button>
              </div>

              {recentBookings.length === 0 ? (
                <p className="admin-empty-state">Одоогоор захиалга алга байна.</p>
              ) : (
                <>
                  <div className="admin-table-wrap" ref={recentBookingsWrapRef}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Нэр</th>
                          <th>Утас</th>
                          <th>Үйлчилгээ</th>
                          <th>Огноо</th>
                          <th>Төлөв</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((b) => (
                          <tr key={b.id}>
                            <td data-label="Нэр">{b.name}</td>
                            <td data-label="Утас">{b.phone}</td>
                            <td data-label="Үйлчилгээ">{b.service}</td>
                            <td data-label="Огноо">{b.preferredDate}</td>
                            <td data-label="Төлөв">
                              <span className={`admin-badge ${statusBadgeClass(b.status)}`}>{b.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {recentBookings.length > 1 && (
                    <div className="admin-card-nav">
                      <button type="button" aria-label="Өмнөх" onClick={() => scrollCards(recentBookingsWrapRef, -1)}>‹</button>
                      <button type="button" aria-label="Дараах" onClick={() => scrollCards(recentBookingsWrapRef, 1)}>›</button>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}

        {tab === "users" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Бүртгэлтэй хэрэглэгчид</h2>
              <div className="admin-search-wrap">
                <span className="admin-search-icon">
                  <Icon name="search" />
                </span>
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Хайх"
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                />
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <p className="admin-empty-state">Хайлтад тохирох хэрэглэгч олдсонгүй.</p>
            ) : (
              <>
              <div className="admin-table-wrap" ref={usersWrapRef}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Нэр</th>
                      <th>И-мэйл</th>
                      <th>Утас</th>
                      <th>Эрх</th>
                      <th>Элссэн огноо</th>
                      <th aria-label="Үйлдэл" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td data-label="Нэр">{u.name}</td>
                        <td data-label="И-мэйл">{u.email}</td>
                        <td data-label="Утас">{u.phone}</td>
                        <td data-label="Эрх">
                          <span className={`admin-badge ${u.role === "admin" ? "role-admin" : "role-user"}`}>
                            {u.role === "admin" ? "Админ" : "Хэрэглэгч"}
                          </span>
                        </td>
                        <td data-label="Элссэн огноо">{u.joinedAt}</td>
                        <td data-label="Үйлдэл" className="admin-table-actions-cell">
                          <div className="admin-row-actions">
                            <button type="button" className="admin-text-action" onClick={() => toggleRole(u.id)}>
                              {u.role === "admin" ? "Админ эрх хасах" : "Админ болгох"}
                            </button>
                            <button
                              type="button"
                              className="admin-icon-btn danger"
                              aria-label="Устгах"
                              onClick={() => deleteUser(u.id)}
                            >
                              <Icon name="trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length > 1 && (
                <div className="admin-card-nav">
                  <button type="button" aria-label="Өмнөх" onClick={() => scrollCards(usersWrapRef, -1)}>‹</button>
                  <button type="button" aria-label="Дараах" onClick={() => scrollCards(usersWrapRef, 1)}>›</button>
                </div>
              )}
              </>
            )}
          </section>
        )}

        {tab === "bookings" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Цаг захиалгууд</h2>
              <button type="button" className="admin-primary-btn" onClick={() => setShowBookingForm((open) => !open)}>
                <Icon name="plus" />
                Захиалга нэмэх
              </button>
            </div>

            {showBookingForm && (
              <form className="admin-inline-form" onSubmit={submitBooking}>
                <div className="admin-form-grid">
                  <div className="form-field">
                    <label>Нэр</label>
                    <input
                      type="text"
                      value={bookingDraft.name}
                      onChange={(event) => setBookingDraft((d) => ({ ...d, name: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Утас</label>
                    <input
                      type="tel"
                      value={bookingDraft.phone}
                      onChange={(event) => setBookingDraft((d) => ({ ...d, phone: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Үйлчилгээ</label>
                    <Dropdown
                      value={bookingDraft.service}
                      onChange={(value) => setBookingDraft((d) => ({ ...d, service: value }))}
                      options={services.map((s) => ({ value: s.title, label: s.title }))}
                    />
                  </div>
                  <div className="form-field">
                    <label>Бариач</label>
                    <Dropdown
                      value={bookingDraft.specialist}
                      onChange={(value) => setBookingDraft((d) => ({ ...d, specialist: value }))}
                      options={teachers.map((teacher) => ({ value: teacher.name, label: teacher.name }))}
                    />
                  </div>
                  <div className="form-field">
                    <label>Огноо</label>
                    <DatePicker
                      value={bookingDraft.preferredDate}
                      onChange={(value) => setBookingDraft((d) => ({ ...d, preferredDate: value }))}
                    />
                  </div>
                  <div className="form-field">
                    <label>Цаг</label>
                    <TimePicker
                      value={bookingDraft.time}
                      onChange={(value) => setBookingDraft((d) => ({ ...d, time: value }))}
                    />
                  </div>
                  <div className="form-field admin-form-field-wide">
                    <label>Тэмдэглэл</label>
                    <input
                      type="text"
                      value={bookingDraft.note}
                      onChange={(event) => setBookingDraft((d) => ({ ...d, note: event.target.value }))}
                      placeholder="Нэмэлт мэдээлэл (сонголтоор)"
                    />
                  </div>
                </div>
                <div className="admin-form-actions">
                  <button type="button" className="admin-secondary-btn" onClick={() => setShowBookingForm(false)}>
                    Цуцлах
                  </button>
                  <button type="submit" className="admin-primary-btn">
                    Хадгалах
                  </button>
                </div>
              </form>
            )}

            <div className="admin-filter-tabs">
              {(["Бүгд", "хүлээгдэж буй", "баталгаажсан", "цуцлагдсан"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`admin-filter-tab${bookingFilter === status ? " active" : ""}`}
                  onClick={() => setBookingFilter(status)}
                >
                  {status === "Бүгд" ? "Бүгд" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {filteredBookings.length === 0 ? (
              <p className="admin-empty-state">Энэ төлөвт тохирох захиалга алга байна.</p>
            ) : (
              <>
              <div className="admin-table-wrap" ref={bookingsWrapRef}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Нэр</th>
                      <th>Утас</th>
                      <th>Үйлчилгээ</th>
                      <th>Мэргэжилтэн</th>
                      <th>Огноо</th>
                      <th>Купон</th>
                      <th>Дүн</th>
                      <th>Тэмдэглэл</th>
                      <th>Төлөв</th>
                      <th aria-label="Үйлдэл" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={b.id}>
                        <td data-label="Нэр">{b.name}</td>
                        <td data-label="Утас">{b.phone}</td>
                        <td data-label="Үйлчилгээ">{b.service}</td>
                        <td data-label="Мэргэжилтэн">{b.specialist || "—"}</td>
                        <td data-label="Огноо">{b.preferredDate}{b.time ? `, ${b.time}` : ""}</td>
                        <td data-label="Купон">{b.couponCode || "—"}</td>
                        <td data-label="Дүн">{formatMoney(b.totalAmount ?? b.servicePrice)}</td>
                        <td data-label="Тэмдэглэл">{b.note || "—"}</td>
                        <td data-label="Төлөв">
                          <span className={`admin-badge ${statusBadgeClass(b.status)}`}>{b.status}</span>
                        </td>
                        <td data-label="Үйлдэл" className="admin-table-actions-cell">
                          <div className="admin-row-actions">
                            {b.status !== "баталгаажсан" && (
                              <button
                                type="button"
                                className="admin-text-action confirm"
                                onClick={() => setBookingStatus(b.id, "баталгаажсан")}
                              >
                                Баталгаажуулах
                              </button>
                            )}
                            {b.status !== "цуцлагдсан" && (
                              <button
                                type="button"
                                className="admin-text-action cancel"
                                onClick={() => setBookingStatus(b.id, "цуцлагдсан")}
                              >
                                Цуцлах
                              </button>
                            )}
                            <button
                              type="button"
                              className="admin-icon-btn danger"
                              aria-label="Устгах"
                              onClick={() => deleteBooking(b.id)}
                            >
                              <Icon name="trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredBookings.length > 1 && (
                <div className="admin-card-nav">
                  <button type="button" aria-label="Өмнөх" onClick={() => scrollCards(bookingsWrapRef, -1)}>‹</button>
                  <button type="button" aria-label="Дараах" onClick={() => scrollCards(bookingsWrapRef, 1)}>›</button>
                </div>
              )}
              </>
            )}
          </section>
        )}

        {tab === "teachers" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Бариачдын мэдээлэл</h2>
              <button type="button" className="admin-primary-btn" onClick={() => openTeacherForm()}>
                <Icon name="plus" />
                Бариач нэмэх
              </button>
            </div>

            {showTeacherForm && (
              <form className="admin-inline-form" onSubmit={submitTeacher}>
                <div className="admin-form-grid">
                  <div className="form-field">
                    <label>Нэр</label>
                    <input
                      type="text"
                      value={teacherDraft.name}
                      onChange={(event) => setTeacherDraft((d) => ({ ...d, name: event.target.value }))}
                      placeholder="Жишээ: Б.Бат-Эрдэнэ"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Албан тушаал</label>
                    <input
                      type="text"
                      value={teacherDraft.role}
                      onChange={(event) => setTeacherDraft((d) => ({ ...d, role: event.target.value }))}
                      placeholder="Бариач"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Туршлага (жил)</label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={teacherDraft.years}
                      onChange={(event) => setTeacherDraft((d) => ({ ...d, years: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Зургийн холбоос (URL)</label>
                    <input
                      type="url"
                      value={teacherDraft.photo}
                      onChange={(event) => setTeacherDraft((d) => ({ ...d, photo: event.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-field admin-form-field-wide">
                    <label>Тайлбар</label>
                    <textarea
                      value={teacherDraft.bio}
                      onChange={(event) => setTeacherDraft((d) => ({ ...d, bio: event.target.value }))}
                      placeholder="Мэргэшил, туршлага, үзүүлэх үйлчилгээний товч тайлбар"
                      required
                    />
                  </div>
                  <div className="form-field admin-form-field-wide">
                    <label>Ямар үйлчилгээ хариуцдаг вэ?</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 18px" }}>
                      {services.map((s) => (
                        <label
                          key={s.id}
                          style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
                        >
                          <input
                            type="checkbox"
                            className="admin-checkbox"
                            checked={teacherDraft.serviceIds.includes(s.id)}
                            onChange={() => toggleTeacherService(s.id)}
                          />
                          <span>{s.title}</span>
                        </label>
                      ))}
                      {services.length === 0 && (
                        <p className="admin-empty-state">Эхлээд "Үйлчилгээ" хэсэгт үйлчилгээ нэмнэ үү.</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="admin-form-actions">
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={() => {
                      setShowTeacherForm(false);
                      setEditingTeacherId(null);
                    }}
                  >
                    Цуцлах
                  </button>
                  <button type="submit" className="admin-primary-btn">
                    {editingTeacherId ? "Шинэчлэх" : "Хадгалах"}
                  </button>
                </div>
              </form>
            )}

            {teachers.length === 0 ? (
              <p className="admin-empty-state">Одоогоор бариач нэмээгүй байна.</p>
            ) : (
              <>
              <div className="admin-services-grid" ref={teachersGridRef}>
                {teachers.map((teacher) => (
                  <article className="admin-service-card" key={teacher.id}>
                    {teacher.photo ? (
                      <Image className="admin-teacher-photo" src={teacher.photo} alt={teacher.name} width={120} height={120} />
                    ) : (
                      <div className="admin-teacher-photo fallback" aria-hidden="true">
                        {teacher.initials}
                      </div>
                    )}
                    <div className="admin-service-body">
                      <h3>{teacher.name}</h3>
                      <p>
                        {teacher.role} · {teacher.years} жил
                      </p>
                      <p className="admin-teacher-bio">{teacher.bio}</p>
                      <p style={{ fontSize: "13px", opacity: 0.75 }}>
                        {teacher.serviceIds && teacher.serviceIds.length > 0
                          ? teacher.serviceIds
                              .map((id) => services.find((s) => s.id === id)?.title)
                              .filter(Boolean)
                              .join(", ")
                          : "Үйлчилгээ сонгоогүй"}
                      </p>
                      <div className="admin-service-actions">
                        <button
                          type="button"
                          className="admin-icon-btn"
                          aria-label="Засах"
                          onClick={() => openTeacherForm(teacher)}
                        >
                          <Icon name="edit" />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn danger"
                          aria-label="Устгах"
                          onClick={() => deleteTeacher(teacher.id)}
                        >
                          <Icon name="trash" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {teachers.length > 1 && (
                <div className="admin-card-nav">
                  <button type="button" aria-label="Өмнөх" onClick={() => scrollGridCards(teachersGridRef, -1)}>‹</button>
                  <button type="button" aria-label="Дараах" onClick={() => scrollGridCards(teachersGridRef, 1)}>›</button>
                </div>
              )}
              </>
            )}
          </section>
        )}

        {tab === "services" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Санал болгох үйлчилгээнүүд</h2>
              <button type="button" className="admin-primary-btn" onClick={() => openServiceForm()}>
                <Icon name="plus" />
                Үйлчилгээ нэмэх
              </button>
            </div>

            {showServiceForm && (
              <form className="admin-inline-form" onSubmit={submitService}>
                <div className="admin-form-grid">
                  <div className="form-field">
                    <label>Гарчиг</label>
                    <input
                      type="text"
                      value={serviceDraft.title}
                      onChange={(event) => setServiceDraft((d) => ({ ...d, title: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Зургийн холбоос (URL)</label>
                    <input
                      type="text"
                      value={serviceDraft.photo}
                      onChange={(event) => setServiceDraft((d) => ({ ...d, photo: event.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="form-field admin-form-field-wide">
                    <label>Тайлбар</label>
                    <input
                      type="text"
                      value={serviceDraft.description}
                      onChange={(event) => setServiceDraft((d) => ({ ...d, description: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="admin-form-actions">
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={() => {
                      setShowServiceForm(false);
                      setEditingServiceId(null);
                    }}
                  >
                    Цуцлах
                  </button>
                  <button type="submit" className="admin-primary-btn">
                    {editingServiceId ? "Шинэчлэх" : "Хадгалах"}
                  </button>
                </div>
              </form>
            )}

            {services.length === 0 ? (
              <p className="admin-empty-state">Одоогоор үйлчилгээ нэмээгүй байна.</p>
            ) : (
              <>
              <div className="admin-services-grid" ref={servicesGridRef}>
                {services.map((s) => (
                  <article className="admin-service-card" key={s.id}>
                    <div className="admin-service-photo" style={{ backgroundImage: `url("${s.photo}")` }} aria-hidden="true" />
                    <div className="admin-service-body">
                      <h3>{s.title}</h3>
                      <p>{s.description}</p>
                      <div className="admin-service-actions">
                        <button type="button" className="admin-icon-btn" aria-label="Засах" onClick={() => openServiceForm(s)}>
                          <Icon name="edit" />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn danger"
                          aria-label="Устгах"
                          onClick={() => deleteService(s.id)}
                        >
                          <Icon name="trash" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {services.length > 1 && (
                <div className="admin-card-nav">
                  <button type="button" aria-label="Өмнөх" onClick={() => scrollGridCards(servicesGridRef, -1)}>‹</button>
                  <button type="button" aria-label="Дараах" onClick={() => scrollGridCards(servicesGridRef, 1)}>›</button>
                </div>
              )}
              </>
            )}
          </section>
        )}

        {tab === "coupons" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <h2>Купон кодууд</h2>
              <button type="button" className="admin-primary-btn" onClick={() => openCouponForm()}>
                <Icon name="plus" />
                Купон нэмэх
              </button>
            </div>

            {showCouponForm && (
              <form className="admin-inline-form" onSubmit={submitCoupon}>
                <div className="admin-form-grid">
                  <div className="form-field">
                    <label>Код</label>
                    <input
                      type="text"
                      value={couponDraft.code}
                      onChange={(event) => setCouponDraft((d) => ({ ...d, code: event.target.value.toUpperCase() }))}
                      placeholder="WELCOME10"
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Төрөл</label>
                    <Dropdown
                      value={couponDraft.discountType}
                      onChange={(value) =>
                        setCouponDraft((d) => ({ ...d, discountType: value as CouponDiscountType }))
                      }
                      options={[
                        { value: "percent", label: "Хувь (%)" },
                        { value: "amount", label: "Мөнгөн дүн (₮)" },
                      ]}
                    />
                  </div>
                  <div className="form-field">
                    <label>Хэмжээ</label>
                    <input
                      type="number"
                      min="1"
                      max={couponDraft.discountType === "percent" ? "100" : undefined}
                      value={couponDraft.value}
                      onChange={(event) => setCouponDraft((d) => ({ ...d, value: event.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Дуусах огноо</label>
                    <DatePicker
                      value={couponDraft.expiresAt}
                      onChange={(value) => setCouponDraft((d) => ({ ...d, expiresAt: value }))}
                    />
                  </div>
                  <div className="form-field">
                    <label>Ашиглах лимит</label>
                    <input
                      type="number"
                      min="1"
                      value={couponDraft.usageLimit}
                      onChange={(event) => setCouponDraft((d) => ({ ...d, usageLimit: event.target.value }))}
                      placeholder="Хязгааргүй"
                    />
                  </div>
                  <div className="form-field">
                    <label>Төлөв</label>
                    <Dropdown
                      value={couponDraft.active}
                      onChange={(value) => setCouponDraft((d) => ({ ...d, active: value }))}
                      options={[
                        { value: "true", label: "Идэвхтэй" },
                        { value: "false", label: "Идэвхгүй" },
                      ]}
                    />
                  </div>
                </div>
                <div className="admin-form-actions">
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={() => {
                      setShowCouponForm(false);
                      setEditingCouponId(null);
                    }}
                  >
                    Цуцлах
                  </button>
                  <button type="submit" className="admin-primary-btn">
                    {editingCouponId ? "Шинэчлэх" : "Хадгалах"}
                  </button>
                </div>
              </form>
            )}

            {coupons.length === 0 ? (
              <p className="admin-empty-state">Одоогоор купон нэмээгүй байна.</p>
            ) : (
              <>
              <div className="admin-table-wrap" ref={couponsWrapRef}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Код</th>
                      <th>Хөнгөлөлт</th>
                      <th>Ашиглалт</th>
                      <th>Дуусах</th>
                      <th>Төлөв</th>
                      <th aria-label="Үйлдэл" />
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((coupon) => (
                      <tr key={coupon.id}>
                        <td data-label="Код">{coupon.code}</td>
                        <td data-label="Хөнгөлөлт">{formatCouponValue(coupon)}</td>
                        <td data-label="Ашиглалт">
                          {coupon.usedCount}
                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                        </td>
                        <td data-label="Дуусах">{coupon.expiresAt || "—"}</td>
                        <td data-label="Төлөв">
                          <span className={`admin-badge ${coupon.active ? "confirmed" : "cancelled"}`}>
                            {coupon.active ? "Идэвхтэй" : "Идэвхгүй"}
                          </span>
                        </td>
                        <td data-label="Үйлдэл" className="admin-table-actions-cell">
                          <div className="admin-row-actions">
                            <button
                              type="button"
                              className="admin-icon-btn"
                              aria-label="Засах"
                              onClick={() => openCouponForm(coupon)}
                            >
                              <Icon name="edit" />
                            </button>
                            <button
                              type="button"
                              className="admin-icon-btn danger"
                              aria-label="Устгах"
                              onClick={() => deleteCoupon(coupon.id)}
                            >
                              <Icon name="trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {coupons.length > 1 && (
                <div className="admin-card-nav">
                  <button type="button" aria-label="Өмнөх" onClick={() => scrollCards(couponsWrapRef, -1)}>‹</button>
                  <button type="button" aria-label="Дараах" onClick={() => scrollCards(couponsWrapRef, 1)}>›</button>
                </div>
              )}
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}