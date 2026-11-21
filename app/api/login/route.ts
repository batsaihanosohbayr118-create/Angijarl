import { NextResponse } from "next/server";
import { loginUser, type Role } from "../../../lib/angijralDb";
import { clearAuthCookie, setAuthCookie } from "../../../lib/auth";
import { checkRateLimit, rateLimits } from "../../../lib/rateLimit";

export async function POST(request: Request) {
  const limited = await checkRateLimit(request, rateLimits.login);
  if (limited) return limited;

  try {
    const body = (await request.json()) as { identifier?: string; phone?: string; password?: string; role?: Role };
    const role = body.role === "admin" ? "admin" : "user";
    const result = await loginUser({
      /* Хэрэглэгч: имэйл, Админ: админ нэр */
      identifier: body.identifier ?? body.phone ?? "",
      password: body.password ?? "",
      role,
    });

    if (!result.ok) {
      return clearAuthCookie(NextResponse.json({ message: result.message }, { status: 401 }));
    }

    return setAuthCookie(NextResponse.json({ user: result.user }), result.user);
  } catch (error) {
    console.error("Login error:", error);
    /* Hosting дээр AUTH_SECRET тохируулаагүй бол шалтгааныг тодорхой хэлнэ */
    if (error instanceof Error && error.message.includes("AUTH_SECRET")) {
      return NextResponse.json(
        { message: "Серверийн тохиргоо дутуу байна (AUTH_SECRET). Сайтын админд хандана уу." },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: "Нэвтрэх үед алдаа гарлаа." }, { status: 500 });
  }
}
