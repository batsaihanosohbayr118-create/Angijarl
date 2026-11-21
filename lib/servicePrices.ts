/**
 * Үйлчилгээний үнийн жагсаалт — цорын ганц эх сурвалж.
 * Цаг захиалгын хуудас үүнийг харуулна, сервер захиалга бүртгэхдээ үнийг ЗӨВХӨН эндээс авна
 * (хөтчөөс ирсэн үнэд итгэхгүй).
 */
export const servicePriceCatalog = [
  { id: "office-massage", title: "Оффис бариа засал", priceAmount: 60000 },
  { id: "nutrition", title: "Хоол зүйн сургалт", priceAmount: 40000 },
  { id: "meditation", title: "Байгууллагын бясалгал", priceAmount: 50000 },
  { id: "psychology", title: "Сэтгэл зүйн сургалт", priceAmount: 45000 },
] as const;

export function priceForService(title: string): number | null {
  const entry = servicePriceCatalog.find((item) => item.title === title.trim());
  return entry ? entry.priceAmount : null;
}
