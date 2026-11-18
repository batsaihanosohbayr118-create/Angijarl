export type Role = "user" | "admin";

export interface DbUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  passwordHash: string;
  passwordSalt: string;
  googleSub?: string;
  authProvider?: "password" | "google";
  joinedAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: Role;
  joinedAt: string;
}

export type BookingStatus = "хүлээгдэж буй" | "баталгаажсан" | "цуцлагдсан";
export type CouponDiscountType = "percent" | "amount";

export interface DbBooking {
  id: string;
  name: string;
  phone: string;
  service: string;
  specialist: string;
  preferredDate: string; // "2026-07-24"
  time: string; // "14:30"
  status: BookingStatus;
  note: string;
  servicePrice?: number;
  couponCode?: string;
  discountAmount?: number;
  totalAmount?: number;
  createdAt: string; // "2026-07-22"
}

export interface DbTestimonial {
  id: string;
  name: string;
  message: string;
  rating: number;
  createdAt: string;
}

export interface DbTeacher {
  id: string;
  name: string;
  role: string;
  years: number;
  bio: string;
  photo?: string;
  serviceIds: string[];
  createdAt: string;
}

export interface DbService {
  id: string;
  title: string;
  description: string;
  photo: string;
  createdAt: string;
}

export interface DbCoupon {
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
