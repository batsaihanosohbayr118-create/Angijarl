import { NextResponse } from "next/server";
import { deleteUser, listUsers, updateUserRole, type Role } from "../../../../lib/angijralDb";

export async function GET() {
  const users = await listUsers();
  return NextResponse.json({ users });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; role?: Role };

    if (!body.id || (body.role !== "user" && body.role !== "admin")) {
      return NextResponse.json({ message: "Мэдээлэл дутуу байна." }, { status: 400 });
    }

    const result = await updateUserRole(body.id, body.role);
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    return NextResponse.json({ user: result.user });
  } catch {
    return NextResponse.json({ message: "Хэрэглэгч шинэчлэх үед алдаа гарлаа." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Хэрэглэгчийн ID дутуу байна." }, { status: 400 });
    }

    const result = await deleteUser(id);
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Хэрэглэгч устгах үед алдаа гарлаа." }, { status: 500 });
  }
}
