import { randomUUID } from "crypto";
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

export async function createUser(input: { name: string; phone: string; password: string }) {
  await ensureSchema();

  const name = input.name.trim();
  const phone = normalizePhone(input.phone);
  const password = input.password;

  if (!name || !phone || !password) {
    return { ok: false as const, message: "Бүх талбарыг бөглөнө үү." };
  }

  if (password.length < 6) {
    return { ok: false as const, message: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой." };
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
    role: "user",
    passwordHash: passwordData.hash,
    passwordSalt: passwordData.salt,
    authProvider: "password",
    joinedAt: new Date().toISOString().slice(0, 10),
  };

  await sql`
    INSERT INTO users (id, name, phone, role, password_hash, password_salt, auth_provider, joined_at)
    VALUES (${user.id}, ${user.name}, ${user.phone}, ${user.role}, ${user.passwordHash}, ${user.passwordSalt}, ${user.authProvider}, ${user.joinedAt})
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
    user.googleSub = user.googleSub ?? googleSub;
    user.email = user.email ?? email;
    user.authProvider = user.authProvider ?? "google";
    await sql`
      UPDATE users SET google_sub = ${user.googleSub}, email = ${user.email}, auth_provider = ${user.authProvider}
      WHERE id = ${user.id}
    `;
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

export async function loginUser(input: { phone: string; password: string; role: Role }) {
  await ensureSchema();

  const phone = normalizePhone(input.phone);
  const rows = await sql`
    SELECT * FROM users WHERE role = ${input.role} AND lower(phone) = lower(${phone}) LIMIT 1
  `;

  const user = rows.length > 0 ? rowToUser(rows[0]) : null;

  if (!user || !verifyPassword(input.password, user.passwordHash, user.passwordSalt)) {
    return {
      ok: false as const,
      message: input.role === "admin" ? "Админы нэр эсвэл нууц үг буруу байна." : "Утасны дугаар эсвэл нууц үг буруу байна.",
    };
  }

  return { ok: true as const, user: toPublicUser(user) };
}

export async function resetUserPassword(input: { identifier: string; password: string }) {
  await ensureSchema();

  const identifier = input.identifier.trim();
  const normalizedIdentifier = normalizePhone(identifier).toLowerCase();
  const password = input.password;

  if (!identifier || !password) {
    return { ok: false as const, message: "Утас эсвэл имэйл, шинэ нууц үгээ оруулна уу." };
  }

  if (password.length < 6) {
    return { ok: false as const, message: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой." };
  }

  const rows = await sql`
    SELECT * FROM users
    WHERE role = 'user' AND (lower(phone) = ${normalizedIdentifier} OR lower(email) = lower(${identifier}))
    LIMIT 1
  `;

  if (rows.length === 0) {
    return { ok: false as const, message: "Ийм утас эсвэл имэйлтэй хэрэглэгч олдсонгүй." };
  }

  const user = rowToUser(rows[0]);
  const passwordData = hashPassword(password);
  user.passwordHash = passwordData.hash;
  user.passwordSalt = passwordData.salt;
  user.authProvider = user.authProvider ?? "password";

  await sql`
    UPDATE users SET password_hash = ${user.passwordHash}, password_salt = ${user.passwordSalt}, auth_provider = ${user.authProvider}
    WHERE id = ${user.id}
  `;

  return { ok: true as const, user: toPublicUser(user) };
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
