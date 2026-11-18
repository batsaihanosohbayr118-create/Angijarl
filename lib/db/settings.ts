import { sql } from "./client";
import { ensureSchema } from "./schema";
import { defaultHeroImage } from "./seed";

export async function getSiteSettings() {
  await ensureSchema();

  const rows = await sql`SELECT key, value FROM settings WHERE key = 'hero_image' LIMIT 1`;
  const heroImage = rows.length > 0 ? (rows[0].value as string) : defaultHeroImage;

  return { heroImage };
}

export async function updateSiteSettings(input: { heroImage?: string }) {
  await ensureSchema();

  const heroImage = input.heroImage?.trim();
  if (!heroImage) {
    return { ok: false as const, message: "Зургийн URL-ээ оруулна уу." };
  }

  await sql`
    INSERT INTO settings (key, value) VALUES ('hero_image', ${heroImage})
    ON CONFLICT (key) DO UPDATE SET value = ${heroImage}
  `;

  return { ok: true as const, heroImage };
}
