import { NextRequest, NextResponse } from "next/server";
import {
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon,
  type CouponDiscountType,
} from "../../../../lib/angijralDb";

export async function GET() {
  const coupons = await listCoupons();
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, discountType, value, expiresAt, active, usageLimit } = body ?? {};

    const result = await createCoupon({ code, discountType, value, expiresAt, active, usageLimit });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, coupon: result.coupon });
  } catch {
    return NextResponse.json({ ok: false, error: "Купон хадгалах үед алдаа гарлаа." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      id?: string;
      code?: string;
      discountType?: CouponDiscountType;
      value?: number;
      expiresAt?: string;
      active?: boolean;
      usageLimit?: number;
    };

    if (!body.id) {
      return NextResponse.json({ ok: false, error: "Купоны ID дутуу байна." }, { status: 400 });
    }

    const result = await updateCoupon(body.id, body);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, coupon: result.coupon });
  } catch {
    return NextResponse.json({ ok: false, error: "Купон шинэчлэх үед алдаа гарлаа." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, error: "Купоны ID дутуу байна." }, { status: 400 });
    }

    const result = await deleteCoupon(id);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.message }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Купон устгах үед алдаа гарлаа." }, { status: 500 });
  }
}
