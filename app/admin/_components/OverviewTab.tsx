"use client";

import { useMemo, useRef } from "react";
import StatCard from "./StatCard";
import CardNav from "./CardNav";
import { statusBadgeClass } from "../_lib/format";
import { scrollCards } from "../_lib/scroll";
import type { AppUser, Booking, Coupon, ServiceItem, TabKey, Teacher } from "../_lib/types";

export default function OverviewTab({
  users,
  bookings,
  teachers,
  services,
  coupons,
  onNavigate,
}: {
  users: AppUser[];
  bookings: Booking[];
  teachers: Teacher[];
  services: ServiceItem[];
  coupons: Coupon[];
  onNavigate: (tab: TabKey) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const pendingCount = useMemo(() => bookings.filter((b) => b.status === "хүлээгдэж буй").length, [bookings]);
  const confirmedCount = useMemo(() => bookings.filter((b) => b.status === "баталгаажсан").length, [bookings]);
  const recentBookings = useMemo(
    () => [...bookings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 5),
    [bookings]
  );

  return (
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
          <button type="button" className="admin-link-button" onClick={() => onNavigate("bookings")}>
            Бүгдийг харах
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <p className="admin-empty-state">Одоогоор захиалга алга байна.</p>
        ) : (
          <>
            <div className="admin-table-wrap" ref={wrapRef}>
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
              <CardNav onPrev={() => scrollCards(wrapRef, -1)} onNext={() => scrollCards(wrapRef, 1)} />
            )}
          </>
        )}
      </section>
    </>
  );
}
