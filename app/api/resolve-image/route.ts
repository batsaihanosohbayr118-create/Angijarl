import { NextRequest, NextResponse } from "next/server";
import { resolveImageUrl } from "../../../lib/resolveImage";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url шаардлагатай" }, { status: 400 });
  }

  const imageUrl = await resolveImageUrl(url);
  if (!imageUrl) {
    return NextResponse.json({ error: "Зураг олдсонгүй" }, { status: 422 });
  }

  return NextResponse.json(
    { imageUrl },
    { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } }
  );
}
