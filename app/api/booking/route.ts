import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createBooking, listBookings } from "../../../lib/angijralDb";
import { priceForService } from "../../../lib/servicePrices";
import { checkRateLimit, rateLimits } from "../../../lib/rateLimit";

const RECIPIENT_EMAIL = "angijraltuv@yahoo.com";

async function sendBookingNotification(booking: {
  name?: string;
  phone?: string;
  service?: string;
  specialist?: string;
  preferredDate?: string;
  time?: string;
  note?: string;
}) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ""),
      },
    });

    await transporter.sendMail({
      from: `"АНГИЖРАЛ вэбсайт" <${process.env.GMAIL_USER}>`,
      to: RECIPIENT_EMAIL,
      subject: "Шинэ цаг захиалга — АНГИЖРАЛ",
      text: [
        "Шинэ цаг захиалга ирлээ:",
        "",
        `Нэр: ${booking.name ?? "-"}`,
        `Утас: ${booking.phone ?? "-"}`,
        `Үйлчилгээ: ${booking.service ?? "-"}`,
        `Бариач: ${booking.specialist ?? "-"}`,
        `Огноо: ${booking.preferredDate ?? "-"}`,
        `Цаг: ${booking.time ?? "-"}`,
        `Тэмдэглэл: ${booking.note ?? "-"}`,
      ].join("\n"),
    });
  } catch (error) {
    // Имэйл илгээхэд алдаа гарсан ч захиалгыг бүтэлгүйтүүлэхгүй, зөвхөн лог хийнэ
    console.error("Booking email error:", error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const specialist = searchParams.get("specialist");

    if (!date || !specialist) {
      return NextResponse.json({ times: [] });
    }

    const bookings = await listBookings();
    const times = bookings
      .filter(
        (booking) =>
          booking.preferredDate === date &&
          booking.specialist === specialist &&
          booking.time &&
          booking.status !== "цуцлагдсан"
      )
      .map((booking) => booking.time);

    return NextResponse.json({ times: [...new Set(times)] });
  } catch {
    return NextResponse.json({ times: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, rateLimits.booking);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { name, phone, service, specialist, preferredDate, time, note, couponCode } = body ?? {};

    /* Үнийг хөтчөөс биш, сервер дээрх үнийн жагсаалтаас тодорхойлно */
    const servicePrice = typeof service === "string" ? priceForService(service) : null;
    if (servicePrice === null) {
      return NextResponse.json({ ok: false, error: "Үйлчилгээ олдсонгүй." }, { status: 400 });
    }

    const result = await createBooking({
      name,
      phone,
      service,
      specialist,
      preferredDate,
      time,
      note,
      servicePrice,
      couponCode,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.message }, { status: 400 });
    }

    void sendBookingNotification({ name, phone, service, specialist, preferredDate, time, note });

    return NextResponse.json({ ok: true, booking: result.booking });
  } catch {
    return NextResponse.json({ ok: false, error: "Хүсэлт боловсруулахад алдаа гарлаа" }, { status: 500 });
  }
}