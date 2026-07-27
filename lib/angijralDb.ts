import { neon } from "@neondatabase/serverless";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "crypto";

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

const sql = neon(process.env.DATABASE_URL!);
const adminPassword = "Osohoo123456";

const defaultTeacherPhotos = [
  "https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=700",
  "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=700",
  "https://images.pexels.com/photos/6627534/pexels-photo-6627534.jpeg?auto=compress&cs=tinysrgb&w=700",
  "https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=700",
];

const defaultServicePhoto =
  "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=900";

const seedServices: DbService[] = [
  {
    id: "s1",
    title: "Оффис бариа засал",
    description: "Суудал дээр нь хийх хүзүү, толгой, мөр гарын бариа",
    photo: defaultServicePhoto,
    createdAt: "2026-01-14",
  },
  {
    id: "s2",
    title: "Байгууллагын бясалгал",
    description: "Стресс тайлж, бүтээмж нэмэх сонирхолтой хөтөлбөрт бүлгийн бясалгал",
    photo: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=900",
    createdAt: "2026-01-14",
  },
  {
    id: "s3",
    title: "Хоол зүйн сургалт",
    description: "Хоол зүйн бүлгийн сургалт болон ганцаарчилсан зөвлөгөө, дэглэм",
    photo: "https://images.pexels.com/photos/5905902/pexels-photo-5905902.jpeg?auto=compress&cs=tinysrgb&w=900",
    createdAt: "2026-01-14",
  },
  {
    id: "s4",
    title: "Сэтгэл зүйн сургалт",
    description: "Мэргэжлийн сэтгэл зүйчийн бүлгийн сургалт, зөвлөгөө",
    photo: "https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg?auto=compress&cs=tinysrgb&w=900",
    createdAt: "2026-01-14",
  },
];

function teacherPhotoFallback(teacher: Pick<DbTeacher, "id" | "name">, index = 0) {
  if (teacher.id === "teacher-bat-erdene") return defaultTeacherPhotos[0];
  if (teacher.id === "teacher-enkhtuyaa") return defaultTeacherPhotos[1];
  if (teacher.id === "teacher-orgil") return defaultTeacherPhotos[2];
  const code = [...teacher.name].reduce((sum, char) => sum + char.charCodeAt(0), index);
  return defaultTeacherPhotos[Math.abs(code) % defaultTeacherPhotos.length];
}

const seedTeachers: DbTeacher[] = [
  {
    id: "teacher-bat-erdene",
    name: "Б.Бат-Эрдэнэ",
    role: "Ахлах бариач",
    years: 15,
    bio: "Клиникийн болон эмчилгээний салбарт 15 гаруй жил ажилласан туршлагатай ахлах бариач. Анхан шатны болон нарийн мэргэжлийн бариа заслын үйлчилгээг үзүүлнэ.",
    photo: defaultTeacherPhotos[0],
    serviceIds: ["s1"],
    createdAt: "2026-01-14",
  },
  {
    id: "teacher-enkhtuyaa",
    name: "Ц.Энхтуяа",
    role: "Бариач",
    years: 10,
    bio: "Relax болон Cupping массажийн чиглэлээр мэргэшсэн, үйлчлүүлэгч бүрт хамгийн тохиромжтой аргыг сонгож үйлчилдэг.",
    photo: defaultTeacherPhotos[1],
    serviceIds: ["s1"],
    createdAt: "2026-01-14",
  },
  {
    id: "teacher-orgil",
    name: "Г.Оргил",
    role: "Бариач",
    years: 8,
    bio: "Спорт бариа болон гуаша заслын чиглэлээр ажилладаг бөгөөд тамирчид болон идэвхтэй амьдралын хэв маягтай үйлчлүүлэгчдэд эмчилгээ хийдэг.",
    photo: defaultTeacherPhotos[2],
    serviceIds: ["s1"],
    createdAt: "2026-01-14",
  },
  {
    id: "teacher-dolgor",
    name: "Д.Долгор",
    role: "Хоол зүйч",
    years: 5,
    bio: "Хоол боловсруулах эрхтэн системийн өвчин, харшил, жингийн илүүдэл зэрэгт хоол зүйн зөвлөгөө өгч, ганцаарчилсан дэглэм боловсруулдаг.",
    photo: defaultTeacherPhotos[3],
    serviceIds: ["s3"],
    createdAt: "2026-01-14",
  },
  {
    id: "teacher-saruul",
    name: "С.Саруул",
    role: "Сэтгэл зүйч",
    years: 7,
    bio: "Стресс, сэтгэл түгшилт, айдас, гэр бүлийн харилцааны асуудлаар зөвлөгөө өгч, сэтгэл заслын үйлчилгээ үзүүлдэг.",
    photo: defaultTeacherPhotos[0],
    serviceIds: ["s4"],
    createdAt: "2026-01-14",
  },
  {
    id: "teacher-ariunaa",
    name: "А.Ариунаа",
    role: "Бясалгалч",
    years: 9,
    bio: "Иога, бясалгалын багш. Олон улсын 'Yoga Alliance' байгууллагын RYT-500 зэрэгтэй.",
    photo: defaultTeacherPhotos[1],
    serviceIds: ["s2"],
    createdAt: "2026-01-14",
  },
];

