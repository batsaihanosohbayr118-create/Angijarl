"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Icon from "./Icon";
import type { TabKey } from "../_lib/types";

export const navItems: { key: TabKey; label: string; icon: string }[] = [
  { key: "overview", label: "Ерөнхий тойм", icon: "overview" },
  { key: "users", label: "Хэрэглэгчид", icon: "users" },
  { key: "bookings", label: "Цаг захиалга", icon: "bookings" },
  { key: "teachers", label: "Бариачид", icon: "users" },
  { key: "services", label: "Үйлчилгээ", icon: "services" },
  { key: "coupons", label: "Купон", icon: "coupons" },
  { key: "testimonials", label: "Сэтгэгдэл", icon: "testimonials" },
];

export default function AdminSidebar({
  tab,
  onTabChange,
  onLogout,
}: {
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onLogout: () => void;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <aside className={`admin-sidebar${mobileNavOpen ? " mobile-open" : ""}`}>
      <div className="admin-sidebar-topline">
        <div className="admin-sidebar-brand">
          <Image className="admin-sidebar-logo" src="/logo.jpg" alt="АНГИЖРАЛ" width={40} height={40} priority />
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
              onTabChange(item.key);
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
        <button type="button" className="admin-logout" onClick={onLogout}>
          <span className="admin-nav-icon">
            <Icon name="logout" />
          </span>
          Гарах
        </button>
      </div>
    </aside>
  );
}
