"use client";

import { useEffect, useRef, useState } from "react";
import type { Testimonial } from "../types";

/**
 * "Сэтгэгдэл үлдээх" modal. Native <dialog> ашиглана — Esc, фокус, арын бүдэгрүүлэлтийг хөтөч өөрөө зохицуулна.
 */
export default function FeedbackModal({
  open,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  onSubmitted: (testimonial: Testimonial) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const resetAndClose = () => {
    setError("");
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !message.trim()) {
      setError("Нэр болон сэтгэгдлээ оруулна уу.");
      return;
    }

    if (message.trim().length < 10) {
      setError("Сэтгэгдэл хамгийн багадаа 10 тэмдэгт байх ёстой.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, rating }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string; testimonial?: Testimonial };

      if (!response.ok || !data.testimonial) {
        setError(data.message ?? "Сэтгэгдэл хадгалах үед алдаа гарлаа.");
        return;
      }

      onSubmitted(data.testimonial);
      setName("");
      setMessage("");
      setRating(5);
      setSuccess(true);
    } catch {
      setError("Сервертэй холбогдоход алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  const shownRating = hoverRating || rating;

  return (
    <dialog
      ref={dialogRef}
      className="feedback-modal"
      aria-labelledby="feedback-modal-title"
      onClose={resetAndClose}
      onClick={(event) => {
        /* Арын бүдэг хэсэг дээр дарвал хаана */
        if (event.target === event.currentTarget) resetAndClose();
      }}
    >
      <div className="feedback-form-panel">
        <button type="button" className="feedback-modal-close" aria-label="Хаах" onClick={resetAndClose}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <p className="auth-eyebrow">Хэрэглэгчийн үнэлгээ</p>
        <h2 id="feedback-modal-title">Сэтгэгдэл үлдээх</h2>

        {success ? (
          <div className="feedback-modal-done">
            <p className="auth-success">Баярлалаа! Таны сэтгэгдэл амжилттай нэмэгдлээ.</p>
            <button type="button" className="auth-submit" onClick={resetAndClose}>
              Хаах
            </button>
          </div>
        ) : (
          <>
            <p className="auth-subtext">Таны сэтгэгдэл дараагийн үйлчлүүлэгчдэд зөв сонголт хийхэд тусална.</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label>
                Нэр
                <input
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError("");
                  }}
                  placeholder="Таны нэр"
                  maxLength={60}
                  autoComplete="name"
                />
              </label>

              <div className="feedback-rating">
                <span id="feedback-rating-label">Үнэлгээ</span>
                <div
                  className="feedback-stars"
                  role="radiogroup"
                  aria-labelledby="feedback-rating-label"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={rating === value}
                      aria-label={`${value} од`}
                      className={value <= shownRating ? "is-on" : undefined}
                      onMouseEnter={() => setHoverRating(value)}
                      onClick={() => setRating(value)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <label>
                Сэтгэгдэл
                <textarea
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    setError("");
                  }}
                  placeholder="Үйлчилгээний талаар сэтгэгдлээ бичнэ үү"
                  maxLength={500}
                  rows={5}
                />
              </label>

              <div className="feedback-form-count">{message.length}/500</div>
              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Илгээж байна..." : "Сэтгэгдэл илгээх"}
              </button>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}
