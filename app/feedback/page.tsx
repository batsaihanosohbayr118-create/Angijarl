"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Testimonial = {
  id: string;
  name: string;
  message: string;
  rating: number;
  initials: string;
};

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials");
        const data = (await response.json()) as { testimonials?: Testimonial[] };
        setTestimonials(response.ok && Array.isArray(data.testimonials) ? data.testimonials : []);
      } catch {
        setTestimonials([]);
      }
    };

    void loadTestimonials();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

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
      const data = (await response.json()) as { message?: string; testimonial?: Testimonial };

      if (!response.ok || !data.testimonial) {
        setError(data.message ?? "Сэтгэгдэл хадгалах үед алдаа гарлаа.");
        return;
      }

      setTestimonials((current) => [data.testimonial as Testimonial, ...current]);
      setMessage("");
      setRating(5);
      setSuccess("Баярлалаа! Таны сэтгэгдэл амжилттай нэмэгдлээ.");
    } catch {
      setError("Сервертэй холбогдоход алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="feedback-page">
      <Link className="auth-back" href="/">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Нүүр рүү буцах
      </Link>

      <section className="feedback-shell">
        <div className="feedback-form-panel">
          <p className="auth-eyebrow">Хэрэглэгчийн үнэлгээ</p>
          <h1>Сэтгэгдэл үлдээх</h1>
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
                  setSuccess("");
                }}
                placeholder="Таны нэр"
                maxLength={60}
              />
            </label>

            <label>
              Үнэлгээ
              <select
                className="rating-select"
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option value={value} key={value}>
                    {"★".repeat(value)}{"☆".repeat(5 - value)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Сэтгэгдэл
              <textarea
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="Үйлчилгээний талаар сэтгэгдлээ бичнэ үү"
                maxLength={500}
                rows={6}
              />
            </label>

            <div className="feedback-form-count">{message.length}/500</div>
            {error && <p className="form-error">{error}</p>}
            {success && <p className="auth-success">{success}</p>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Илгээж байна..." : "Сэтгэгдэл илгээх"}
            </button>
          </form>
        </div>

        <aside className="feedback-preview" aria-label="Сүүлийн сэтгэгдлүүд">
          <h2>Сүүлийн сэтгэгдлүүд</h2>
          <div className="feedback-preview-list">
            {testimonials.slice(0, 3).map((testimonial) => (
              <article className="testimonial-card" key={testimonial.id}>
                <span className="testimonial-quote-mark" aria-hidden="true">“</span>
                <blockquote>{testimonial.message}</blockquote>
                <div className="testimonial-footer">
                  <div className="testimonial-avatar" aria-hidden="true">{testimonial.initials}</div>
                  <div className="testimonial-meta">
                    <strong>{testimonial.name}</strong>
                    <div className="stars" aria-label={`${testimonial.rating} одтой үнэлгээ`}>
                      {"★".repeat(testimonial.rating)}{"☆".repeat(5 - testimonial.rating)}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}