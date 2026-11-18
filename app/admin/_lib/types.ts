export type Role = "user" | "admin";
export type BookingStatus = "хүлээгдэж буй" | "баталгаажсан" | "цуцлагдсан";
export type CouponDiscountType = "percent" | "amount";

export interface Session {
  role: Role;
  name: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  joinedAt: string;
}

export interface Booking {
  id: string;
  name: string;
  phone: string;
  service: string;
  specialist: string;
  preferredDate: string;
  time: string;
  status: BookingStatus;
  note: string;
  servicePrice?: number;
  couponCode?: string;
  discountAmount?: number;
  totalAmount?: number;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  photo: string;
}

export interface Teacher {
  id: string;
  name: string;
  role: string;
  years: number;
  bio: string;
  photo: string;
  createdAt: string;
  initials: string;
  serviceIds: string[];
}

export interface Coupon {
  id: string;
  code: string;
  discountType: CouponDiscountType;
  value: number;
  expiresAt?: string;
  active: boolean;
  usageLimit?: number;
  usedCount: number;
  createdAt: string;
}

export type TabKey = "overview" | "users" | "bookings" | "teachers" | "services" | "coupons" | "appearance";
