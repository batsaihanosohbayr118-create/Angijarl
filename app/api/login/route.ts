import { NextResponse } from "next/server";
import { loginUser, type Role } from "../../../lib/angijralDb";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string; password?: string; role?: Role };
    const role = body.role === "admin" ? "admin" : "user";
    const result = await loginUser({
      phone: body.phone ?? "",
      password: body.password ?? "",
      role,
    });

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 401 });
    }

    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json({ message: "Нэвтрэх үед алдаа гарлаа." }, { status: 500 });
  }
}
