import { randomUUID } from "crypto";
import { sql } from "./client";
import { ensureSchema } from "./schema";
import { teacherPhotoFallback } from "./seed";
import { createInitials } from "./utils";
import type { DbTeacher } from "./types";

function rowToTeacher(row: Record<string, unknown>): DbTeacher {
  const serviceIds = row.service_ids;
  return {
    id: row.id as string,
    name: row.name as string,
    role: row.role as string,
    years: Number(row.years),
    bio: row.bio as string,
    photo: (row.photo as string) ?? undefined,
    serviceIds: Array.isArray(serviceIds) ? (serviceIds as string[]) : [],
    createdAt: row.created_at as string,
  };
}

function toPublicTeacher(teacher: DbTeacher, index = 0) {
  return {
    ...teacher,
    photo: teacher.photo?.trim() || teacherPhotoFallback(teacher, index),
    initials: createInitials(teacher.name),
    serviceIds: Array.isArray(teacher.serviceIds) ? teacher.serviceIds : [],
  };
}

export async function listTeachers() {
  await ensureSchema();
  const rows = await sql`SELECT * FROM teachers ORDER BY created_at DESC`;
  return rows.map((row, index) => toPublicTeacher(rowToTeacher(row as Record<string, unknown>), index));
}

export async function createTeacher(input: {
  name?: string;
  role?: string;
  years?: number;
  bio?: string;
  photo?: string;
  serviceIds?: string[];
}) {
  await ensureSchema();

  const name = input.name?.trim() ?? "";
  const role = input.role?.trim() ?? "";
  const years = Number(input.years);
  const bio = input.bio?.trim() ?? "";
  const photo = input.photo?.trim() ?? "";
  const serviceIds = Array.isArray(input.serviceIds) ? input.serviceIds.filter((id) => typeof id === "string") : [];

  if (!name || !role || !bio) {
    return { ok: false as const, message: "Нэр, албан тушаал, тайлбарыг бөглөнө үү." };
  }

  if (!Number.isInteger(years) || years < 0 || years > 60) {
    return { ok: false as const, message: "Туршлага 0-60 жилийн хооронд байх ёстой." };
  }

  const teacher: DbTeacher = {
    id: randomUUID(),
    name,
    role,
    years,
    bio,
    photo,
    serviceIds,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  await sql`
    INSERT INTO teachers (id, name, role, years, bio, photo, service_ids, created_at)
    VALUES (${teacher.id}, ${teacher.name}, ${teacher.role}, ${teacher.years}, ${teacher.bio}, ${teacher.photo}, ${JSON.stringify(teacher.serviceIds)}, ${teacher.createdAt})
  `;

  return { ok: true as const, teacher: toPublicTeacher(teacher) };
}

export async function updateTeacher(
  id: string,
  input: { name?: string; role?: string; years?: number; bio?: string; photo?: string; serviceIds?: string[] }
) {
  await ensureSchema();

  const name = input.name?.trim() ?? "";
  const role = input.role?.trim() ?? "";
  const years = Number(input.years);
  const bio = input.bio?.trim() ?? "";
  const photo = input.photo?.trim() ?? "";
  const serviceIds = Array.isArray(input.serviceIds) ? input.serviceIds.filter((id) => typeof id === "string") : [];

  if (!name || !role || !bio) {
    return { ok: false as const, message: "Нэр, албан тушаал, тайлбарыг бөглөнө үү." };
  }

  if (!Number.isInteger(years) || years < 0 || years > 60) {
    return { ok: false as const, message: "Туршлага 0-60 жилийн хооронд байх ёстой." };
  }

  const rows = await sql`SELECT id FROM teachers WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) {
    return { ok: false as const, message: "Бариач олдсонгүй." };
  }

  await sql`
    UPDATE teachers SET name = ${name}, role = ${role}, years = ${years}, bio = ${bio}, photo = ${photo}, service_ids = ${JSON.stringify(serviceIds)}
    WHERE id = ${id}
  `;

  const teacher: DbTeacher = { id, name, role, years, bio, photo, serviceIds, createdAt: "" };
  return { ok: true as const, teacher: toPublicTeacher(teacher) };
}

export async function deleteTeacher(id: string) {
  await ensureSchema();

  const rows = await sql`SELECT id FROM teachers WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) {
    return { ok: false as const, message: "Бариач олдсонгүй." };
  }

  await sql`DELETE FROM teachers WHERE id = ${id}`;
  return { ok: true as const };
}
