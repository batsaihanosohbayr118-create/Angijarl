import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings, updateSiteSettings } from "../../../../lib/angijralDb";
import { requireAdmin } from "../../../../lib/auth";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await req.json()) as { heroImage?: string };
    const result = await updateSiteSettings(body);

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    return NextResponse.json({ heroImage: result.heroImage });
  } catch {
    return NextResponse.json({ message: "Тохиргоо хадгалах үед алдаа гарлаа." }, { status: 500 });
  }
}
