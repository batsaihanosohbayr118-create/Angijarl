import { createHash, randomInt, randomUUID, timingSafeEqual } from "crypto";
import { sql } from "./client";
import { ensureSchema } from "./schema";
import { hashPassword, normalizePhone, verifyPassword } from "./utils";
import type { DbUser, PublicUser, Role } from "./types";

function toPublicUser(user: DbUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email ?? (user.role === "admin" ? "osgoo@angijral.mn" : "-"),
    role: user.role,
    joinedAt: user.joinedAt,
  };
}

function rowToUser(row: Record<string, unknown>): DbUser {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    email: (row.email as string) ?? undefined,
    role: row.role as Role,
    passwordHash: row.password_hash as string,
    passwordSalt: row.password_salt as string,
    googleSub: (row.google_sub as string) ?? undefined,
    authProvider: (row.auth_provider as "password" | "google") ?? undefined,
    joinedAt: row.joined_at as string,
  };
}

export async function createUser(input: { name: string; email: string; phone: string; password: string }) {
  await ensureSchema();

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = normalizePhone(input.phone);
  const password = input.password;

  if (!name || !email || !phone || !password) {
    return { ok: false as const, message: "Бүх талбарыг бөглөнө үү." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, message: "Имэйл хаяг буруу байна." };
  }

  if (password.length < 6) {
    return { ok: false as const, message: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой." };
  }

  const existingEmail = await sql`SELECT id FROM users WHERE lower(email) = ${email}`;
  if (existingEmail.length > 0) {
    return { ok: false as const, message: "Энэ имэйл хаягаар бүртгэл үүссэн байна." };
  }

  const existingRows = await sql`SELECT id FROM users WHERE lower(phone) = lower(${phone})`;
  if (existingRows.length > 0) {
    return { ok: false as const, message: "Энэ утасны дугаараар бүртгэл үүссэн байна." };
  }

  const passwordData = hashPassword(password);
  const user: DbUser = {
    id: randomUUID(),
    name,
    phone,
    email,
    role: "user",
    passwordHash: passwordData.hash,
    passwordSalt: passwordData.salt,
    authProvider: "password",
    joinedAt: new Date().toISOString().slice(0, 10),
  };

  await sql`
    INSERT INTO users (id, name, phone, email, role, password_hash, password_salt, auth_provider, joined_at)
    VALUES (${user.id}, ${user.name}, ${user.phone}, ${user.email}, ${user.role}, ${user.passwordHash}, ${user.passwordSalt}, ${user.authProvider}, ${user.joinedAt})
  `;

  return { ok: true as const, user: toPublicUser(user) };
}

export async function loginGoogleUser(input: { googleSub: string; email: string; name: string }) {
  await ensureSchema();

  const googleSub = input.googleSub.trim();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim() || email.split("@")[0] || "Google хэрэглэгч";

  if (!googleSub || !email) {
    return { ok: false as const, message: "Google бүртгэлийн мэдээлэл дутуу байна." };
  }

  const rows = await sql`
    SELECT * FROM users WHERE google_sub = ${googleSub} OR lower(email) = ${email} LIMIT 1
  `;

  if (rows.length > 0) {
    const user = rowToUser(rows[0]);
    const firstGoogleLink = !user.googleSub;
    user.googleSub = user.googleSub ?? googleSub;
    user.email = user.email ?? email;
    user.authProvider = user.authProvider ?? "google";

    if (firstGoogleLink) {
      /*
       * Имэйлээр бүртгүүлэхэд имэйлийг баталгаажуулдаггүй тул хэн нэгэн бусдын имэйлээр
       * урьдчилан бүртгүүлсэн байж болно. Google имэйлийг эзэмшдэг нь батлагдсан тул
       * хуучин нууц үгийг хүчингүй болгоно (эзэн нь "Нууц үг сэргээх"-ээр шинээр тохируулж болно).
       */
      const placeholder = hashPassword(randomUUID());
      await sql`
        UPDATE users SET google_sub = ${user.googleSub}, email = ${user.email}, auth_provider = ${user.authProvider},
          password_hash = ${placeholder.hash}, password_salt = ${placeholder.salt}
        WHERE id = ${user.id}
      `;
    } else {
      await sql`
        UPDATE users SET google_sub = ${user.googleSub}, email = ${user.email}, auth_provider = ${user.authProvider}
        WHERE id = ${user.id}
      `;
    }
    return { ok: true as const, user: toPublicUser(user) };
  }

  const placeholderPassword = hashPassword(randomUUID());
  const googleUser: DbUser = {
    id: randomUUID(),
    name,
    phone: email,
    email,
    role: "user",
    passwordHash: placeholderPassword.hash,
    passwordSalt: placeholderPassword.salt,
    googleSub,
    authProvider: "google",
    joinedAt: new Date().toISOString().slice(0, 10),
  };

  await sql`
    INSERT INTO users (id, name, phone, email, role, password_hash, password_salt, google_sub, auth_provider, joined_at)
    VALUES (${googleUser.id}, ${googleUser.name}, ${googleUser.phone}, ${googleUser.email}, ${googleUser.role}, ${googleUser.passwordHash}, ${googleUser.passwordSalt}, ${googleUser.googleSub}, ${googleUser.authProvider}, ${googleUser.joinedAt})
  `;

  return { ok: true as const, user: toPublicUser(googleUser) };
}

export async function loginUser(input: { identifier: string; password: string; role: Role }) {
  await ensureSchema();

  /* Хэрэглэгч имэйлээрээ, админ админ нэрээрээ (phone багана) нэвтэрнэ */
  const identifier = input.identifier.trim();
  const rows =
    input.role === "user"
      ? await sql`SELECT * FROM users WHERE role = 'user' AND lower(email) = lower(${identifier}) LIMIT 1`
      : await sql`SELECT * FROM users WHERE role = ${input.role} AND lower(phone) = lower(${normalizePhone(identifier)}) LIMIT 1`;

  const user = rows.length > 0 ? rowToUser(rows[0]) : null;

  if (!user || !verifyPassword(input.password, user.passwordHash, user.passwordSalt)) {
    return {
      ok: false as const,
      message: input.role === "admin" ? "Админы нэр эсвэл нууц үг буруу байна." : "Имэйл хаяг эсвэл нууц үг буруу байна.",
    };
  }

  return { ok: true as const, user: toPublicUser(user) };
}

/* ---------- Нууц үг сэргээх (имэйлээр илгээсэн 6 оронтой кодоор) ---------- */

const RESET_CODE_TTL_MINUTES = 10;
const RESET_MAX_ATTEMPTS = 5;
const RESET_RESEND_SECONDS = 60;

function hashResetCode(userId: string, code: string) {
  return createHash("sha256").update(`${userId}:${code}`).digest("hex");
}

async function findUserByIdentifier(identifier: string) {
  const trimmed = identifier.trim();
  if (!trimmed) return null;
  const normalized = normalizePhone(trimmed).toLowerCase();
  const rows = await sql`
    SELECT * FROM users
    WHERE role = 'user' AND (lower(phone) = ${normalized} OR lower(email) = lower(${trimmed}))
    LIMIT 1
  `;
  return rows.length > 0 ? rowToUser(rows[0]) : null;
}

/**
 * Код үүсгэж хадгална. Хэрэглэгч олдохгүй / имэйлгүй / саяхан илгээсэн бол `send: null`.
 * Бүртгэл байгаа эсэхийг гадагш мэдэгдэхгүйн тулд дуудагч тал ижил хариу буцаана.
 */
export async function createPasswordResetCode(identifier: string) {
  await ensureSchema();

  const user = await findUserByIdentifier(identifier);
  if (!user?.email) return { send: null };

  const recent = await sql`
    SELECT 1 FROM password_resets
    WHERE user_id = ${user.id} AND created_at > now() - make_interval(secs => ${RESET_RESEND_SECONDS})
  `;
  if (recent.length > 0) return { send: null };

  const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
  await sql`
    INSERT INTO password_resets (user_id, code_hash, expires_at, attempts, created_at)
    VALUES (${user.id}, ${hashResetCode(user.id, code)}, now() + make_interval(mins => ${RESET_CODE_TTL_MINUTES}), 0, now())
    ON CONFLICT (user_id) DO UPDATE
      SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at, attempts = 0, created_at = now()
  `;

  return { send: { email: user.email, name: user.name, code, ttlMinutes: RESET_CODE_TTL_MINUTES } };
}

export async function resetPasswordWithCode(input: { identifier: string; code: string; password: string }) {
  await ensureSchema();

  const invalid = { ok: false as const, message: "Код буруу эсвэл хугацаа нь дууссан байна. Шинэ код авна уу." };
  const code = input.code.replace(/\s+/g, "");

  if (input.password.length < 6) {
    return { ok: false as const, message: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой." };
  }
  if (!/^\d{6}$/.test(code)) return invalid;

  const user = await findUserByIdentifier(input.identifier);
  if (!user) return invalid;

  const rows = await sql`
    SELECT code_hash, attempts, expires_at > now() AS valid FROM password_resets WHERE user_id = ${user.id}
  `;
  if (rows.length === 0) return invalid;

  const row = rows[0] as { code_hash: string; attempts: number; valid: boolean };
  if (!row.valid || row.attempts >= RESET_MAX_ATTEMPTS) {
    await sql`DELETE FROM password_resets WHERE user_id = ${user.id}`;
    return invalid;
  }

  const expected = Buffer.from(row.code_hash);
  const actual = Buffer.from(hashResetCode(user.id, code));
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    await sql`UPDATE password_resets SET attempts = attempts + 1 WHERE user_id = ${user.id}`;
    return invalid;
  }

  const passwordData = hashPassword(input.password);
  await sql`
    UPDATE users
    SET password_hash = ${passwordData.hash}, password_salt = ${passwordData.salt},
        auth_provider = ${user.authProvider ?? "password"}
    WHERE id = ${user.id}
  `;
  await sql`DELETE FROM password_resets WHERE user_id = ${user.id}`;

  return { ok: true as const };
}

export async function listUsers() {
  await ensureSchema();
  const rows = await sql`SELECT * FROM users ORDER BY joined_at DESC`;
  return rows.map((row) => toPublicUser(rowToUser(row as Record<string, unknown>)));
}

export async function updateUserRole(id: string, role: Role) {
  await ensureSchema();

  const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) {
    return { ok: false as const, message: "Хэрэглэгч олдсонгүй." };
  }

  const user = rowToUser(rows[0]);
  const [{ count: adminCount }] = (await sql`SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'`) as {
    count: number;
  }[];

  if (user.role === "admin" && role === "user" && adminCount <= 1) {
    return { ok: false as const, message: "Сүүлийн админ эрхийг хасах боломжгүй." };
  }

  await sql`UPDATE users SET role = ${role} WHERE id = ${id}`;
  user.role = role;
  return { ok: true as const, user: toPublicUser(user) };
}

export async function deleteUser(id: string) {
  await ensureSchema();

  const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) {
    return { ok: false as const, message: "Хэрэглэгч олдсонгүй." };
  }

  const user = rowToUser(rows[0]);
  const [{ count: adminCount }] = (await sql`SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'`) as {
    count: number;
  }[];

  if (user.role === "admin" && adminCount <= 1) {
    return { ok: false as const, message: "Сүүлийн админ хэрэглэгчийг устгах боломжгүй." };
  }

  await sql`DELETE FROM users WHERE id = ${id}`;
  return { ok: true as const };
}