function normalizePhone(value: string) {
  return value.trim().replace(/\s+/g, "");
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string) {
  const incoming = Buffer.from(hashPassword(password, salt).hash, "hex");
  const stored = Buffer.from(hash, "hex");
  return incoming.length === stored.length && timingSafeEqual(incoming, stored);
}

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

let schemaReady: Promise<void> | null = null;

async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          role TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          password_salt TEXT NOT NULL,
          google_sub TEXT,
          auth_provider TEXT,
          joined_at TEXT NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS bookings (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          service TEXT NOT NULL,
          specialist TEXT NOT NULL,
          preferred_date TEXT NOT NULL,
          time TEXT NOT NULL,
          status TEXT NOT NULL,
          note TEXT NOT NULL,
          service_price INTEGER,
          coupon_code TEXT,
          discount_amount INTEGER,
          total_amount INTEGER,
          created_at TEXT NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS testimonials (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          message TEXT NOT NULL,
          rating INTEGER NOT NULL,
          created_at TEXT NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS teachers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          years INTEGER NOT NULL,
          bio TEXT NOT NULL,
          photo TEXT,
          service_ids JSONB NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS services (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          photo TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS coupons (
          id TEXT PRIMARY KEY,
          code TEXT NOT NULL,
          discount_type TEXT NOT NULL,
          value INTEGER NOT NULL,
          expires_at TEXT,
          active BOOLEAN NOT NULL DEFAULT true,
          usage_limit INTEGER,
          used_count INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        )
      `;

      const [{ count: userCount }] = (await sql`SELECT COUNT(*)::int AS count FROM users`) as { count: number }[];
      if (userCount === 0) {
        const adminHash = hashPassword(adminPassword);
        await sql`
          INSERT INTO users (id, name, phone, role, password_hash, password_salt, joined_at)
          VALUES ('admin-osgoo', 'Osgoo', 'Osgoo', 'admin', ${adminHash.hash}, ${adminHash.salt}, '2026-01-14')
        `;
      }

      const [{ count: teacherCount }] = (await sql`SELECT COUNT(*)::int AS count FROM teachers`) as {
        count: number;
      }[];
      if (teacherCount === 0) {
        for (const teacher of seedTeachers) {
          await sql`
            INSERT INTO teachers (id, name, role, years, bio, photo, service_ids, created_at)
            VALUES (${teacher.id}, ${teacher.name}, ${teacher.role}, ${teacher.years}, ${teacher.bio}, ${teacher.photo}, ${JSON.stringify(teacher.serviceIds)}, ${teacher.createdAt})
          `;
        }
      }

      const [{ count: serviceCount }] = (await sql`SELECT COUNT(*)::int AS count FROM services`) as {
        count: number;
      }[];
      if (serviceCount === 0) {
        for (const service of seedServices) {
          await sql`
            INSERT INTO services (id, title, description, photo, created_at)
            VALUES (${service.id}, ${service.title}, ${service.description}, ${service.photo}, ${service.createdAt})
          `;
        }
      }
    })();
  }
  await schemaReady;
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

  await sql`
    INSERT INTO bookings (id, name, phone, service, specialist, preferred_date, time, status, note, service_price, coupon_code, discount_amount, total_amount, created_at)
    VALUES (${booking.id}, ${booking.name}, ${booking.phone}, ${booking.service}, ${booking.specialist}, ${booking.preferredDate}, ${booking.time}, ${booking.status}, ${booking.note}, ${booking.servicePrice ?? null}, ${booking.couponCode ?? null}, ${booking.discountAmount ?? null}, ${booking.totalAmount ?? null}, ${booking.createdAt})
  `;

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

function createInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return words.map((word) => word[0]?.toUpperCase()).join("") || "Х";
}

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

function normalizeCouponCode(value: string) {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

function sanitizeMoney(value: unknown) {
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

function validateCouponRows(rows: Record<string, unknown>[], subtotal: number) {
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
