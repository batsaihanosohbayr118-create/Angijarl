"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const navItems = ["Нүүр", "Бидний тухай", "Үйлчилгээ", "Бариачид", "Цаг захиалах"];

const dropdownServices = [
  ["Оффис бариа засал", "/services/office-massage"],
  ["Хоол зүйн сургалт", "/services/nutrition"],
  ["Байгууллагын бясалгал", "/services/meditation"],
  ["Сэтгэл зүйн сургалт", "/services/psychology"],
] as const;

const perks = [
  "Ажлын байран дээр очиж үйлчилнэ, өөр газар зорих шаардлагагүй",
  "20-30 минутын хугацаанд хийгддэг богино бөгөөд үр дүнтэй сеанс",
  "Хүзүү, мөр, гар, толгойн хурцадмал булчинг сулруулна",
  "Тогтмол ширээний ажилтай хамт олонд тусгайлан тохирсон",
  "Тусгай орчин, тоног төхөөрөмж шаардахгүй",
  "Мэргэжлийн, сертификаттай бариач үйлчилнэ",
];

const contactItems = [
  ["phone", "9127 1178", undefined],
  ["mail", "angijraltuv@yahoo.com", "mailto:angijraltuv@yahoo.com"],
  ["messenger", "Ангижрал сургалт Angijral surgalt", "https://m.me/angijral"],
] as const;

type SessionState = { role: "user" | "admin"; name: string } | null;

const navHref = (item: string) => {
  if (item === "Нүүр") return "/";
  if (item === "Бидний тухай") return "/about";
  if (item === "Бариачид") return "/teachers";
  if (item === "Цаг захиалах") return "/booking";
  return "/";
};

let cachedRaw: string | null = null;
let cachedSnapshot: SessionState = null;

const getSessionSnapshot = (): SessionState => {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem("angijral_session");

  // If the underlying string hasn't changed, return the same cached
  // object reference so useSyncExternalStore doesn't see a "new" value
  // on every render and loop forever.
  if (raw === cachedRaw) {
    return cachedSnapshot;
  }

  cachedRaw = raw;
  try {
    cachedSnapshot = raw ? (JSON.parse(raw) as SessionState) : null;
  } catch {
    cachedSnapshot = null;
  }
  return cachedSnapshot;
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

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 13l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

export default function OfficeMassagePage() {
  const router = useRouter();
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <main>
      <header className="site-header" ref={headerRef}>
        <Link className="brand" href="/">
          <Image className="brand-logo" src="/logo.jpg" alt="АНГИЖРАЛ бариа заслын сургалтын төв" width={120} height={40} />
        </Link>

        <button
          type="button"
          className={`nav-toggle${mobileMenuOpen ? " open" : ""}`}
          aria-expanded={mobileMenuOpen}
          aria-controls="primary-navigation"
          aria-label={mobileMenuOpen ? "Цэс хаах" : "Цэс нээх"}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="primary-navigation" aria-label="Үндсэн цэс" className={mobileMenuOpen ? "nav-open" : ""}>
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
                    {dropdownServices.map(([label, href]) => (
                      <a
                        href={href}
                        key={label}
                        role="menuitem"
                        onClick={() => {
                          setServicesOpen(false);
                          setMobileMenuOpen(false);
                        }}
                      >
                        {label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a
                key={item}
                className={item === "Үйлчилгээ" ? "" : ""}
                href={navHref(item)}
                onClick={() => setMobileMenuOpen(false)}
              >
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

      <section className="about-hero about-hero--office-massage">
        <h1>Оффис бариа засал</h1>
        <p>Суудал дээр нь хийх хүзүү, толгой, мөр гарын бариа — ажлын байран дээр тань очиж үйлчилнэ.</p>
      </section>

      <section className="about-story">
        <div
          className="about-story-photo"
          style={{
            backgroundImage:
              'url("https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=900")',
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          aria-hidden="true"
        />
        <div className="about-story-copy">
          <h2>Тухай</h2>
          <p>
            Урт цагаар сууж ажилладаг ажилтнуудын хүзүү, мөр, нурууны хурцадмал байдлыг тайлж, ажлын
            бүтээмжийг нэмэгдүүлэхэд чиглэсэн богино хугацааны бариа засал юм. Манай мэргэжилтэн таны
            байгууллага дээр очиж, тусгай суудал шаардахгүйгээр шууд суудал дээр нь эмчилгээ хийж өгнө.
          </p>
          <p>
            Тогтмол хуваарьтай оффисын хамт олонд зориулж хөнгөн, түргэн бөгөөд үр дүнтэй бариаг санал
            болгодог бөгөөд ганц удаагийн захиалга болон тогтмол сарын хөтөлбөрөөр авах боломжтой.
          </p>
        </div>
      </section>

      <section className="why-section">
        <div className="section-title">
          <span />
          <h2>Юу багтдаг вэ</h2>
          <span />
        </div>

        <div className="why-grid">
          {perks.map((perk) => (
            <article className="why-card" key={perk}>
              <span>
                <CheckIcon />
              </span>
              <p>{perk}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-cta">
        <h2>Оффис бариа заслаа захиалаарай</h2>
        <p>Нэг удаагийн үнэ 60,000₮. Танд тохирох цагийг сонгоод шууд захиална уу.</p>
        <a className="primary-button" href="/booking">
          Цаг захиалах <span>↗</span>
        </a>
      </section>

    </main>
  );
}