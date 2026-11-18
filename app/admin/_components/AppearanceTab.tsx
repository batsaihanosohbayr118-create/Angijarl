"use client";

import { type Dispatch, type SetStateAction, useState } from "react";

export default function AppearanceTab({
  heroImageDraft,
  setHeroImageDraft,
}: {
  heroImageDraft: string;
  setHeroImageDraft: Dispatch<SetStateAction<string>>;
}) {
  const [heroImageSaving, setHeroImageSaving] = useState(false);
  const [heroImageMessage, setHeroImageMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const submitHeroImage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!heroImageDraft.trim()) return;
    setHeroImageMessage(null);
    setHeroImageSaving(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroImage: heroImageDraft.trim() }),
      });
      const data = (await response.json()) as { heroImage?: string; message?: string };

      if (!response.ok || !data.heroImage) {
        setHeroImageMessage({ type: "error", text: data.message ?? "Хадгалахад алдаа гарлаа. Дахин оролдоно уу." });
        return;
      }

      setHeroImageDraft(data.heroImage);
      setHeroImageMessage({ type: "ok", text: "Нүүр хуудасны зураг шинэчлэгдлээ." });
    } catch {
      setHeroImageMessage({ type: "error", text: "Сүлжээний алдаа гарлаа. Дахин оролдоно уу." });
    } finally {
      setHeroImageSaving(false);
    }
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h2>Нүүр хуудасны зураг</h2>
      </div>

      <form className="admin-inline-form" onSubmit={submitHeroImage}>
        <div className="admin-form-grid">
          <div className="form-field admin-form-field-wide">
            <label>Зургийн холбоос (URL)</label>
            <input
              type="text"
              value={heroImageDraft}
              onChange={(event) => setHeroImageDraft(event.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        {heroImageDraft && (
          <div
            className="admin-hero-preview"
            style={{ backgroundImage: `url("${heroImageDraft}")` }}
            aria-hidden="true"
          />
        )}

        {heroImageMessage && (
          <p className={heroImageMessage.type === "error" ? "form-error" : "form-success"}>
            {heroImageMessage.text}
          </p>
        )}

        <div className="admin-form-actions">
          <button type="submit" className="admin-primary-btn" disabled={heroImageSaving}>
            {heroImageSaving ? "Хадгалж байна..." : "Хадгалах"}
          </button>
        </div>
      </form>
    </section>
  );
}
