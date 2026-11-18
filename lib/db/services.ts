import { randomUUID } from "crypto";
import { sql } from "./client";
import { ensureSchema } from "./schema";
import { defaultServicePhoto } from "./seed";
import type { DbService } from "./types";

function rowToService(row: Record<string, unknown>): DbService {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    photo: row.photo as string,
    createdAt: row.created_at as string,
  };
}

function toPublicService(service: DbService) {
  return {
    ...service,
    title: service.title.trim(),
    description: service.description.trim(),
    photo: service.photo.trim() || defaultServicePhoto,
  };
}

export async function listServices() {
  await ensureSchema();
  const rows = await sql`SELECT * FROM services ORDER BY created_at DESC`;
  return rows.map((row) => toPublicService(rowToService(row as Record<string, unknown>)));
}

export async function createService(input: { title?: string; description?: string; photo?: string }) {
  await ensureSchema();

  const title = input.title?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const photo = input.photo?.trim() || defaultServicePhoto;

  if (!title) {
    return { ok: false as const, message: "Үйлчилгээний гарчгийг бөглөнө үү." };
  }

  const service: DbService = {
    id: randomUUID(),
    title,
    description,
    photo,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  await sql`
    INSERT INTO services (id, title, description, photo, created_at)
    VALUES (${service.id}, ${service.title}, ${service.description}, ${service.photo}, ${service.createdAt})
  `;

  return { ok: true as const, service: toPublicService(service) };
}

export async function updateService(id: string, input: { title?: string; description?: string; photo?: string }) {
  await ensureSchema();

  const title = input.title?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const photo = input.photo?.trim() || defaultServicePhoto;

  if (!title) {
    return { ok: false as const, message: "Үйлчилгээний гарчгийг бөглөнө үү." };
  }

  const rows = await sql`SELECT id FROM services WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) {
    return { ok: false as const, message: "Үйлчилгээ олдсонгүй." };
  }

  await sql`UPDATE services SET title = ${title}, description = ${description}, photo = ${photo} WHERE id = ${id}`;

  const service: DbService = { id, title, description, photo, createdAt: "" };
  return { ok: true as const, service: toPublicService(service) };
}

export async function deleteService(id: string) {
  await ensureSchema();

  const rows = await sql`SELECT id FROM services WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) {
    return { ok: false as const, message: "Үйлчилгээ олдсонгүй." };
  }

  await sql`DELETE FROM services WHERE id = ${id}`;
  return { ok: true as const };
}
