import { NextRequest, NextResponse } from "next/server";
import {
  createTestimonial,
  deleteTestimonial,
  listTestimonials,
  updateTestimonial,
} from "../../../../lib/angijralDb";
import { requireAdmin } from "../../../../lib/auth";

type TestimonialBody = { id?: string; name?: string; message?: string; rating?: number };

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const testimonials = await listTestimonials();
  return NextResponse.json({ testimonials });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await req.json()) as TestimonialBody;
    const result = await createTestimonial(body);
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }
    return NextResponse.json({ testimonial: result.testimonial });
  } catch {
    return NextResponse.json({ message: "Сэтгэгдэл хадгалах үед алдаа гарлаа." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await req.json()) as TestimonialBody;
    if (!body.id) {
      return NextResponse.json({ message: "Сэтгэгдлийн ID дутуу байна." }, { status: 400 });
    }

    const result = await updateTestimonial(body.id, body);
    if (!result.ok) {
      const status = result.message === "Сэтгэгдэл олдсонгүй." ? 404 : 400;
      return NextResponse.json({ message: result.message }, { status });
    }
    return NextResponse.json({ testimonial: result.testimonial });
  } catch {
    return NextResponse.json({ message: "Сэтгэгдэл шинэчлэх үед алдаа гарлаа." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Сэтгэгдлийн ID дутуу байна." }, { status: 400 });
    }

    const result = await deleteTestimonial(id);
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Сэтгэгдэл устгах үед алдаа гарлаа." }, { status: 500 });
  }
}
