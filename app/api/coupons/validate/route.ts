import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "../../../../lib/angijralDb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body ?? {};

    const result = await validateCoupon({ code, subtotal });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      coupon: result.coupon,
      discountAmount: result.discountAmount,
      totalAmount: result.totalAmount,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Купон шалгах үед алдаа гарлаа." }, { status: 500 });
  }
}
