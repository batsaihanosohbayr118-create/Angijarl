"use client";

import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import Icon from "./Icon";
import CardNav from "./CardNav";
import ConfirmDialog from "./ConfirmDialog";
import { scrollCards } from "../_lib/scroll";
import type { AdminTestimonial } from "../_lib/types";

const emptyDraft = { name: "", message: "", rating: 5 };

function formatDate(value: string) {
  return value ? value.slice(0, 10) : "—";
}

export default function TestimonialsTab({
  testimonials,
  setTestimonials,
}: {
  testimonials: AdminTestimonial[];
  setTestimonials: Dispatch<SetStateAction<AdminTestimonial[]>>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  /* Устгахаар сонгосон сэтгэгдэл — баталгаажуулах цонх нээгдэнэ */
  const [pendingDelete, setPendingDelete] = useState<AdminTestimonial | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return testimonials;
    return testimonials.filter(
      (t) => t.name.toLowerCase().includes(query) || t.message.toLowerCase().includes(query)
    );
  }, [testimonials, search]);

  const openForm = (testimonial?: AdminTestimonial) => {
    setFormError(null);
    setActionError(null);
    if (testimonial) {
      setEditingId(testimonial.id);
      setDraft({ name: testimonial.name, message: testimonial.message, rating: testimonial.rating });
    } else {
      setEditingId(null);
      setDraft(emptyDraft);
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setDraft(emptyDraft);
    setFormError(null);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const payload = { name: draft.name.trim(), message: draft.message.trim(), rating: draft.rating };

    try {
      setSaving(true);
      const response = await fetch("/api/admin/testimonials", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      const data = (await response.json().catch(() => ({}))) as { testimonial?: AdminTestimonial; message?: string };

      if (!response.ok || !data.testimonial) {
        setFormError(data.message ?? "Хадгалахад алдаа гарлаа. Дахин оролдоно уу.");
        return;
      }

      const saved = data.testimonial;
      setTestimonials((current) =>
        editingId ? current.map((t) => (t.id === editingId ? saved : t)) : [saved, ...current]
      );
      closeForm();
    } catch {
      setFormError("Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    const testimonial = pendingDelete;
    if (!testimonial) return;
    setActionError(null);
    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/testimonials?id=${encodeURIComponent(testimonial.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setActionError("Устгаж чадсангүй. Дахин оролдоно уу.");
        return;
      }
      setTestimonials((current) => current.filter((t) => t.id !== testimonial.id));
      if (editingId === testimonial.id) closeForm();
    } catch {
      setActionError("Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h2>Хэрэглэгчдийн сэтгэгдэл</h2>
        <div className="admin-panel-tools">
          <div className="admin-search-wrap">
            <span className="admin-search-icon">
              <Icon name="search" />
            </span>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Хайх"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button type="button" className="admin-primary-btn" onClick={() => openForm()}>
            <Icon name="plus" />
            Сэтгэгдэл нэмэх
          </button>
        </div>
      </div>

      {showForm && (
        <form className="admin-inline-form" onSubmit={submit}>
          <div className="admin-form-grid">
            <div className="form-field">
              <label htmlFor="testimonial-name">Нэр</label>
              <input
                id="testimonial-name"
                type="text"
                value={draft.name}
                maxLength={60}
                onChange={(event) => setDraft((d) => ({ ...d, name: event.target.value }))}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="testimonial-rating">Үнэлгээ</label>
              <select
                id="testimonial-rating"
                value={draft.rating}
                onChange={(event) => setDraft((d) => ({ ...d, rating: Number(event.target.value) }))}
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {"★".repeat(value)}
                    {"☆".repeat(5 - value)} ({value})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field admin-form-field-wide">
              <label htmlFor="testimonial-message">Сэтгэгдэл ({draft.message.length}/500)</label>
              <textarea
                id="testimonial-message"
                value={draft.message}
                maxLength={500}
                rows={4}
                onChange={(event) => setDraft((d) => ({ ...d, message: event.target.value }))}
                required
              />
            </div>
          </div>
          {formError && <p className="form-error">{formError}</p>}
          <div className="admin-form-actions">
            <button type="button" className="admin-secondary-btn" onClick={closeForm}>
              Цуцлах
            </button>
            <button type="submit" className="admin-primary-btn" disabled={saving}>
              {saving ? "Хадгалж байна..." : editingId ? "Шинэчлэх" : "Хадгалах"}
            </button>
          </div>
        </form>
      )}

      {actionError && <p className="form-error">{actionError}</p>}

      {filtered.length === 0 ? (
        <p className="admin-empty-state">
          {testimonials.length === 0 ? "Одоогоор сэтгэгдэл ирээгүй байна." : "Хайлтад тохирох сэтгэгдэл олдсонгүй."}
        </p>
      ) : (
        <>
          <div className="admin-table-wrap" ref={wrapRef}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Нэр</th>
                  <th>Үнэлгээ</th>
                  <th>Сэтгэгдэл</th>
                  <th>Огноо</th>
                  <th aria-label="Үйлдэл" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id}>
                    <td data-label="Нэр">{t.name}</td>
                    <td data-label="Үнэлгээ">
                      <span className="admin-rating" aria-label={`${t.rating} од`}>
                        {"★".repeat(t.rating)}
                        <span className="admin-rating-off">{"★".repeat(5 - t.rating)}</span>
                      </span>
                    </td>
                    <td data-label="Сэтгэгдэл" className="admin-testimonial-message">
                      {t.message}
                    </td>
                    <td data-label="Огноо">{formatDate(t.createdAt)}</td>
                    <td data-label="Үйлдэл" className="admin-table-actions-cell">
                      <div className="admin-row-actions">
                        <button type="button" className="admin-icon-btn" aria-label="Засах" onClick={() => openForm(t)}>
                          <Icon name="edit" />
                        </button>
                        <button
                          type="button"
                          className="admin-icon-btn danger"
                          aria-label="Устгах"
                          onClick={() => setPendingDelete(t)}
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
          {filtered.length > 1 && (
            <CardNav onPrev={() => scrollCards(wrapRef, -1)} onNext={() => scrollCards(wrapRef, 1)} />
          )}
        </>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Сэтгэгдэл устгах уу?"
        message={
          <>
            <strong>{pendingDelete?.name}</strong>-ийн сэтгэгдэл бүрмөсөн устгагдана. Энэ үйлдлийг буцаах боломжгүй.
          </>
        }
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  );
}
