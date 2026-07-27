import { NextResponse } from "next/server";
import { createUser } from "../../../lib/angijralDb";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; phone?: string; password?: string };
    const result = await createUser({
      name: body.name ?? "",
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
