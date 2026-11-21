import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createPasswordResetCode } from "../../../../lib/angijralDb";
import { checkRateLimit, rateLimits } from "../../../../lib/rateLimit";

/* Бүртгэл байгаа эсэхийг илчлэхгүйн тулд үргэлж ижил хариу буцаана */
const GENERIC_MESSAGE =
  "Хэрэв энэ бүртгэлд имэйл холбогдсон бол 6 оронтой код илгээлээ. Имэйлээ шалгана уу (Spam хавтсыг ч шалгаарай).";

export async function POST(request: Request) {
  const limited = await checkRateLimit(request, rateLimits.resetRequest);
  if (limited) return limited;

  try {
    const body = (await request.json()) as { identifier?: string };
    const result = await createPasswordResetCode(body.identifier ?? "");

    if (result.send) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ""),
        },
      });

      await transporter.sendMail({
        from: `"АНГИЖРАЛ" <${process.env.GMAIL_USER}>`,
        to: result.send.email,
        subject: "Нууц үг сэргээх код — АНГИЖРАЛ",
        text: [
          `Сайн байна уу, ${result.send.name}.`,
          "",
          `Таны нууц үг сэргээх код: ${result.send.code}`,
          "",
          `Код ${result.send.ttlMinutes} минутын дараа хүчингүй болно.`,
          "Хэрэв та энэ хүсэлтийг гаргаагүй бол энэ имэйлийг үл тоомсорлоно уу — таны нууц үг өөрчлөгдөхгүй.",
        ].join("\n"),
      });
    }

    return NextResponse.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("Password reset email error:", error);
    return NextResponse.json({ message: "Код илгээх үед алдаа гарлаа. Дахин оролдоно уу." }, { status: 500 });
  }
}
