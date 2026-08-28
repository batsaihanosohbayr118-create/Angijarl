import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url шаардлагатай" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: "URL буруу байна" }, { status: 400 });
  }

  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return NextResponse.json({ error: "URL буруу байна" }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(target.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AngijralBot/1.0; +https://angijral.mn)",
        Accept: "text/html,image/*",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.startsWith("image/")) {
      return NextResponse.json({ imageUrl: target.toString() });
    }

    if (!contentType.includes("text/html")) {
      return NextResponse.json({ error: "Зураг олдсонгүй" }, { status: 422 });
    }

    const html = await response.text();
    const match =
      html.match(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i) ??
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

    if (!match) {
      return NextResponse.json({ error: "Зураг олдсонгүй" }, { status: 422 });
    }

    const imageUrl = new URL(match[1], target).toString();
    return NextResponse.json({ imageUrl });
  } catch {
    return NextResponse.json({ error: "Холбогдоход алдаа гарлаа" }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
