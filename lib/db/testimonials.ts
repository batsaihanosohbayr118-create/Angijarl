import { randomUUID } from "crypto";
import { sql } from "./client";
import { ensureSchema } from "./schema";
import { createInitials } from "./utils";
import type { DbTestimonial } from "./types";

function rowToTestimonial(row: Record<string, unknown>): DbTestimonial {
  return {
    id: row.id as string,
    name: row.name as string,
    message: row.message as string,
    rating: Number(row.rating),
    createdAt: row.created_at as string,
  };
}

export async function listTestimonials() {
  await ensureSchema();
  const rows = await sql`SELECT * FROM testimonials ORDER BY created_at DESC`;
  return rows.map((row) => {
    const testimonial = rowToTestimonial(row as Record<string, unknown>);
    return { ...testimonial, initials: createInitials(testimonial.name) };
  });
}

export async function createTestimonial(input: { name?: string; message?: string; rating?: number }) {
  await ensureSchema();

  const name = input.name?.trim() ?? "";
  const message = input.message?.trim() ?? "";
  const rating = Number(input.rating);

  if (!name || !message) {
    return { ok: false as const, message: "Нэр болон сэтгэгдлээ оруулна уу." };
  }

  if (name.length > 60) {
    return { ok: false as const, message: "Нэр 60 тэмдэгтээс ихгүй байх ёстой." };
  }

  if (message.length < 10) {
    return { ok: false as const, message: "Сэтгэгдэл хамгийн багадаа 10 тэмдэгт байх ёстой." };
  }

  if (message.length > 500) {
    return { ok: false as const, message: "Сэтгэгдэл 500 тэмдэгтээс ихгүй байх ёстой." };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false as const, message: "Үнэлгээ 1-5 хооронд байх ёстой." };
  }

  const testimonial: DbTestimonial = {
    id: randomUUID(),
    name,
    message,
    rating,
    createdAt: new Date().toISOString(),
  };

  await sql`
    INSERT INTO testimonials (id, name, message, rating, created_at)
    VALUES (${testimonial.id}, ${testimonial.name}, ${testimonial.message}, ${testimonial.rating}, ${testimonial.createdAt})
  `;

  return {
    ok: true as const,
    testimonial: { ...testimonial, initials: createInitials(testimonial.name) },
  };
}
