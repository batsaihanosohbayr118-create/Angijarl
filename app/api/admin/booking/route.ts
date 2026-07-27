import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "../../../../lib/angijralDb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, service, specialist, preferredDate, time, note } = body ?? {};

    const result = await createBooking({ name, phone, service, specialist, preferredDate, time, note });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, booking: result.booking });
  } catch {
    return NextResponse.json({ ok: false, error: "Хүсэлт боловсруулахад алдаа гарлаа" }, { status: 500 });
  }
}
