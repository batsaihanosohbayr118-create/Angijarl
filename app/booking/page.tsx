"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import styles from "./booking.module.css";

const navItems = ["Нүүр", "Бидний тухай", "Үйлчилгээ", "Бариачид", "Цаг захиалах"];

const navServices = [
  ["Оффис бариа засал", "/services/office-massage"],
  ["Хоол зүйн сургалт", "/services/nutrition"],
  ["Байгууллагын бясалгал", "/services/meditation"],
  ["Сэтгэл зүйн сургалт", "/services/psychology"],
] as const;

const navHref = (item: string) => {
  if (item === "Нүүр") return "/";
  if (item === "Бидний тухай") return "/about";
  if (item === "Бариачид") return "/teachers";
  if (item === "Цаг захиалах") return "/booking";
  return "/";
};

type Specialist = {
  id: string;
  name: string;
  role: string;
  years: number;
  photo: string;
  initials: string;
  serviceIds?: string[];
};

const defaultSpecialists: Specialist[] = [
  {
    id: "teacher-bat-erdene",
    name: "Б.Бат-Эрдэнэ",
    role: "Ахлах бариач",
    years: 15,
    photo: "https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=700",
    initials: "Б",
  },
  {
    id: "teacher-enkhtuyaa",
    name: "Ц.Энхтуяа",
    role: "Бариач",
    years: 10,
    photo: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=700",
    initials: "Ц",
  },
  {
    id: "teacher-orgil",
    name: "Г.Оргил",
    role: "Бариач",
    years: 8,
    photo: "https://images.pexels.com/photos/6627534/pexels-photo-6627534.jpeg?auto=compress&cs=tinysrgb&w=700",
    initials: "Г",
  },
];

type SessionState = { role: "user" | "admin"; name: string } | null;

let cachedSessionSnapshot: SessionState = null;

const services = [
  { id: "office-massage", title: "Оффис бариа засал", price: "60,000₮", priceAmount: 60000 },
  { id: "nutrition", title: "Хоол зүйн сургалт", price: "40,000₮", priceAmount: 40000 },
  { id: "meditation", title: "Байгууллагын бясалгал", price: "50,000₮", priceAmount: 50000 },
  { id: "psychology", title: "Сэтгэл зүйн сургалт", price: "45,000₮", priceAmount: 45000 },
];

const getSessionSnapshot = (): SessionState => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem("angijral_session");
    const next = raw ? (JSON.parse(raw) as SessionState) : null;

    if (!next) {
      cachedSessionSnapshot = null;
      return null;
    }

    const sameSession =
      cachedSessionSnapshot &&
      cachedSessionSnapshot.role === next.role &&
      cachedSessionSnapshot.name === next.name
        ? cachedSessionSnapshot
        : next;

    cachedSessionSnapshot = sameSession;
    return sameSession;
  } catch {
    cachedSessionSnapshot = null;
    return null;
  }
};

const subscribeToSession = (callback: () => void) => {
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

const dowNames = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
const monthNames = [
  "1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар",
  "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар",
];
const timeSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "13:30", "14:30", "15:30", "16:00", "17:00"];

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function StepIcon({ type }: { type: "service" | "specialist" | "calendar" | "user" | "check" }) {
  if (type === "service") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "specialist") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 19c1.2-3.4 4-5 7-5s5.8 1.6 7 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "calendar") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 9.5h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "user") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 9.5h10M7 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 13l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const contactItems = [
  ["phone", "9127 1178", undefined],
  ["mail", "angijraltuv@yahoo.com", "mailto:angijraltuv@yahoo.com"],
  ["messenger", "Ангижрал сургалт Angijral surgalt", "https://m.me/angijral"],
] as const;

function ContactIcon({ type }: { type: "phone" | "mail" | "messenger" | "address" }) {
  if (type === "phone") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.5c0-.6.4-1 1-1H7.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1L6.6 10.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "mail") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="m4 6.5 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "address") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3C6.98 3 3 6.69 3 11.25c0 2.6 1.31 4.92 3.36 6.44V21l3.07-1.69c.82.23 1.68.35 2.57.35 5.02 0 9-3.69 9-8.25S17.02 3 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m7.8 12.4 2.7-2.85 2.4 1.8 2.7-2.85-2.7 3.9-2.4-1.8-2.7 2.85Z" fill="currentColor" />
    </svg>
  );
}

