import { NextResponse } from "next/server";
import { sql } from "./db/client";

/**
 * IP хаягаар хүсэлтийн тоог хязгаарлана (спам, нууц үг таах оролдлогоос хамгаална).
 * Serverless орчинд санах ой хүсэлт хооронд хадгалагдахгүй тул тоолуурыг DB-д хадгална.
 */

export type RateLimitRule = { bucket: string; limit: number; windowSeconds: number };

export const rateLimits = {
  callback: { bucket: "callback", limit: 3, windowSeconds: 10 * 60 },
  booking: { bucket: "booking", limit: 5, windowSeconds: 60 * 60 },
  testimonial: { bucket: "testimonial", limit: 3, windowSeconds: 60 * 60 },
  register: { bucket: "register", limit: 5, windowSeconds: 60 * 60 },
  login: { bucket: "login", limit: 10, windowSeconds: 10 * 60 },
  resetRequest: { bucket: "reset-request", limit: 5, windowSeconds: 60 * 60 },
  resetVerify: { bucket: "reset-verify", limit: 10, windowSeconds: 10 * 60 },
} satisfies Record<string, RateLimitRule>;

let tableReady: Promise<unknown> | null = null;

function ensureTable() {
  tableReady ??= sql`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      window_start TIMESTAMPTZ NOT NULL,
      count INTEGER NOT NULL
    )
  `.catch((error) => {
    tableReady = null;
    throw error;
  });
  return tableReady;
}

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function formatWait(seconds: number) {
  if (seconds < 60) return `${seconds} секунд`;
  return `${Math.ceil(seconds / 60)} минут`;
}

/**
 * Хязгаар хэтэрсэн бол 429 хариу, үгүй бол null буцаана.
 * DB алдаа гарвал хэрэглэгчийг хаахгүй (null) — хамгаалалт унасан ч сайт ажилласаар байна.
 */
export async function checkRateLimit(request: Request, rule: RateLimitRule): Promise<NextResponse | null> {
  try {
    await ensureTable();
    const key = `${rule.bucket}:${clientIp(request)}`;

    const rows = (await sql`
      INSERT INTO rate_limits (key, window_start, count)
      VALUES (${key}, now(), 1)
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN rate_limits.window_start < now() - make_interval(secs => ${rule.windowSeconds}) THEN 1
          ELSE rate_limits.count + 1
        END,
        window_start = CASE
          WHEN rate_limits.window_start < now() - make_interval(secs => ${rule.windowSeconds}) THEN now()
          ELSE rate_limits.window_start
        END
      RETURNING count,
        GREATEST(1, CEIL(EXTRACT(EPOCH FROM (window_start + make_interval(secs => ${rule.windowSeconds}) - now()))))::int AS retry_after
    `) as { count: number; retry_after: number }[];

    /* Хуучин мөрүүдийг үе үе цэвэрлэнэ */
    if (Math.random() < 0.02) {
      void sql`DELETE FROM rate_limits WHERE window_start < now() - interval '1 day'`.catch(() => {});
    }

    const { count, retry_after: retryAfter } = rows[0];
    if (count <= rule.limit) return null;

    const message = `Хэт олон хүсэлт илгээлээ. ${formatWait(retryAfter)}ын дараа дахин оролдоно уу.`;
    return NextResponse.json(
      { ok: false, error: message, message },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return null;
  }
}
