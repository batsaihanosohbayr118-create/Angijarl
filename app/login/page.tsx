"use client";

import Image from "next/image";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface GoogleCredentialResponse {
  credential?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
          renderButton: (
            element: HTMLElement,
            options: { theme: "outline"; size: "large"; shape: "pill"; text: "continue_with"; width?: number }
          ) => void;
        };
      };
    };
  }
}

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

export default function LoginPage() {
  const router = useRouter();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState<"user" | "admin">("user");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [googleScriptReady, setGoogleScriptReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const switchRole = (nextRole: "user" | "admin") => {
    setRole(nextRole);
    setPhone("");
    setPassword("");
    setError("");
    setGoogleError("");
    setSuccess(false);
  };

  const handleGoogleCredential = useCallback(
    async (googleResponse: GoogleCredentialResponse) => {
      setError("");
      setGoogleError("");
      setSuccess(false);

      if (!googleResponse.credential) {
        setGoogleError("Google нэвтрэлтийн мэдээлэл ирсэнгүй.");
        return;
      }

      try {
        setGoogleLoading(true);
        const response = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: googleResponse.credential }),
        });
        const data = (await response.json()) as {
          message?: string;
          user?: { name: string; email: string; role: "user" | "admin" };
        };

        if (!response.ok || !data.user) {
          setGoogleError(data.message ?? "Google-ээр нэвтрэх үед алдаа гарлаа.");
          return;
        }

        setSuccess(true);
        window.localStorage.setItem(
          "angijral_session",
          JSON.stringify({ role: data.user.role, name: data.user.name, email: data.user.email })
        );
        router.push("/");
      } catch {
        setGoogleError("Сервертэй холбогдоход алдаа гарлаа.");
      } finally {
        setGoogleLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (role !== "user" || !googleClientId || !googleScriptReady || !window.google || !googleButtonRef.current) {
      return;
    }

    googleButtonRef.current.innerHTML = "";
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredential,
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "continue_with",
      width: Math.min(400, googleButtonRef.current.offsetWidth || 320),
    });
  }, [googleClientId, googleScriptReady, handleGoogleCredential, role]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!phone.trim() || !password.trim()) {
      setError(role === "admin" ? "Админ нэр болон нууц үгээ оруулна уу." : "Утасны дугаар болон нууц үгээ оруулна уу.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password, role }),
      });
      const data = (await response.json()) as {
        message?: string;
        user?: { name: string; role: "user" | "admin" };
      };

      if (!response.ok || !data.user) {
        setError(data.message ?? "Нэвтрэх үед алдаа гарлаа.");
        return;
      }

      setSuccess(true);
      window.localStorage.setItem(
        "angijral_session",
        JSON.stringify({ role: data.user.role, name: data.user.name })
      );
      router.push(data.user.role === "admin" ? "/admin" : "/");
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
              <h2>Эрүүл бие, тайван сэтгэлийн эхлэл</h2>
              <p>
                Бүртгэлдээ нэвтэрч цаг захиалга, үйлчилгээний түүхээ хянаж, хөнгөлөлттэй саналуудыг цаг
                алдалгүй аваарай.
              </p>
            </div>
          </section>

          <section className="auth-form-side">
            <p className="auth-eyebrow">Тавтай морил</p>
            <h1>Нэвтрэх</h1>
            <p className="auth-subtext">
              {role === "admin"
                ? "Админ эрхээрээ шууд нэвтэрнэ үү."
                : "Бүртгэлтэй хаягаараа нэвтэрч үргэлжлүүлнэ үү."}
            </p>

            <div className="auth-role-tabs" role="tablist" aria-label="Нэвтрэх эрх">
              <button
                type="button"
                role="tab"
                aria-selected={role === "user"}
                className={`auth-role-tab${role === "user" ? " active" : ""}`}
                onClick={() => switchRole("user")}
              >
                Хэрэглэгч
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={role === "admin"}
                className={`auth-role-tab${role === "admin" ? " active" : ""}`}
                onClick={() => switchRole("admin")}
              >
                Админ
              </button>
            </div>

            {role === "user" && (
              <>
                <Script
                  src="https://accounts.google.com/gsi/client"
                  strategy="afterInteractive"
                  onLoad={() => setGoogleScriptReady(true)}
                  onError={() => setGoogleError("Google нэвтрэлтийн script ачаалж чадсангүй.")}
                />
                <div className="auth-google-area">
                  {googleClientId ? (
                    <div ref={googleButtonRef} className="auth-google-button" aria-label="Google-ээр нэвтрэх" />
                  ) : (
                    <button type="button" className="auth-google-fallback" disabled>
                      Google тохиргоо дутуу
                    </button>
                  )}
                  {googleLoading && <p className="auth-inline-status">Google-ээр нэвтэрч байна...</p>}
                  {googleError && <p className="form-error">{googleError}</p>}
                </div>
                <div className="auth-divider">эсвэл</div>
              </>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="login-phone">{role === "admin" ? "Админ нэр" : "Утасны дугаар"}</label>
                <div className="form-input-wrap">
                  <UserIcon />
                  <input
                    id="login-phone"
                    type={role === "admin" ? "text" : "tel"}
                    inputMode={role === "admin" ? "text" : "tel"}
                    placeholder={role === "admin" ? "Админ нэрээ оруулна уу" : "9127 1178"}
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      setError("");
                      setSuccess(false);
                    }}
                    autoComplete={role === "admin" ? "username" : "tel"}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="login-password">Нууц үг</label>
                <div className="form-input-wrap">
                  <LockIcon />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Нууц үгээ оруулна уу"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                      setSuccess(false);
                    }}
                    autoComplete="current-password"
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

              {error && <p className="form-error">{error}</p>}
              {success && (
                <p className="auth-success">
                  {role === "admin" ? "Админ эрхээр нэвтэрлээ! Түр хүлээнэ үү..." : "Амжилттай нэвтэрлээ! Түр хүлээнэ үү..."}
                </p>
              )}

              <div className="form-row-between">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  Намайг сана
                </label>
                {role === "user" && (
                  <a className="form-link" href="/forgot-password">
                    Нууц үгээ мартсан?
                  </a>
                )}
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? "Нэвтэрч байна..." : role === "admin" ? "Админаар нэвтрэх" : "Нэвтрэх"}
              </button>
            </form>

            {role === "user" ? (
              <p className="auth-switch">
                Бүртгэлгүй юу? <a className="form-link" href="/register">Бүртгүүлэх</a>
              </p>
            ) : (
              <p className="auth-switch">Админ эрхээр бүртгүүлэх шаардлагагүй, шууд нэвтэрнэ.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
