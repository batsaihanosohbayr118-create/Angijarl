import { NextRequest, NextResponse } from "next/server";
import {
  createBooking,
  deleteBooking,
  listBookings,
  updateBookingStatus,
  type BookingStatus,
} from "../../../../lib/angijralDb";

const statuses: BookingStatus[] = ["хүлээгдэж буй", "баталгаажсан", "цуцлагдсан"];

export async function GET() {
  const bookings = await listBookings();
  return NextResponse.json({ bookings });
}

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
    return NextResponse.json({ ok: false, error: "Захиалга хадгалах үед алдаа гарлаа." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { id?: string; status?: BookingStatus };

    if (!body.id || !body.status || !statuses.includes(body.status)) {
      return NextResponse.json({ message: "Мэдээлэл дутуу байна." }, { status: 400 });
    }

    const result = await updateBookingStatus(body.id, body.status);
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    return NextResponse.json({ booking: result.booking });
  } catch {
    return NextResponse.json({ message: "Захиалга шинэчлэх үед алдаа гарлаа." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Захиалгын ID дутуу байна." }, { status: 400 });
    }

    const result = await deleteBooking(id);
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Захиалга устгах үед алдаа гарлаа." }, { status: 500 });
  }
}
