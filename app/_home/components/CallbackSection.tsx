"use client";

import { useState } from "react";

export default function CallbackSection() {
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackSent, setCallbackSent] = useState(false);
  const [callbackSending, setCallbackSending] = useState(false);
  const [callbackError, setCallbackError] = useState("");

  const handleCallbackSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!callbackPhone.trim() || callbackSending) return;

    setCallbackSending(true);
    setCallbackError("");

    try {
      const response = await fetch("/api/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: callbackPhone.trim() }),
      });

      if (!response.ok) throw new Error("request failed");

      setCallbackSent(true);
      setCallbackPhone("");
    } catch {
      setCallbackError("Илгээхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setCallbackSending(false);
    }
  };

  return (
    <section className="callback-band reveal">
      <p className="callback-text">
        Танд манай үйлчилгээтэй холбоотой асуулт эсвэл санал хүсэлт байгаа бол
        бидэнд утасны дугаараа үлдээгээрэй. Бид тантай холбогдох болно
      </p>

      <form className="callback-form" onSubmit={handleCallbackSubmit}>
        <input
          type="tel"
          inputMode="tel"
          className="callback-input"
          placeholder="Утасны дугаар"
          value={callbackPhone}
          onChange={(event) => {
            setCallbackPhone(event.target.value);
            setCallbackSent(false);
          }}
          aria-label="Утасны дугаар"
        />
        <button type="submit" className="callback-submit" disabled={callbackSending}>
          {callbackSending ? "Илгээж байна..." : "Илгээх"}
        </button>
      </form>

      {callbackSent && <p className="callback-success">Баярлалаа! Бид удахгүй тантай холбогдох болно.</p>}
      {callbackError && <p className="callback-error">{callbackError}</p>}
    </section>
  );
}
