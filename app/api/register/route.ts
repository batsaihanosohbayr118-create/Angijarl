import { NextResponse } from "next/server";
import { createUser } from "../../../lib/angijralDb";
import { checkRateLimit, rateLimits } from "../../../lib/rateLimit";

export async function POST(request: Request) {
  const limited = await checkRateLimit(request, rateLimits.register);
  if (limited) return limited;

  try {
    const body = (await request.json()) as { name?: string; email?: string; phone?: string; password?: string };
    const result = await createUser({
      name: body.name ?? "",
      email: body.email ?? "",
      phone: body.phone ?? "",
      password: body.password ?? "",
    });

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Бүртгэл үүсгэх үед алдаа гарлаа." }, { status: 500 });
  }
}
