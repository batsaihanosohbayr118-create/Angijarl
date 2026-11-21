"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.5 3.5l17 17M9.9 5.5C10.6 5.2 11.3 5 12 5c6 0 9.5 7 9.5 7-.6 1.2-1.7 2.9-3.3 4.3M6.6 6.6C4.3 8.2 2.5 12 2.5 12s3.5 7 9.5 7c1.4 0 2.6-.3 3.7-.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8.2" r="3.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 19.5c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="m11 12 8-8M16 7l2.5 2.5M14 9l2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  /* 1-р алхам: код авах, 2-р алхам: код + шинэ нууц үг */
  const [step, setStep] = useState<"request" | "reset">("request");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const requestCode = async () => {
    setError("");
    setInfo("");

    if (!identifier.trim()) {
      setError("Утасны дугаар эсвэл имэйл хаягаа оруулна уу.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/forgot-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message ?? "Код илгээх үед алдаа гарлаа.");
        return;
      }

      setInfo(data.message ?? "");
      setStep("reset");
    } catch {
      setError("Сервертэй холбогдоход алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void requestCode();
  };

  const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(code.replace(/\s+/g, ""))) {
      setError("Имэйлээр ирсэн 6 оронтой кодоо оруулна уу.");
      return;
    }

    if (password.length < 6) {
      setError("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Нууц үг хоорондоо таарахгүй байна.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, code, password }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message ?? "Нууц үг шинэчлэх үед алдаа гарлаа.");
        return;
      }

      setInfo("");
      setSuccess(true);
      setCode("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Сервертэй холбогдоход алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <div className="auth-card">
          <section className="auth-visual">
            <div className="auth-visual-top">
              <Image className="brand-logo" src="/logo.jpg" alt="АНГИЖРАЛ бариа заслын сургалтын төв" width={120} height={40} priority />
            </div>
            <div className="auth-visual-bottom">
              <h2>Бүртгэлээ сэргээхэд амархан</h2>
              <p>
                Бүртгэлтэй утасны дугаар эсвэл имэйлээ оруулаад, имэйлээр ирсэн кодоор шинэ нууц үгээ тохируулна уу.
              </p>
            </div>
          </section>

          <section className="auth-form-side">
            <p className="auth-eyebrow">Нууц үг сэргээх</p>
            <h1>Шинэ нууц үг</h1>
            <p className="auth-subtext">
              {step === "request"
                ? "Бүртгэлтэй утасны дугаар эсвэл имэйлээ оруулна уу. Бүртгэлд холбогдсон имэйл рүү 6 оронтой код илгээнэ."
                : "Имэйлээр ирсэн кодоо оруулаад шинэ нууц үгээ тохируулна уу."}
            </p>

            {step === "request" ? (
              <form className="auth-form" onSubmit={handleRequest}>
                <div className="form-field">
                  <label htmlFor="forgot-identifier">Утас эсвэл имэйл</label>
                  <div className="form-input-wrap">
                    <UserIcon />
                    <input
                      id="forgot-identifier"
                      type="text"
                      inputMode="text"
                      placeholder="Утасны дугаар эсвэл имэйл хаягаа оруулна уу"
                      value={identifier}
                      onChange={(event) => {
                        setIdentifier(event.target.value);
                        setError("");
                      }}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {error && <p className="form-error">{error}</p>}

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? "Илгээж байна..." : "Код авах"}
                </button>

                <p className="auth-subtext">
                  Бүртгэлдээ имэйл холбоогүй бол <a className="form-link" href="tel:+97691271178">9127 1178</a> дугаарт
                  холбогдож нууц үгээ сэргээлгэнэ үү.
                </p>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleReset}>
                {info && !success && <p className="auth-success">{info}</p>}

                <div className="form-field">
                  <label htmlFor="forgot-code">Баталгаажуулах код</label>
                  <div className="form-input-wrap">
                    <KeyIcon />
                    <input
                      id="forgot-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6 оронтой код"
                      value={code}
                      onChange={(event) => {
                        setCode(event.target.value.replace(/\D/g, ""));
                        setError("");
                      }}
                      autoComplete="one-time-code"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="forgot-password">Шинэ нууц үг</label>
                  <div className="form-input-wrap">
                    <LockIcon />
                    <input
                      id="forgot-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Хамгийн багадаа 6 тэмдэгт"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError("");
                      }}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="form-toggle-visibility"
                      aria-label={showPassword ? "Нууц үг нуух" : "Нууц үг харуулах"}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="forgot-confirm">Шинэ нууц үг давтах</label>
                  <div className="form-input-wrap">
                    <LockIcon />
                    <input
                      id="forgot-confirm"
                      type={showPassword ? "text" : "password"}
                      placeholder="Нууц үгээ дахин оруулна уу"
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        setError("");
                      }}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {error && <p className="form-error">{error}</p>}
                {success && <p className="auth-success">Нууц үг амжилттай шинэчлэгдлээ. Одоо шинэ нууц үгээрээ нэвтэрнэ үү.</p>}

                {!success && (
                  <button type="submit" className="auth-submit" disabled={loading}>
                    {loading ? "Шинэчилж байна..." : "Нууц үг шинэчлэх"}
                  </button>
                )}

                {!success && (
                  <p className="auth-switch">
                    Код ирээгүй юу?{" "}
                    <button type="button" className="form-link form-link-button" disabled={loading} onClick={() => void requestCode()}>
                      Дахин илгээх
                    </button>
                    {" · "}
                    <button
                      type="button"
                      className="form-link form-link-button"
                      onClick={() => {
                        setStep("request");
                        setError("");
                        setInfo("");
                      }}
                    >
                      Утас/имэйл солих
                    </button>
                  </p>
                )}
              </form>
            )}

            <p className="auth-switch">
              Нууц үгээ санасан уу? <Link className="form-link" href="/login">Нэвтрэх</Link>
            </p>

            {success && (
              <button type="button" className="auth-submit" onClick={() => router.push("/login")}>
                Нэвтрэх рүү очих
              </button>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
