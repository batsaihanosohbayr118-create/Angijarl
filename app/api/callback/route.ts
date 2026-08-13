import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const RECIPIENT_EMAIL = "batsaihanosohbayr118@gmail.com";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json({ error: "Утасны дугаар оруулна уу" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // жишээ нь: mywebsite@gmail.com
        pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ""), // Gmail-ийн "App password" (энгийн нууц үг биш)
      },
    });

    await transporter.sendMail({
      from: `"АНГИЖРАЛ вэбсайт" <${process.env.GMAIL_USER}>`,
      to: RECIPIENT_EMAIL,
      subject: "Шинэ дуудлагын хүсэлт — Утасны дугаар үлдээлээ",
      text: `Хэрэглэгч вэбсайт дээрх маягтаар утасны дугаараа үлдээлээ:\n\n${phone}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Callback email error:", error);
    return NextResponse.json({ error: "Илгээхэд алдаа гарлаа" }, { status: 500 });
  }
}