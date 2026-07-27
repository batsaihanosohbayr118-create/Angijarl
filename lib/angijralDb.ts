import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
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

interface AngijralDb {
  users: DbUser[];
  bookings: DbBooking[];
  testimonials: DbTestimonial[];
  teachers: DbTeacher[];
  services: DbService[];
  coupons: DbCoupon[];
}

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "angijral-db.json");
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

function createSeedDb(): AngijralDb {
  const adminHash = hashPassword(adminPassword);
  return {
    users: [
      {
        id: "admin-osgoo",
        name: "Osgoo",
        phone: "Osgoo",
        role: "admin",
        passwordHash: adminHash.hash,
        passwordSalt: adminHash.salt,
        joinedAt: "2026-01-14",
      },
    ],
    bookings: [],
    testimonials: [],
    teachers: seedTeachers,
    services: seedServices,
    coupons: [],
  };
}

async function readDb(): Promise<AngijralDb> {
  await mkdir(dataDir, { recursive: true });

  try {
    const raw = await readFile(dbPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<AngijralDb>;
    if (!Array.isArray(parsed.users)) throw new Error("Invalid database shape");
    return {
      users: parsed.users,
      bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
      testimonials: Array.isArray(parsed.testimonials) ? parsed.testimonials : [],
      teachers: Array.isArray(parsed.teachers)
        ? parsed.teachers.map((teacher) => ({
            ...teacher,
            serviceIds: Array.isArray((teacher as DbTeacher).serviceIds) ? (teacher as DbTeacher).serviceIds : [],
          }))
        : seedTeachers,
      services: Array.isArray(parsed.services) ? parsed.services : seedServices,
      coupons: Array.isArray(parsed.coupons) ? parsed.coupons : [],
    };
  } catch {
    const db = createSeedDb();
    await writeDb(db);
    return db;
  }
}

async function writeDb(db: AngijralDb) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`, "utf8");
}

export async function createUser(input: { name: string; phone: string; password: string }) {
  const name = input.name.trim();
  const phone = normalizePhone(input.phone);
  const password = input.password;

  if (!name || !phone || !password) {
    return { ok: false as const, message: "Бүх талбарыг бөглөнө үү." };
  }

  if (password.length < 6) {
    return { ok: false as const, message: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой." };
  }

  const db = await readDb();
  const exists = db.users.some((user) => normalizePhone(user.phone).toLowerCase() === phone.toLowerCase());

  if (exists) {
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

  db.users.push(user);
  await writeDb(db);

  return { ok: true as const, user: toPublicUser(user) };
}

export async function loginGoogleUser(input: { googleSub: string; email: string; name: string }) {
  const googleSub = input.googleSub.trim();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim() || email.split("@")[0] || "Google хэрэглэгч";

  if (!googleSub || !email) {
    return { ok: false as const, message: "Google бүртгэлийн мэдээлэл дутуу байна." };
  }

  const db = await readDb();
  const user = db.users.find(
    (item) => item.googleSub === googleSub || (item.email && item.email.toLowerCase() === email)
  );

  if (user) {
    user.googleSub = user.googleSub ?? googleSub;
    user.email = user.email ?? email;
    user.authProvider = user.authProvider ?? "google";
    await writeDb(db);
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

  db.users.push(googleUser);
  await writeDb(db);

  return { ok: true as const, user: toPublicUser(googleUser) };
}

export async function loginUser(input: { phone: string; password: string; role: Role }) {
  const phone = normalizePhone(input.phone);
  const db = await readDb();
  const user = db.users.find(
    (item) => item.role === input.role && normalizePhone(item.phone).toLowerCase() === phone.toLowerCase()
  );

  if (!user || !verifyPassword(input.password, user.passwordHash, user.passwordSalt)) {
    return {
      ok: false as const,
      message: input.role === "admin" ? "Админы нэр эсвэл нууц үг буруу байна." : "Утасны дугаар эсвэл нууц үг буруу байна.",
    };
  }

  return { ok: true as const, user: toPublicUser(user) };
}

export async function resetUserPassword(input: { identifier: string; password: string }) {
  const identifier = input.identifier.trim();
  const normalizedIdentifier = normalizePhone(identifier).toLowerCase();
  const password = input.password;

  if (!identifier || !password) {
    return { ok: false as const, message: "Утас эсвэл имэйл, шинэ нууц үгээ оруулна уу." };
  }

  if (password.length < 6) {
    return { ok: false as const, message: "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой." };
  }

  const db = await readDb();
  const user = db.users.find((item) => {
    if (item.role !== "user") return false;

    const phoneMatches = normalizePhone(item.phone).toLowerCase() === normalizedIdentifier;
    const emailMatches = item.email?.trim().toLowerCase() === identifier.toLowerCase();

    return phoneMatches || emailMatches;
  });

  if (!user) {
    return { ok: false as const, message: "Ийм утас эсвэл имэйлтэй хэрэглэгч олдсонгүй." };
  }

  const passwordData = hashPassword(password);
  user.passwordHash = passwordData.hash;
  user.passwordSalt = passwordData.salt;
  user.authProvider = user.authProvider ?? "password";

  await writeDb(db);

  return { ok: true as const, user: toPublicUser(user) };
}

export async function listUsers() {
  const db = await readDb();
  return db.users.map(toPublicUser);
}

export async function updateUserRole(id: string, role: Role) {
  const db = await readDb();
  const user = db.users.find((item) => item.id === id);

  if (!user) {
    return { ok: false as const, message: "Хэрэглэгч олдсонгүй." };
  }

  const adminCount = db.users.filter((item) => item.role === "admin").length;
  if (user.role === "admin" && role === "user" && adminCount <= 1) {
    return { ok: false as const, message: "Сүүлийн админ эрхийг хасах боломжгүй." };
  }

  user.role = role;
  await writeDb(db);
  return { ok: true as const, user: toPublicUser(user) };
}

export async function deleteUser(id: string) {
  const db = await readDb();
  const user = db.users.find((item) => item.id === id);

  if (!user) {
    return { ok: false as const, message: "Хэрэглэгч олдсонгүй." };
  }

  const adminCount = db.users.filter((item) => item.role === "admin").length;
  if (user.role === "admin" && adminCount <= 1) {
    return { ok: false as const, message: "Сүүлийн админ хэрэглэгчийг устгах боломжгүй." };
  }

  const nextUsers = db.users.filter((user) => user.id !== id);

  await writeDb({ ...db, users: nextUsers });
  return { ok: true as const };
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
  const name = input.name?.trim() ?? "";
  const phone = input.phone ? normalizePhone(input.phone) : "";
  const service = input.service?.trim() ?? "";
  const servicePrice = sanitizeMoney(input.servicePrice);
  const couponCode = normalizeCouponCode(input.couponCode ?? "");

  if (!name || !phone || !service || !input.preferredDate) {
    return { ok: false as const, message: "Шаардлагатай мэдээлэл дутуу байна." };
  }

  const db = await readDb();

  const alreadyBooked = db.bookings.some(
    (b) =>
      b.specialist === (input.specialist ?? "") &&
      b.preferredDate === input.preferredDate &&
      b.time === (input.time ?? "") &&
      b.status !== "цуцлагдсан"
  );
  if (alreadyBooked && input.specialist && input.time) {
    return { ok: false as const, message: "Уучлаарай, энэ цаг аль хэдийн захиалагдсан байна." };
  }

  let discountAmount = 0;
  let totalAmount = servicePrice;

  if (couponCode) {
    const couponResult = validateCouponFromDb(db, couponCode, servicePrice);
    if (!couponResult.ok) {
      return { ok: false as const, message: couponResult.message };
    }

    discountAmount = couponResult.discountAmount;
    totalAmount = couponResult.totalAmount;
    couponResult.coupon.usedCount += 1;
  }

  const booking: DbBooking = {
    id: randomUUID(),
    name,
    phone,
    service,
    specialist: input.specialist?.trim() ?? "",
    preferredDate: input.preferredDate,
    time: input.time ?? "",
    note: input.note?.trim() ?? "",
    status: "хүлээгдэж буй",
    servicePrice,
    couponCode: couponCode || undefined,
    discountAmount,
    totalAmount,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  db.bookings.push(booking);
  await writeDb(db);

  return { ok: true as const, booking };
}

export async function listBookings() {
  const db = await readDb();
  return [...db.bookings].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const db = await readDb();
  const booking = db.bookings.find((b) => b.id === id);

  if (!booking) {
    return { ok: false as const, message: "Захиалга олдсонгүй." };
  }

  booking.status = status;
  await writeDb(db);
  return { ok: true as const, booking };
}

export async function deleteBooking(id: string) {
  const db = await readDb();
  const exists = db.bookings.some((b) => b.id === id);

  if (!exists) {
    return { ok: false as const, message: "Захиалга олдсонгүй." };
  }

  await writeDb({ ...db, bookings: db.bookings.filter((b) => b.id !== id) });
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

function toPublicTeacher(teacher: DbTeacher, index = 0) {
  return {
    ...teacher,
    photo: teacher.photo?.trim() || teacherPhotoFallback(teacher, index),
    initials: createInitials(teacher.name),
    serviceIds: Array.isArray(teacher.serviceIds) ? teacher.serviceIds : [],
  };
}

export async function listTeachers() {
  const db = await readDb();
  return [...db.teachers]
    .sort((a, b) => {
      if (a.createdAt === b.createdAt) return 0;
      return a.createdAt < b.createdAt ? 1 : -1;
    })
    .map(toPublicTeacher);
}

export async function createTeacher(input: {
  name?: string;
  role?: string;
  years?: number;
  bio?: string;
  photo?: string;
  serviceIds?: string[];
}) {
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

  const db = await readDb();
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

  db.teachers.push(teacher);
  await writeDb(db);

  return { ok: true as const, teacher: toPublicTeacher(teacher) };
}

export async function updateTeacher(
  id: string,
  input: { name?: string; role?: string; years?: number; bio?: string; photo?: string; serviceIds?: string[] }
) {
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

  const db = await readDb();
  const teacher = db.teachers.find((item) => item.id === id);

  if (!teacher) {
    return { ok: false as const, message: "Бариач олдсонгүй." };
  }

  teacher.name = name;
  teacher.role = role;
  teacher.years = years;
  teacher.bio = bio;
  teacher.photo = photo;
  teacher.serviceIds = serviceIds;
  await writeDb(db);

  return { ok: true as const, teacher: toPublicTeacher(teacher) };
}

export async function deleteTeacher(id: string) {
  const db = await readDb();
  const exists = db.teachers.some((teacher) => teacher.id === id);

  if (!exists) {
    return { ok: false as const, message: "Бариач олдсонгүй." };
  }

  await writeDb({ ...db, teachers: db.teachers.filter((teacher) => teacher.id !== id) });
  return { ok: true as const };
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
  const db = await readDb();
  return db.services.map(toPublicService);
}

export async function createService(input: { title?: string; description?: string; photo?: string }) {
  const title = input.title?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const photo = input.photo?.trim() || defaultServicePhoto;

  if (!title) {
    return { ok: false as const, message: "Үйлчилгээний гарчгийг бөглөнө үү." };
  }

  const db = await readDb();
  const service: DbService = {
    id: randomUUID(),
    title,
    description,
    photo,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  db.services.unshift(service);
  await writeDb(db);

  return { ok: true as const, service: toPublicService(service) };
}

export async function updateService(id: string, input: { title?: string; description?: string; photo?: string }) {
  const title = input.title?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const photo = input.photo?.trim() || defaultServicePhoto;

  if (!title) {
    return { ok: false as const, message: "Үйлчилгээний гарчгийг бөглөнө үү." };
  }

  const db = await readDb();
  const service = db.services.find((item) => item.id === id);

  if (!service) {
    return { ok: false as const, message: "Үйлчилгээ олдсонгүй." };
  }

  service.title = title;
  service.description = description;
  service.photo = photo;
  await writeDb(db);

  return { ok: true as const, service: toPublicService(service) };
}

export async function deleteService(id: string) {
  const db = await readDb();
  const exists = db.services.some((service) => service.id === id);

  if (!exists) {
    return { ok: false as const, message: "Үйлчилгээ олдсонгүй." };
  }

  await writeDb({ ...db, services: db.services.filter((service) => service.id !== id) });
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

function validateCouponFromDb(db: AngijralDb, code: string, subtotal: number) {
  const normalizedCode = normalizeCouponCode(code);
  const coupon = db.coupons.find((item) => item.code === normalizedCode);

  if (!coupon) {
    return { ok: false as const, message: "Купон код олдсонгүй." };
  }

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
  const db = await readDb();
  return [...db.coupons].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).map(toPublicCoupon);
}

export async function validateCoupon(input: { code?: string; subtotal?: number }) {
  const code = normalizeCouponCode(input.code ?? "");
  const subtotal = sanitizeMoney(input.subtotal);

  if (!code) {
    return { ok: false as const, message: "Купон кодоо оруулна уу." };
  }

  const db = await readDb();
  const result = validateCouponFromDb(db, code, subtotal);
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

  const db = await readDb();
  if (db.coupons.some((coupon) => coupon.code === code)) {
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

  db.coupons.unshift(coupon);
  await writeDb(db);

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

  const db = await readDb();
  const coupon = db.coupons.find((item) => item.id === id);

  if (!coupon) {
    return { ok: false as const, message: "Купон олдсонгүй." };
  }

  if (db.coupons.some((item) => item.id !== id && item.code === code)) {
    return { ok: false as const, message: "Энэ купон код аль хэдийн байна." };
  }

  coupon.code = code;
  coupon.discountType = discountType;
  coupon.value = value;
  coupon.expiresAt = expiresAt;
  coupon.active = input.active ?? true;
  coupon.usageLimit = usageLimit;

  await writeDb(db);

  return { ok: true as const, coupon: toPublicCoupon(coupon) };
}

export async function deleteCoupon(id: string) {
  const db = await readDb();
  const exists = db.coupons.some((coupon) => coupon.id === id);

  if (!exists) {
    return { ok: false as const, message: "Купон олдсонгүй." };
  }

  await writeDb({ ...db, coupons: db.coupons.filter((coupon) => coupon.id !== id) });
  return { ok: true as const };
}

export async function listTestimonials() {
  const db = await readDb();
  return [...db.testimonials]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((testimonial) => ({
      ...testimonial,
      initials: createInitials(testimonial.name),
    }));
}

export async function createTestimonial(input: { name?: string; message?: string; rating?: number }) {
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

  const db = await readDb();
  const testimonial: DbTestimonial = {
    id: randomUUID(),
    name,
    message,
    rating,
    createdAt: new Date().toISOString(),
  };

  db.testimonials.push(testimonial);
  await writeDb(db);

  return {
    ok: true as const,
    testimonial: {
      ...testimonial,
      initials: createInitials(testimonial.name),
    },
  };
}