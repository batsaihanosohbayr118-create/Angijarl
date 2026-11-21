import { NextRequest, NextResponse } from "next/server";
import { createTestimonial, listTestimonials } from "../../../lib/angijralDb";
import { checkRateLimit, rateLimits } from "../../../lib/rateLimit";

export async function GET() {
  try {
    const testimonials = await listTestimonials();
    return NextResponse.json({ testimonials });
  } catch {
    return NextResponse.json({ testimonials: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, rateLimits.testimonial);
  if (limited) return limited;

  try {
    const body = (await req.json()) as { name?: string; message?: string; rating?: number };
    const result = await createTestimonial(body ?? {});

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({ testimonial: result.testimonial });
  } catch {
    return NextResponse.json({ message: "Сэтгэгдэл хадгалах үед алдаа гарлаа." }, { status: 500 });
  }
}
