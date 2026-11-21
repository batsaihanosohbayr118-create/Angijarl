"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import Chevron from "./Chevron";
import { navHref, navItems, serviceLinks } from "../data";
import { getSessionSnapshot, subscribeToSession } from "../session";

/** `open` үед `ref`-ээс гадуур дарвал `close`-г дуудна. */
function useClickOutside(ref: RefObject<HTMLElement | null>, open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, open, close]);
}

export default function SiteHeader() {
  const router = useRouter();
  const session = useSyncExternalStore(subscribeToSession, getSessionSnapshot, () => null);

  const [servicesOpen, setServicesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const closeServices = useCallback(() => setServicesOpen(false), []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useClickOutside(servicesRef, servicesOpen, closeServices);
  useClickOutside(profileRef, profileOpen, closeProfile);
  useClickOutside(headerRef, mobileMenuOpen, closeMobileMenu);

  const handleLogout = () => {
    void fetch("/api/logout", { method: "POST" }).catch(() => {});
    window.localStorage.removeItem("angijral_session");
    window.dispatchEvent(new Event("angijral-session-change"));
    setProfileOpen(false);
    router.push("/login");
  };

  const avatarLetter = session ? session.name.trim().charAt(0).toUpperCase() || "Х" : "";
  const roleLabel = session?.role === "admin" ? "Админ эрх" : "Хэрэглэгч";

  return (
    <header className="site-header" ref={headerRef}>
      <Link className="brand" href="/">
        <Image className="brand-logo" src="/logo.jpg" alt="АНГИЖРАЛ бариа заслын сургалтын төв" width={120} height={40} priority />
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
        {navItems.map((item, index) =>
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
                <Chevron open={servicesOpen} />
              </button>

              {servicesOpen && (
                <div className="nav-dropdown-menu" role="menu">
                  {serviceLinks.map(([label, href]) => (
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
              className={index === 0 ? "active" : ""}
              href={navHref(item, index)}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </a>
          )
        )}
        {session && (
          <div className="nav-profile">
            <div className="nav-profile-info">
              <span className="profile-avatar" aria-hidden="true">
                {avatarLetter}
              </span>
              <div>
                <strong>{session.name}</strong>
                <span>{roleLabel}</span>
              </div>
            </div>
            {session.role === "admin" && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                Админ самбар
              </Link>
            )}
            <button type="button" className="nav-profile-logout" onClick={handleLogout}>
              Гарах
            </button>
          </div>
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
              {avatarLetter}
            </span>
            <span className="profile-name">{session.name}</span>
            <Chevron open={profileOpen} />
          </button>

          {profileOpen && (
            <div className="profile-menu" role="menu">
              <div className="profile-menu-info">
                <strong>{session.name}</strong>
                <span>{roleLabel}</span>
              </div>
              {session.role === "admin" && (
                <Link href="/admin" role="menuitem" onClick={() => setProfileOpen(false)}>
                  Админ самбар
                </Link>
              )}
              <button type="button" role="menuitem" className="profile-menu-logout" onClick={handleLogout}>
                Гарах
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link className="login-button" href="/login" aria-label="Нэвтрэх">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="12" cy="8.2" r="3.4" stroke="currentColor" strokeWidth="1.6" />
            <path d="M5 19.5c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Нэвтрэх
        </Link>
      )}
    </header>
  );
}
