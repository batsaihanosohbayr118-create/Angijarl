"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.5c0-.6.4-1 1-1H7.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1L6.6 10.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!name.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Бүх талбарыг бөглөнө үү.");
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
    if (!agree) {
      setError("Үйлчилгээний нөхцөлийг зөвшөөрнө үү.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setError(data.message ?? "Бүртгэл үүсгэх үед алдаа гарлаа.");
        return;
      }

      setSuccess(true);
      router.push("/login");
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
              <Image className="brand-logo" src="/logo.jpg" alt="АНГИЖРАЛ бариа заслын сургалтын төв" width={120} height={40} />
            </div>
            <div className="auth-visual-bottom">
              <h2>Өнөөдрөөс эрүүл дадал эхэлье</h2>
              <p>
                Бүртгүүлснээр цаг захиалга хийх, үйлчилгээний хөнгөлөлт авах, шинэ мэдээллийг эхэнд нь
                мэдэх боломжтой болно.
              </p>
            </div>
          </section>

          <section className="auth-form-side">
            <p className="auth-eyebrow">Шинэ хэрэглэгч</p>
            <h1>Бүртгүүлэх</h1>
            <p className="auth-subtext">
              Мэдээллээ бөглөж шинэ бүртгэл үүсгэнэ үү.
              <br />
              Админ эрхээр бүртгүүлэх шаардлагагүй — <a className="form-link" href="/login">эндээс</a> шууд нэвтэрнэ үү.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="register-name">Овог нэр</label>
                <div className="form-input-wrap">
                  <UserIcon />
                  <input
                    id="register-name"
                    type="text"
                    placeholder="Овог нэрээ оруулна уу"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setError("");
                      setSuccess(false);
                    }}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="register-phone">Утасны дугаар</label>
                <div className="form-input-wrap">
                  <PhoneIcon />
                  <input
                    id="register-phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="9127 1178"
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      setError("");
                      setSuccess(false);
                    }}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="register-password">Нууц үг</label>
                <div className="form-input-wrap">
                  <LockIcon />
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Хамгийн багадаа 6 тэмдэгт"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                      setSuccess(false);
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
                <label htmlFor="register-confirm">Нууц үг давтах</label>
                <div className="form-input-wrap">
                  <LockIcon />
                  <input
                    id="register-confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="Нууц үгээ дахин оруулна уу"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setError("");
                      setSuccess(false);
                    }}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && <p className="form-error">{error}</p>}
              {success && <p className="auth-success">Бүртгэл амжилттай үүслээ! Түр хүлээнэ үү...</p>}

              <div className="form-row-between">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(event) => setAgree(event.target.checked)}
                  />
                  Үйлчилгээний нөхцөлийг зөвшөөрч байна
                </label>
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Бүртгэж байна..." : "Бүртгүүлэх"}
              </button>
            </form>

            <p className="auth-switch">
              Бүртгэлтэй юу? <a className="form-link" href="/login">Нэвтрэх</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
