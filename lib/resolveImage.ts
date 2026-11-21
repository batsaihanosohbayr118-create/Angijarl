/**
 * Зургийн холбоосыг жинхэнэ зургийн URL болгоно.
 * - Шууд зураг бол өөрийг нь буцаана.
 * - Pinterest гэх мэт HTML хуудас бол og:image / twitter:image-ийг олж буцаана.
 * Олдохгүй бол null.
 */

const resolvedCache = new Map<string, string>();
const MAX_CACHE_ENTRIES = 500;

function remember(source: string, imageUrl: string) {
  if (resolvedCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = resolvedCache.keys().next().value;
    if (oldest !== undefined) resolvedCache.delete(oldest);
  }
  resolvedCache.set(source, imageUrl);
  return imageUrl;
}

export async function resolveImageUrl(url: string): Promise<string | null> {
  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return null;
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") return null;

  const key = target.toString();
  const cached = resolvedCache.get(key);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(key, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AngijralBot/1.0; +https://angijral.mn)",
        Accept: "text/html,image/*",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.startsWith("image/")) return remember(key, key);
    if (!contentType.includes("text/html")) return null;

    const html = await response.text();
    const match =
      html.match(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i) ??
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i) ??
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
    if (!match) return null;

    return remember(key, new URL(match[1], target).toString());
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Хадгалахын өмнө зургийн холбоосыг хэвийн болгоно:
 * гаднын http(s) холбоос бол жинхэнэ зургийн URL-ээр солино, олдохгүй бол анхных хэвээр.
 * "/..." гэх мэт локал зам болон хоосон утгад хүрэхгүй.
 */
export async function normalizePhotoUrl(photo: string): Promise<string> {
  const trimmed = photo.trim();
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;
  return (await resolveImageUrl(trimmed)) ?? trimmed;
}
