import { NextResponse } from "next/server";
import { resetUserPassword } from "../../../lib/angijralDb";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { identifier?: string; password?: string };
    const result = await resetUserPassword({
      identifier: body.identifier ?? "",
      password: body.password ?? "",
    });

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json({ message: "Нууц үг шинэчлэх үед алдаа гарлаа." }, { status: 500 });
  }
}
