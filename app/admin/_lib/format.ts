import type { BookingStatus, Coupon } from "./types";

export function statusBadgeClass(status: BookingStatus) {
  if (status === "хүлээгдэж буй") return "pending";
  if (status === "баталгаажсан") return "confirmed";
  return "cancelled";
}

export function formatMoney(amount?: number) {
  if (typeof amount !== "number" || !Number.isFinite(amount)) return "—";
  return `${new Intl.NumberFormat("mn-MN").format(amount)}₮`;
}

export function formatCouponValue(coupon: Pick<Coupon, "discountType" | "value">) {
  return coupon.discountType === "percent" ? `${coupon.value}%` : formatMoney(coupon.value);
}
