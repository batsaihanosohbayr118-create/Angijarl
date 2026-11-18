"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar, { navItems } from "./_components/AdminSidebar";
import OverviewTab from "./_components/OverviewTab";
import UsersTab from "./_components/UsersTab";
import BookingsTab from "./_components/BookingsTab";
import TeachersTab from "./_components/TeachersTab";
import ServicesTab from "./_components/ServicesTab";
import CouponsTab from "./_components/CouponsTab";
import AppearanceTab from "./_components/AppearanceTab";
import {
  getAdminSessionSnapshot,
  parseAdminSession,
  pendingSessionSnapshot,
  subscribeToAdminSession,
} from "./_lib/session";
import type { AppUser, Booking, Coupon, ServiceItem, TabKey, Teacher } from "./_lib/types";

/** GET хүсэлт илгээж, хариунаас `key` талбарын массивыг буцаана. Алдаа гарвал хоосон массив. */
async function fetchList<T>(url: string, key: string): Promise<T[]> {
  try {
    const response = await fetch(url);
    const data = (await response.json()) as Record<string, unknown>;
    return response.ok && Array.isArray(data[key]) ? (data[key] as T[]) : [];
  } catch {
    return [];
  }
}

export default function AdminPage() {
  const router = useRouter();

  const sessionSnapshot = useSyncExternalStore(
    subscribeToAdminSession,
    getAdminSessionSnapshot,
    () => pendingSessionSnapshot
  );
  const session = useMemo(() => parseAdminSession(sessionSnapshot), [sessionSnapshot]);
  const checkedAuth = sessionSnapshot !== pendingSessionSnapshot;
  const isAdmin = session?.role === "admin";

  const [tab, setTab] = useState<TabKey>("overview");

  const [users, setUsers] = useState<AppUser[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [heroImageDraft, setHeroImageDraft] = useState("");

  /* auth guard */
  useEffect(() => {
    if (checkedAuth && !isAdmin) {
      router.replace("/login");
    }
  }, [checkedAuth, isAdmin, router]);

  /* load data */
  useEffect(() => {
    if (!isAdmin) return;

    void fetchList<AppUser>("/api/admin/users", "users").then(setUsers);
    void fetchList<Booking>("/api/admin/bookings", "bookings").then(setBookings);
    void fetchList<Teacher>("/api/admin/teachers", "teachers").then(setTeachers);
    void fetchList<ServiceItem>("/api/admin/services", "services").then(setServices);
    void fetchList<Coupon>("/api/admin/coupons", "coupons").then(setCoupons);

    const loadSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const data = (await response.json()) as { heroImage?: string };
        if (response.ok && data.heroImage) {
          setHeroImageDraft(data.heroImage);
        }
      } catch {
        /* leave the field empty */
      }
    };
    void loadSettings();
  }, [isAdmin]);

  const handleLogout = () => {
    window.localStorage.removeItem("angijral_session");
    router.push("/login");
  };

  if (!session) {
    return (
      <main className="admin-page">
        <div className="admin-loading">Түр хүлээнэ үү…</div>
      </main>
    );
  }

  const tabTitle = navItems.find((item) => item.key === tab)?.label;

  return (
    <main className="admin-page">
      <AdminSidebar tab={tab} onTabChange={setTab} onLogout={handleLogout} />

      <div className="admin-main">
        <div className="admin-topbar">
          <div>
            <p className="admin-eyebrow">Админ эрх</p>
            <h1>{tabTitle}</h1>
          </div>
        </div>

        {tab === "overview" && (
          <OverviewTab
            users={users}
            bookings={bookings}
            teachers={teachers}
            services={services}
            coupons={coupons}
            onNavigate={setTab}
          />
        )}
        {tab === "users" && <UsersTab users={users} setUsers={setUsers} />}
        {tab === "bookings" && (
          <BookingsTab bookings={bookings} setBookings={setBookings} services={services} teachers={teachers} />
        )}
        {tab === "teachers" && <TeachersTab teachers={teachers} setTeachers={setTeachers} services={services} />}
        {tab === "services" && <ServicesTab services={services} setServices={setServices} />}
        {tab === "coupons" && <CouponsTab coupons={coupons} setCoupons={setCoupons} />}
        {tab === "appearance" && (
          <AppearanceTab heroImageDraft={heroImageDraft} setHeroImageDraft={setHeroImageDraft} />
        )}
      </div>
    </main>
  );
}
