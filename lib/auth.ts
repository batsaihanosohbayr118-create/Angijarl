import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { PublicUser, Role } from "./db/types";

/**
 * Серверийн талын нэвтрэлт.
 * Нэвтрэх үед HMAC гарын үсэгтэй, HttpOnly cookie олгож,
 * admin API-ууд энэ cookie-г шалгана. (localStorage-ийн session нь зөвхөн UI-д зориулагдсан.)
 */

export const AUTH_COOKIE = "angijral_auth";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 хоног

type TokenPayload = { sub: string; role: Role; exp: number };

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET орчны хувьсагч тохируулаагүй эсвэл хэт богино байна (32+ тэмдэгт).");
  }
  return secret;
}

function sign(data: string) {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

function createToken(user: Pick<PublicUser, "id" | "role">) {
  const payload: TokenPayload = {
    sub: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function verifyToken(token: string | undefined): TokenPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = Buffer.from(sign(body));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as TokenPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, user: Pick<PublicUser, "id" | "role">) {
  response.cookies.set(AUTH_COOKIE, createToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return response;
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}

/** Admin биш бол 401 хариу буцаана, admin бол null. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const store = await cookies();
  const payload = verifyToken(store.get(AUTH_COOKIE)?.value);
  if (payload?.role === "admin") return null;
  return NextResponse.json({ message: "Админ эрхээр нэвтэрнэ үү." }, { status: 401 });
}
