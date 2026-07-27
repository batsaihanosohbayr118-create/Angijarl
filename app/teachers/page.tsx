"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const navItems = ["Нүүр", "Бидний тухай", "Үйлчилгээ", "Бариачид", "Цаг захиалах"];

const services = [
  ["Оффис бариа засал", "/#contact"],
  ["Хоол зүйн сургалт", "/#contact"],
  ["Байгууллагын бясалгал", "/#contact"],
  ["Сэтгэл зүйн сургалт", "/#contact"]
];

const contactItems = [
  ["phone", "9127 1178", undefined],
  ["mail", "angijraltuv@yahoo.com", "mailto:angijraltuv@yahoo.com"],
  ["messenger", "Ангижрал сургалт Angijral surgalt", "https://m.me/angijral"]
] as const;

type Teacher = {
  id: string;
  name: string;
  role: string;
  years: number;
  bio: string;
  photo: string;
  initials: string;
};

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

const defaultTeachers: Teacher[] = [
  {
    id: "teacher-bat-erdene",
    name: "Б.Бат-Эрдэнэ",
    role: "Ахлах бариач",
    years: 15,
    initials: "Б",
    photo: "https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=700",
    bio: "Клиникийн болон эмчилгээний салбарт 15 гаруй жил ажилласан туршлагатай ахлах бариач. Анхан шатны болон нарийн мэргэжлийн бариа заслын үйлчилгээг үзүүлнэ.",
  },
  {
    id: "teacher-enkhtuyaa",
    name: "Ц.Энхтуяа",
    role: "Бариач",
    years: 10,
    initials: "Ц",
    photo: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=700",
    bio: "Relax болон Cupping массажийн чиглэлээр мэргэшсэн, үйлчлүүлэгч бүрт хамгийн тохиромжтой аргыг сонгож үйлчилдэг.",
  },
  {
    id: "teacher-orgil",
    name: "Г.Оргил",
    role: "Бариач",
    years: 8,
    initials: "Г",
    photo: "https://images.pexels.com/photos/6627534/pexels-photo-6627534.jpeg?auto=compress&cs=tinysrgb&w=700",
    bio: "Спорт бариа болон гуаша заслын чиглэлээр ажилладаг бөгөөд тамирчид болон идэвхтэй амьдралын хэв маягтай үйлчлүүлэгчдэд эмчилгээ хийдэг.",
  },
];

type SessionState = { role: "user" | "admin"; name: string } | null;

let cachedSessionSnapshot: SessionState = null;

const navHref = (item: string) => {
  if (item === "Нүүр") return "/#home";
  if (item === "Бидний тухай") return "/about";
  if (item === "Бариачид") return "/teachers";
  if (item === "Цаг захиалах") return "/booking";
  return `/#${item}`;
};

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

export default function Teachers() {
  const router = useRouter();
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [teachers, setTeachers] = useState<Teacher[]>(defaultTeachers);

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const response = await fetch("/api/teachers");
        const data = (await response.json()) as { teachers?: Teacher[] };
        if (response.ok && Array.isArray(data.teachers) && data.teachers.length > 0) {
          setTeachers(data.teachers);
        }
      } catch {
        setTeachers(defaultTeachers);
      }
    };

    void loadTeachers();
  }, []);

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

  return (
    <main>
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
                    {services.map(([label, href]) => (
                      <a href={href} key={label} role="menuitem" onClick={() => setServicesOpen(false)}>
                        {label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item}
                className={item === "Бариачид" ? "active" : ""}
                href={navHref(item)}
              >
                {item}
              </Link>
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

      <section className="about-hero">
        <h1>Бариачид</h1>
        <p>
          Клиник болон эмчилгээний салбарт олон жил ажилласан, өндөр ур чадвартай
          мэргэжилтнүүдээс бүрдсэн манай баг таны эрүүл мэндийг сэргээхэд туслана.
        </p>
      </section>

      <section className="teachers-grid-section">
        <div className="teacher-card-grid">
          {teachers.map((teacher) => (
            <article className="teacher-card" key={teacher.id}>
              {teacher.photo ? (
                <Image className="teacher-card-photo" src={teacher.photo} alt={teacher.name} width={180} height={180} />
              ) : (
                <div className="teacher-card-photo fallback" aria-hidden="true">{teacher.initials}</div>
              )}
              <h3>{teacher.name}</h3>
              <p className="teacher-card-role">{teacher.role} · {teacher.years}+ жил туршлагатай</p>
              <p className="teacher-card-bio">{teacher.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-cta">
        <h2>Манай мэргэжилтнүүдтэй цаг захиалж, эрүүл мэндээ сэргээгээрэй</h2>
        <p>Манай үйлчилгээнүүдтэй танилцаад, өөрт тохирсныг сонгоорой.</p>
        <a className="primary-button" href="/booking">
          Цаг захиалах <span>↗</span>
        </a>
      </section>

    </main>
  );
}
