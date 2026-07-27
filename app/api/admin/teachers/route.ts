import { NextRequest, NextResponse } from "next/server";
import { createTeacher, deleteTeacher, listTeachers, updateTeacher } from "../../../../lib/angijralDb";

export async function GET() {
  const teachers = await listTeachers();
  return NextResponse.json({ teachers });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, years, bio, photo, serviceIds } = body ?? {};

    const result = await createTeacher({ name, role, years, bio, photo, serviceIds });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, teacher: result.teacher });
  } catch {
    return NextResponse.json({ ok: false, error: "Бариач хадгалах үед алдаа гарлаа." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      id?: string;
      name?: string;
      role?: string;
      years?: number;
      bio?: string;
      photo?: string;
      serviceIds?: string[];
    };

    if (!body.id) {
      return NextResponse.json({ message: "Бариачийн ID дутуу байна." }, { status: 400 });
    }

    const result = await updateTeacher(body.id, body);
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    return NextResponse.json({ teacher: result.teacher });
  } catch {
    return NextResponse.json({ message: "Бариач шинэчлэх үед алдаа гарлаа." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Бариачийн ID дутуу байна." }, { status: 400 });
    }

    const result = await deleteTeacher(id);
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Бариач устгах үед алдаа гарлаа." }, { status: 500 });
  }
}