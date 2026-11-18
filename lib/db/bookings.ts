import { randomUUID } from "crypto";
import { sql } from "./client";
import { ensureSchema } from "./schema";
import { normalizeCouponCode, sanitizeMoney, validateCouponRows } from "./coupons";
import { normalizePhone } from "./utils";
import type { BookingStatus, DbBooking } from "./types";

function rowToBooking(row: Record<string, unknown>): DbBooking {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    service: row.service as string,
    specialist: row.specialist as string,
    preferredDate: row.preferred_date as string,
    time: row.time as string,
    status: row.status as BookingStatus,
    note: row.note as string,
    servicePrice: row.service_price === null ? undefined : Number(row.service_price),
    couponCode: (row.coupon_code as string) ?? undefined,
    discountAmount: row.discount_amount === null ? undefined : Number(row.discount_amount),
    totalAmount: row.total_amount === null ? undefined : Number(row.total_amount),
    createdAt: row.created_at as string,
  };
}

export async function createBooking(input: {
  name?: string;
  phone?: string;
  service?: string;
  specialist?: string;
  preferredDate?: string;
  time?: string;
  note?: string;
  servicePrice?: number;
  couponCode?: string;
}) {
  await ensureSchema();

  const name = input.name?.trim() ?? "";
  const phone = input.phone ? normalizePhone(input.phone) : "";
  const service = input.service?.trim() ?? "";
  const servicePrice = sanitizeMoney(input.servicePrice);
  const couponCode = normalizeCouponCode(input.couponCode ?? "");
  const specialist = input.specialist?.trim() ?? "";
  const time = input.time ?? "";

  if (!name || !phone || !service || !input.preferredDate) {
    return { ok: false as const, message: "Шаардлагатай мэдээлэл дутуу байна." };
  }

  if (specialist && time) {
    const conflicts = await sql`
      SELECT id FROM bookings
      WHERE specialist = ${specialist} AND preferred_date = ${input.preferredDate} AND time = ${time}
        AND status <> 'цуцлагдсан'
      LIMIT 1
    `;
    if (conflicts.length > 0) {
      return { ok: false as const, message: "Уучлаарай, энэ цаг аль хэдийн захиалагдсан байна." };
    }
  }

  let discountAmount = 0;
  let totalAmount = servicePrice;

  if (couponCode) {
    const couponRows = await sql`SELECT * FROM coupons WHERE code = ${couponCode} LIMIT 1`;
    const couponResult = validateCouponRows(couponRows as Record<string, unknown>[], servicePrice);
    if (!couponResult.ok) {
      return { ok: false as const, message: couponResult.message };
    }

    discountAmount = couponResult.discountAmount;
    totalAmount = couponResult.totalAmount;
    await sql`UPDATE coupons SET used_count = used_count + 1 WHERE id = ${couponResult.coupon.id}`;
  }

  const booking: DbBooking = {
    id: randomUUID(),
    name,
    phone,
    service,
    specialist,
    preferredDate: input.preferredDate,
    time,
    note: input.note?.trim() ?? "",
    status: "хүлээгдэж буй",
    servicePrice,
    couponCode: couponCode || undefined,
    discountAmount,
    totalAmount,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  try {
    await sql`
      INSERT INTO bookings (id, name, phone, service, specialist, preferred_date, time, status, note, service_price, coupon_code, discount_amount, total_amount, created_at)
      VALUES (${booking.id}, ${booking.name}, ${booking.phone}, ${booking.service}, ${booking.specialist}, ${booking.preferredDate}, ${booking.time}, ${booking.status}, ${booking.note}, ${booking.servicePrice ?? null}, ${booking.couponCode ?? null}, ${booking.discountAmount ?? null}, ${booking.totalAmount ?? null}, ${booking.createdAt})
    `;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return { ok: false as const, message: "Уучлаарай, энэ цаг аль хэдийн захиалагдсан байна." };
    }
    throw error;
  }

  return { ok: true as const, booking };
}

export async function listBookings() {
  await ensureSchema();
  const rows = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
  return rows.map((row) => rowToBooking(row as Record<string, unknown>));
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  await ensureSchema();

  const rows = await sql`SELECT * FROM bookings WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) {
    return { ok: false as const, message: "Захиалга олдсонгүй." };
  }

  await sql`UPDATE bookings SET status = ${status} WHERE id = ${id}`;
  const booking = rowToBooking(rows[0]);
  booking.status = status;
  return { ok: true as const, booking };
}

export async function deleteBooking(id: string) {
  await ensureSchema();

  const rows = await sql`SELECT id FROM bookings WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) {
    return { ok: false as const, message: "Захиалга олдсонгүй." };
  }

  await sql`DELETE FROM bookings WHERE id = ${id}`;
  return { ok: true as const };
}
