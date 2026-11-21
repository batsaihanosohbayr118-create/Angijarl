import { sql } from "./client";
import { adminPassword, seedServices, seedTeachers } from "./seed";
import { hashPassword } from "./utils";

let schemaReady: Promise<void> | null = null;

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          role TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          password_salt TEXT NOT NULL,
          google_sub TEXT,
          auth_provider TEXT,
          joined_at TEXT NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS bookings (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          service TEXT NOT NULL,
          specialist TEXT NOT NULL,
          preferred_date TEXT NOT NULL,
          time TEXT NOT NULL,
          status TEXT NOT NULL,
          note TEXT NOT NULL,
          service_price INTEGER,
          coupon_code TEXT,
          discount_amount INTEGER,
          total_amount INTEGER,
          created_at TEXT NOT NULL
        )
      `;
      await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS bookings_slot_unique
        ON bookings (specialist, preferred_date, time)
        WHERE status <> 'цуцлагдсан' AND specialist <> '' AND time <> ''
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS testimonials (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          message TEXT NOT NULL,
          rating INTEGER NOT NULL,
          created_at TEXT NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS teachers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          years INTEGER NOT NULL,
          bio TEXT NOT NULL,
          photo TEXT,
          service_ids JSONB NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS services (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          photo TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS password_resets (
          user_id TEXT PRIMARY KEY,
          code_hash TEXT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          attempts INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS coupons (
          id TEXT PRIMARY KEY,
          code TEXT NOT NULL,
          discount_type TEXT NOT NULL,
          value INTEGER NOT NULL,
          expires_at TEXT,
          active BOOLEAN NOT NULL DEFAULT true,
          usage_limit INTEGER,
          used_count INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        )
      `;

      const [{ count: userCount }] = (await sql`SELECT COUNT(*)::int AS count FROM users`) as { count: number }[];
      if (userCount === 0) {
        const adminHash = hashPassword(adminPassword);
        await sql`
          INSERT INTO users (id, name, phone, role, password_hash, password_salt, joined_at)
          VALUES ('admin-osgoo', 'Osgoo', 'Osgoo', 'admin', ${adminHash.hash}, ${adminHash.salt}, '2026-01-14')
        `;
      }

      const [{ count: teacherCount }] = (await sql`SELECT COUNT(*)::int AS count FROM teachers`) as {
        count: number;
      }[];
      if (teacherCount === 0) {
        for (const teacher of seedTeachers) {
          await sql`
            INSERT INTO teachers (id, name, role, years, bio, photo, service_ids, created_at)
            VALUES (${teacher.id}, ${teacher.name}, ${teacher.role}, ${teacher.years}, ${teacher.bio}, ${teacher.photo}, ${JSON.stringify(teacher.serviceIds)}, ${teacher.createdAt})
          `;
        }
      }

      const [{ count: serviceCount }] = (await sql`SELECT COUNT(*)::int AS count FROM services`) as {
        count: number;
      }[];
      if (serviceCount === 0) {
        for (const service of seedServices) {
          await sql`
            INSERT INTO services (id, title, description, photo, created_at)
            VALUES (${service.id}, ${service.title}, ${service.description}, ${service.photo}, ${service.createdAt})
          `;
        }
      }
    })();
  }
  await schemaReady;
}
