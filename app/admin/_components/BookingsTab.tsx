"use client";

import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import Icon from "./Icon";
import CardNav from "./CardNav";
import Dropdown from "./Dropdown";
import DatePicker from "./DatePicker";
import TimePicker from "./TimePicker";
import { formatMoney, statusBadgeClass } from "../_lib/format";
import { scrollCards } from "../_lib/scroll";
import type { Booking, BookingStatus, ServiceItem, Teacher } from "../_lib/types";

const emptyBookingDraft = {
  name: "",
  phone: "",
  service: "",
  specialist: "",
  preferredDate: "",
  time: "",
  note: "",
};

export default function BookingsTab({
  bookings,
  setBookings,
  services,
  teachers,
}: {
  bookings: Booking[];
  setBookings: Dispatch<SetStateAction<Booking[]>>;
  services: ServiceItem[];
  teachers: Teacher[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [bookingFilter, setBookingFilter] = useState<"Бүгд" | BookingStatus>("Бүгд");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDraft, setBookingDraft] = useState(emptyBookingDraft);

  const filteredBookings = useMemo(() => {
    if (bookingFilter === "Бүгд") return bookings;
    return bookings.filter((b) => b.status === bookingFilter);
  }, [bookings, bookingFilter]);

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

    setBookingDraft(emptyBookingDraft);
    setShowBookingForm(false);
  };

  return (
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
          <div className="admin-table-wrap" ref={wrapRef}>
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
            <CardNav onPrev={() => scrollCards(wrapRef, -1)} onNext={() => scrollCards(wrapRef, 1)} />
          )}
        </>
      )}
    </section>
  );
}