type ServiceT = (typeof services)[number];
type AppliedCoupon = {
  code: string;
  discountAmount: number;
  totalAmount: number;
};

function formatMoney(amount: number) {
  return `${new Intl.NumberFormat("mn-MN").format(amount)}₮`;
}

export default function BookingPage() {
  const router = useRouter();
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    window.localStorage.removeItem("angijral_session");
    window.dispatchEvent(new Event("angijral-session-change"));
    setProfileOpen(false);
    router.push("/login");
  };

  useEffect(() => {
    if (!servicesOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [servicesOpen]);

  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const [step, setStep] = useState(1);
  const [service, setService] = useState<ServiceT | null>(null);
  const [specialists, setSpecialists] = useState<Specialist[]>(defaultSpecialists);
  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [dbServiceIdByTitle, setDbServiceIdByTitle] = useState<Record<string, string>>({});
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const today = useMemo(() => new Date(), []);
  const viewDate = useMemo(
    () => new Date(today.getFullYear(), today.getMonth() + monthOffset, 1),
    [today, monthOffset]
  );

  const calendarCells = useMemo(() => {
    const startDow = (viewDate.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = Array(startDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
    }
    return cells;
  }, [viewDate]);

  useEffect(() => {
    const loadSpecialists = async () => {
      try {
        const response = await fetch("/api/teachers");
        const data = (await response.json()) as { teachers?: Specialist[] };
        if (response.ok && Array.isArray(data.teachers) && data.teachers.length > 0) {
          setSpecialists(data.teachers);
        }
      } catch {
        setSpecialists(defaultSpecialists);
      }
    };

    void loadSpecialists();
  }, []);

  useEffect(() => {
    const loadDbServices = async () => {
      try {
        const response = await fetch("/api/services");
        const data = (await response.json()) as { services?: { id: string; title: string }[] };
        if (response.ok && Array.isArray(data.services)) {
          const map: Record<string, string> = {};
          for (const s of data.services) map[s.title.trim()] = s.id;
          setDbServiceIdByTitle(map);
        }
      } catch {
        setDbServiceIdByTitle({});
      }
    };

    void loadDbServices();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadBookedTimes = async () => {
      setLoadingTimes(true);

      if (!selectedDate || !specialist) {
        setBookedTimes([]);
        setLoadingTimes(false);
        return;
      }

      try {
        const params = new URLSearchParams({
          date: formatDateKey(selectedDate),
          specialist: specialist.name,
        });
        const response = await fetch(`/api/booking?${params.toString()}`, { signal: controller.signal });
        const data = (await response.json()) as { times?: string[] };
        setBookedTimes(response.ok && Array.isArray(data.times) ? data.times : []);
      } catch {
        if (!controller.signal.aborted) setBookedTimes([]);
      } finally {
        if (!controller.signal.aborted) setLoadingTimes(false);
      }
    };

    void loadBookedTimes();
    return () => controller.abort();
  }, [selectedDate, specialist]);

  const resolvedBookedTimes = selectedDate && specialist ? bookedTimes : [];
  const selectedTimeIsUnavailable = !!selectedTime && resolvedBookedTimes.includes(selectedTime);
  const servicePrice = service?.priceAmount ?? 0;

  const filteredSpecialists = useMemo(() => {
    if (!service) return specialists;
    const dbServiceId = dbServiceIdByTitle[service.title];
    return specialists.filter((s) => {
      // Хэрэв бариачид ямар нэгэн үйлчилгээ оноогоогүй бол (хуучин өгөгдөл г.м.) бүх үйлчилгээнд харагдана
      if (!s.serviceIds || s.serviceIds.length === 0) return true;
      if (!dbServiceId) return true;
      return s.serviceIds.includes(dbServiceId);
    });
  }, [specialists, service, dbServiceIdByTitle]);

  useEffect(() => {
    if (specialist && !filteredSpecialists.some((s) => s.id === specialist.id)) {
      setSpecialist(null);
    }
  }, [filteredSpecialists, specialist]);
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const totalAmount = service ? appliedCoupon?.totalAmount ?? servicePrice : 0;

  useEffect(() => {
    setAppliedCoupon(null);
    setCouponError(null);
  }, [service]);

  function canGoNext() {
    if (step === 1) return !!service;
    if (step === 2) return !!specialist;
    if (step === 3) return !!selectedDate && !!selectedTime;
    if (step === 4) return name.trim().length > 0 && phone.trim().length > 0;
    return false;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          service: service?.title,
          specialist: specialist?.name,
          preferredDate: selectedDate ? formatDateKey(selectedDate) : null,
          time: selectedTime,
          note,
          servicePrice,
          couponCode: appliedCoupon?.code,
        }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(data?.error ?? "Захиалга илгээх үед алдаа гарлаа. Дахин оролдоно уу.");
        return;
      }
      setSubmitted(true);
      setStep(5);
    } catch {
      setError("Сүлжээний алдаа гарлаа. Та түр хүлээгээд дахин оролдоно уу.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  }

  async function applyCoupon() {
    if (!service) {
      setCouponError("Эхлээд үйлчилгээ сонгоно уу.");
      return;
    }

    const code = couponInput.trim();
    if (!code) {
      setCouponError("Купон кодоо оруулна уу.");
      return;
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: service.priceAmount }),
      });
      const data = (await response.json()) as {
        error?: string;
        coupon?: { code: string };
        discountAmount?: number;
        totalAmount?: number;
      };

      if (!response.ok || !data.coupon) {
        setAppliedCoupon(null);
        setCouponError(data.error ?? "Купон код буруу байна.");
        return;
      }

      setAppliedCoupon({
        code: data.coupon.code,
        discountAmount: Number(data.discountAmount) || 0,
        totalAmount: Number(data.totalAmount) || service.priceAmount,
      });
      setCouponInput(data.coupon.code);
    } catch {
      setAppliedCoupon(null);
      setCouponError("Купон шалгах үед сүлжээний алдаа гарлаа.");
    } finally {
      setCouponLoading(false);
    }
  }

  function clearCoupon() {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponInput("");
  }

  return (
    <div className={styles.page}>
      <header className="site-header">
        <Link className="brand" href="/">
          <Image className="brand-logo" src="/logo.jpg" alt="АНГИЖРАЛ бариа заслын сургалтын төв" width={120} height={40} />
        </Link>

        <nav aria-label="Үндсэн цэс">
          {navItems.map((item) =>
            item === "Үйлчилгээ" ? (
              <div className="nav-dropdown" key={item} ref={servicesRef}>
                <button
                  type="button"
                  className="nav-dropdown-trigger"
                  aria-expanded={servicesOpen}
                  aria-haspopup="true"
                  onClick={() => setServicesOpen((open) => !open)}
                >
                  {item}
                  <span className={`nav-dropdown-chevron${servicesOpen ? " open" : ""}`} aria-hidden="true">
                    <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>

                {servicesOpen && (
                  <div className="nav-dropdown-menu" role="menu">
                    {navServices.map(([label, href]) => (
                      <a href={href} key={label} role="menuitem" onClick={() => setServicesOpen(false)}>
                        {label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a key={item} className={item === "Цаг захиалах" ? "active" : ""} href={navHref(item)}>
                {item}
              </a>
            )
          )}
        </nav>

        {session ? (
          <div className="profile-chip" ref={profileRef}>
            <button
              type="button"
              className="profile-trigger"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              onClick={() => setProfileOpen((open) => !open)}
            >
              <span className="profile-avatar" aria-hidden="true">
                {session.name.trim().charAt(0).toUpperCase() || "Х"}
              </span>
              <span className="profile-name">{session.name}</span>
              <span className={`nav-dropdown-chevron${profileOpen ? " open" : ""}`} aria-hidden="true">
                <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            {profileOpen && (
              <div className="profile-menu" role="menu">
                <div className="profile-menu-info">
                  <strong>{session.name}</strong>
                  <span>{session.role === "admin" ? "Админ эрх" : "Хэрэглэгч"}</span>
                </div>
                {session.role === "admin" && (
                  <a href="/admin" role="menuitem" onClick={() => setProfileOpen(false)}>
                    Админ самбар
                  </a>
                )}
                <button type="button" role="menuitem" className="profile-menu-logout" onClick={handleLogout}>
                  Гарах
                </button>
              </div>
            )}
          </div>
        ) : (
          <a className="login-button" href="/login" aria-label="Нэвтрэх">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <circle cx="12" cy="8.2" r="3.4" stroke="currentColor" strokeWidth="1.6" />
              <path d="M5 19.5c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Нэвтрэх
          </a>
        )}
      </header>

      <div className={styles.banner}>
        <h1>Цаг захиалах</h1>
        <p>Үйлчилгээ, бариачаа сонгоод, өөрт тохиромжтой цагаа захиалаарай.</p>
      </div>

      <div className={styles.wrap}>
        <ol className={styles.stepper}>
          {[
            { n: 1, label: "Үйлчилгээ" },
            { n: 2, label: "Бариач" },
            { n: 3, label: "Огноо, цаг" },
            { n: 4, label: "Мэдээлэл" },
          ].map((s) => (
            <li
              key={s.n}
              className={`${styles.step} ${step === s.n ? styles.stepActive : ""} ${
                step > s.n ? styles.stepDone : ""
              }`}
            >
              <span className={styles.ring}>{step > s.n ? "✓" : s.n}</span>
              <span className={styles.stepLabel}>{s.label}</span>
            </li>
          ))}
        </ol>

        <div className={styles.grid}>
          <div className={styles.panel}>
            {step === 1 && (
              <section>
                <h2>Үйлчилгээ сонгох</h2>
                <p className={styles.sub}>Танд тохирох эмчилгээ, сургалтын төрлөө сонгоно уу.</p>
                <div className={styles.serviceGrid}>
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`${styles.svc} ${service?.id === s.id ? styles.selected : ""}`}
                      onClick={() => setService(s)}
                    >
                      <span className={styles.icon}>
                        <StepIcon type="service" />
                      </span>
                      <span>
                        <span className={styles.svcTitle}>{s.title}</span>
                        <span className={styles.svcPrice}>{s.price}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {step === 2 && (
              <section>
                <h2>Бариач сонгох</h2>
                <p className={styles.sub}>Туршлагатай ажилтнуудын аль нэгийг сонгоно уу.</p>
                {filteredSpecialists.length === 0 ? (
                  <p className={styles.sub}>Энэ үйлчилгээг хариуцах бариач одоогоор бүртгэгдээгүй байна.</p>
                ) : (
                  <div className={styles.specGrid}>
                    {filteredSpecialists.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`${styles.spec} ${specialist?.id === s.id ? styles.selected : ""}`}
                        onClick={() => setSpecialist(s)}
                      >
                        {s.photo ? (
                          <Image className={styles.avatar} src={s.photo} alt={s.name} width={80} height={80} />
                        ) : (
                          <span className={styles.avatar}>{s.initials}</span>
                        )}
                        <span className={styles.specName}>{s.name}</span>
                        <span className={styles.specRole}>
                          {s.role} · {s.years} жил
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {step === 3 && (
              <section>
                <h2>Огноо, цаг сонгох</h2>
                <p className={styles.sub}>Сул цагуудаас өөрт тохирохыг сонгоно уу.</p>
                <div className={styles.calRow}>
                  <button type="button" className={styles.navBtn} onClick={() => setMonthOffset((m) => m - 1)}>
                    ‹
                  </button>
                  <span className={styles.monthLabel}>
                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </span>
                  <button type="button" className={styles.navBtn} onClick={() => setMonthOffset((m) => m + 1)}>
                    ›
                  </button>
                </div>
                <div className={styles.days}>
                  {dowNames.map((d) => (
                    <div key={d} className={styles.dow}>
                      {d}
                    </div>
                  ))}
                  {calendarCells.map((cellDate, i) => {
                    if (!cellDate) return <div key={i} />;
                    const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const isSunday = cellDate.getDay() === 0;
                    const isSelected = selectedDate?.toDateString() === cellDate.toDateString();
                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={isPast || isSunday}
                        className={`${styles.day} ${isPast || isSunday ? styles.dayOff : ""} ${
                          isSelected ? styles.daySelected : ""
                        }`}
                        onClick={() => {
                          setSelectedDate(cellDate);
                          setSelectedTime(null);
                        }}
                      >
                        {cellDate.getDate()}
                      </button>
                    );
                  })}
                </div>
                <div className={styles.times}>
                  {!selectedDate && <p className={styles.sub}>Эхлээд огноо сонгоно уу</p>}
                  {selectedDate && loadingTimes && <p className={styles.sub}>Сул цагуудыг шалгаж байна...</p>}
                  {selectedDate &&
                    timeSlots.map((t) => {
                      const isBooked = bookedTimes.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={isBooked || loadingTimes}
                          className={`${styles.time} ${isBooked ? styles.timeBusy : ""} ${
                            selectedTime === t ? styles.timeSelected : ""
                          }`}
                          onClick={() => setSelectedTime(t)}
                          title={isBooked ? "Энэ цаг захиалагдсан байна" : undefined}
                        >
                          {t}
                        </button>
                      );
                    })}
                </div>
              </section>
            )}

            {step === 4 && (
              <section>
                <h2>Холбоо барих мэдээлэл</h2>
                <p className={styles.sub}>Баталгаажуулах мессежийг эдгээр дугаараар илгээнэ.</p>
                <div className={styles.twoCol}>
                  <label className={styles.field}>
                    <span>Овог, нэр</span>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Жишээ: Осгоо Батбаяр" />
                  </label>
                  <label className={styles.field}>
                    <span>Утасны дугаар</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9911-XXXX" />
                  </label>
                </div>
                <label className={styles.field}>
                  <span>Нэмэлт тэмдэглэл (заавал биш)</span>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Анхаарах зүйл байвал бичнэ үү" />
                </label>
                {error && <p className={styles.errorText}>{error}</p>}
              </section>
            )}

            {step === 5 && submitted && (
              <section className={styles.doneScreen}>
                <div className={styles.doneCheck}>
                  <StepIcon type="check" />
                </div>
                <h2>Захиалга илгээгдлээ</h2>
                <p>Таны цаг захиалгыг хүлээн авлаа. Манай ажилтан удахгүй утсаар холбогдож баталгаажуулна.</p>
              </section>
            )}

            {step < 5 && (
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  style={{ visibility: step > 1 ? "visible" : "hidden" }}
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                >
                  ← Буцах
                </button>
                <button type="button" className={styles.btnPrimary} disabled={!canGoNext() || submitting} onClick={handleNext}>
                  {step === 4 ? (submitting ? "Илгээж байна..." : "Захиалга баталгаажуулах") : "Үргэлжлүүлэх →"}
                </button>
              </div>
            )}
          </div>

          <aside className={styles.summary}>
            <h3>Захиалгын хураангуй</h3>
            <div className={styles.sumRow}>
              <span>Үйлчилгээ</span>
              <span>{service?.title ?? "—"}</span>
            </div>
            <div className={styles.sumRow}>
              <span>Бариач</span>
              <span>{specialist?.name ?? "—"}</span>
            </div>
            <div className={styles.sumRow}>
              <span>Огноо</span>
              <span>
                {selectedDate
                  ? `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}, ${selectedDate.getFullYear()}`
                  : "—"}
              </span>
            </div>
            <div className={styles.sumRow}>
              <span>Цаг</span>
              <span>{selectedTime ?? "—"}</span>
            </div>
            <div className={styles.couponBox}>
              <label htmlFor="coupon-code">Купон код</label>
              <div className={styles.couponControls}>
                <input
                  id="coupon-code"
                  value={couponInput}
                  onChange={(event) => {
                    setCouponInput(event.target.value);
                    setCouponError(null);
                    if (appliedCoupon) setAppliedCoupon(null);
                  }}
                  placeholder="WELCOME10"
                />
                <button type="button" disabled={!service || couponLoading} onClick={applyCoupon}>
                  {couponLoading ? "..." : "Ашиглах"}
                </button>
              </div>
              {appliedCoupon && (
                <button type="button" className={styles.couponClear} onClick={clearCoupon}>
                  {appliedCoupon.code} ашиглагдсан
                </button>
              )}
              {couponError && <p className={styles.couponError}>{couponError}</p>}
            </div>
            {service && (
              <div className={styles.sumRow}>
                <span>Үндсэн үнэ</span>
                <span>{formatMoney(servicePrice)}</span>
              </div>
            )}
            {appliedCoupon && (
              <div className={styles.sumRow}>
                <span>Хөнгөлөлт</span>
                <span>-{formatMoney(discountAmount)}</span>
              </div>
            )}
            <div className={styles.sumTotal}>
              <span>Нийт үнэ</span>
              <span>{service ? formatMoney(totalAmount) : "—"}</span>
            </div>
            <p className={styles.sumNote}>
              Захиалгыг баталгаажуулсны дараа цуцлах бол дор хаяж 3 цагийн өмнө мэдэгдэнэ үү.
            </p>
          </aside>
        </div>
      </div>

    </div>
  );
}