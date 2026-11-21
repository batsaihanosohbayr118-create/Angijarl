import { NextResponse } from "next/server";
import { resetPasswordWithCode } from "../../../lib/angijralDb";
import { checkRateLimit, rateLimits } from "../../../lib/rateLimit";

/** Имэйлээр ирсэн кодыг шалгаад нууц үгийг шинэчилнэ. */
export async function POST(request: Request) {
  const limited = await checkRateLimit(request, rateLimits.resetVerify);
  if (limited) return limited;

  try {
    const body = (await request.json()) as { identifier?: string; code?: string; password?: string };
    const result = await resetPasswordWithCode({
      identifier: body.identifier ?? "",
      code: body.code ?? "",
      password: body.password ?? "",
    });

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Нууц үг шинэчлэх үед алдаа гарлаа." }, { status: 500 });
  }
}
