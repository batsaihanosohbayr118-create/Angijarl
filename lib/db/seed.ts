import type { DbService, DbTeacher } from "./types";

export const adminPassword = "Osohoo123456";

export const defaultTeacherPhotos = [
  "https://images.pexels.com/photos/6749778/pexels-photo-6749778.jpeg?auto=compress&cs=tinysrgb&w=700",
  "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=700",
  "https://images.pexels.com/photos/6627534/pexels-photo-6627534.jpeg?auto=compress&cs=tinysrgb&w=700",
  "https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=700",
];

export const defaultServicePhoto =
  "https://images.pexels.com/photos/3985163/pexels-photo-3985163.jpeg?auto=compress&cs=tinysrgb&w=900";

export const seedServices: DbService[] = [
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

export function teacherPhotoFallback(teacher: Pick<DbTeacher, "id" | "name">, index = 0) {
  if (teacher.id === "teacher-bat-erdene") return defaultTeacherPhotos[0];
  if (teacher.id === "teacher-enkhtuyaa") return defaultTeacherPhotos[1];
  if (teacher.id === "teacher-orgil") return defaultTeacherPhotos[2];
  const code = [...teacher.name].reduce((sum, char) => sum + char.charCodeAt(0), index);
  return defaultTeacherPhotos[Math.abs(code) % defaultTeacherPhotos.length];
}

export const seedTeachers: DbTeacher[] = [
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
