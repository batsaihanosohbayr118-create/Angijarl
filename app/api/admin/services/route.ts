import { NextRequest, NextResponse } from "next/server";
import { createService, deleteService, listServices, updateService } from "../../../../lib/angijralDb";

export async function GET() {
  const services = await listServices();
  return NextResponse.json({ services });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, photo } = body ?? {};

    const result = await createService({ title, description, photo });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, service: result.service });
  } catch {
    return NextResponse.json({ ok: false, error: "Үйлчилгээ хадгалах үед алдаа гарлаа." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as { id?: string; title?: string; description?: string; photo?: string };

    if (!body.id) {
      return NextResponse.json({ message: "Үйлчилгээний ID дутуу байна." }, { status: 400 });
    }

    const result = await updateService(body.id, body);
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    return NextResponse.json({ service: result.service });
  } catch {
    return NextResponse.json({ message: "Үйлчилгээ шинэчлэх үед алдаа гарлаа." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Үйлчилгээний ID дутуу байна." }, { status: 400 });
    }

    const result = await deleteService(id);
    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Үйлчилгээ устгах үед алдаа гарлаа." }, { status: 500 });
  }
}
