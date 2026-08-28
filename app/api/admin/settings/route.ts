import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings, updateSiteSettings } from "../../../../lib/angijralDb";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
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
