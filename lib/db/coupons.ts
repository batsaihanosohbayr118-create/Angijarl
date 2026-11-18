import { randomUUID } from "crypto";
import { sql } from "./client";
import { ensureSchema } from "./schema";
import type { CouponDiscountType, DbCoupon } from "./types";

export function normalizeCouponCode(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function sanitizeMoney(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount);
}

function sanitizeCouponValue(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.round(amount);
}

function calculateDiscount(coupon: Pick<DbCoupon, "discountType" | "value">, subtotal: number) {
  if (subtotal <= 0) return 0;
  if (coupon.discountType === "percent") {
    return Math.min(subtotal, Math.round((subtotal * coupon.value) / 100));
  }
  return Math.min(subtotal, Math.round(coupon.value));
}

function rowToCoupon(row: Record<string, unknown>): DbCoupon {
  return {
    id: row.id as string,
    code: row.code as string,
    discountType: row.discount_type as CouponDiscountType,
    value: Number(row.value),
    expiresAt: (row.expires_at as string) ?? undefined,
    active: Boolean(row.active),
    usageLimit: row.usage_limit === null ? undefined : Number(row.usage_limit),
    usedCount: Number(row.used_count),
    createdAt: row.created_at as string,
  };
}

export function validateCouponRows(rows: Record<string, unknown>[], subtotal: number) {
  if (rows.length === 0) {
    return { ok: false as const, message: "Купон код олдсонгүй." };
  }

  const coupon = rowToCoupon(rows[0]);

  if (!coupon.active) {
    return { ok: false as const, message: "Энэ купон идэвхгүй байна." };
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date().toISOString().slice(0, 10)) {
    return { ok: false as const, message: "Энэ купоны хугацаа дууссан байна." };
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false as const, message: "Энэ купоны ашиглах лимит дууссан байна." };
  }

  if (subtotal <= 0) {
    return { ok: false as const, message: "Үйлчилгээний үнэ сонгогдоогүй байна." };
  }

  const discountAmount = calculateDiscount(coupon, subtotal);

  return {
    ok: true as const,
    coupon,
    discountAmount,
    totalAmount: Math.max(subtotal - discountAmount, 0),
  };
}

function toPublicCoupon(coupon: DbCoupon) {
  return {
    ...coupon,
    code: normalizeCouponCode(coupon.code),
    value: sanitizeCouponValue(coupon.value),
    usageLimit: coupon.usageLimit ? sanitizeCouponValue(coupon.usageLimit) : undefined,
    usedCount: Math.max(0, Math.round(Number(coupon.usedCount) || 0)),
  };
}

export async function listCoupons() {
  await ensureSchema();
  const rows = await sql`SELECT * FROM coupons ORDER BY created_at DESC`;
  return rows.map((row) => toPublicCoupon(rowToCoupon(row as Record<string, unknown>)));
}

export async function validateCoupon(input: { code?: string; subtotal?: number }) {
  await ensureSchema();

  const code = normalizeCouponCode(input.code ?? "");
  const subtotal = sanitizeMoney(input.subtotal);

  if (!code) {
    return { ok: false as const, message: "Купон кодоо оруулна уу." };
  }

  const rows = await sql`SELECT * FROM coupons WHERE code = ${code} LIMIT 1`;
  const result = validateCouponRows(rows as Record<string, unknown>[], subtotal);
  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    coupon: toPublicCoupon(result.coupon),
    discountAmount: result.discountAmount,
    totalAmount: result.totalAmount,
  };
}

export async function createCoupon(input: {
  code?: string;
  discountType?: CouponDiscountType;
  value?: number;
  expiresAt?: string;
  active?: boolean;
  usageLimit?: number;
}) {
  await ensureSchema();

  const code = normalizeCouponCode(input.code ?? "");
  const discountType = input.discountType === "amount" ? "amount" : "percent";
  const value = sanitizeCouponValue(input.value);
  const expiresAt = input.expiresAt?.trim() || undefined;
  const usageLimit = input.usageLimit ? sanitizeCouponValue(input.usageLimit) : undefined;

  if (!code || value <= 0) {
    return { ok: false as const, message: "Код болон хөнгөлөлтийн хэмжээг зөв оруулна уу." };
  }

  if (discountType === "percent" && value > 100) {
    return { ok: false as const, message: "Хувийн хөнгөлөлт 100-аас их байж болохгүй." };
  }

  const existing = await sql`SELECT id FROM coupons WHERE code = ${code} LIMIT 1`;
  if (existing.length > 0) {
    return { ok: false as const, message: "Энэ купон код аль хэдийн байна." };
  }

  const coupon: DbCoupon = {
    id: randomUUID(),
    code,
    discountType,
    value,
    expiresAt,
    active: input.active ?? true,
    usageLimit,
    usedCount: 0,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  await sql`
    INSERT INTO coupons (id, code, discount_type, value, expires_at, active, usage_limit, used_count, created_at)
    VALUES (${coupon.id}, ${coupon.code}, ${coupon.discountType}, ${coupon.value}, ${coupon.expiresAt ?? null}, ${coupon.active}, ${coupon.usageLimit ?? null}, ${coupon.usedCount}, ${coupon.createdAt})
  `;

  return { ok: true as const, coupon: toPublicCoupon(coupon) };
}

export async function updateCoupon(
  id: string,
  input: {
    code?: string;
    discountType?: CouponDiscountType;
    value?: number;
    expiresAt?: string;
    active?: boolean;
    usageLimit?: number;
  }
) {
  await ensureSchema();

  const code = normalizeCouponCode(input.code ?? "");
  const discountType = input.discountType === "amount" ? "amount" : "percent";
  const value = sanitizeCouponValue(input.value);
  const expiresAt = input.expiresAt?.trim() || undefined;
  const usageLimit = input.usageLimit ? sanitizeCouponValue(input.usageLimit) : undefined;

  if (!code || value <= 0) {
    return { ok: false as const, message: "Код болон хөнгөлөлтийн хэмжээг зөв оруулна уу." };
  }

  if (discountType === "percent" && value > 100) {
    return { ok: false as const, message: "Хувийн хөнгөлөлт 100-аас их байж болохгүй." };
  }

  const rows = await sql`SELECT id FROM coupons WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) {
    return { ok: false as const, message: "Купон олдсонгүй." };
  }

  const duplicate = await sql`SELECT id FROM coupons WHERE id <> ${id} AND code = ${code} LIMIT 1`;
  if (duplicate.length > 0) {
    return { ok: false as const, message: "Энэ купон код аль хэдийн байна." };
  }

  await sql`
    UPDATE coupons SET code = ${code}, discount_type = ${discountType}, value = ${value}, expires_at = ${expiresAt ?? null}, active = ${input.active ?? true}, usage_limit = ${usageLimit ?? null}
    WHERE id = ${id}
  `;

  const updatedRows = await sql`SELECT * FROM coupons WHERE id = ${id} LIMIT 1`;
  return { ok: true as const, coupon: toPublicCoupon(rowToCoupon(updatedRows[0] as Record<string, unknown>)) };
}

export async function deleteCoupon(id: string) {
  await ensureSchema();

  const rows = await sql`SELECT id FROM coupons WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) {
    return { ok: false as const, message: "Купон олдсонгүй." };
  }

  await sql`DELETE FROM coupons WHERE id = ${id}`;
  return { ok: true as const };
}
