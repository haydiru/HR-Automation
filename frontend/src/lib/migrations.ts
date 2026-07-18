/**
 * Automatic Database Migration Runner
 * 
 * Connects directly to Supabase PostgreSQL using DATABASE_URL,
 * tracks applied migrations in a `_migrations` table,
 * and executes only new .sql files on each server start.
 * 
 * Triggered by Next.js instrumentation.ts on server startup.
 */

import fs from "fs";
import path from "path";

export async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log("[Migrations] DATABASE_URL not set. Skipping auto-migration.");
    return;
  }

  // Dynamic import to avoid bundling pg in client code
  const { Client } = await import("pg");
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log("[Migrations] Connected to database.");

    // 1. Create tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS public._migrations (
        id serial PRIMARY KEY,
        name text UNIQUE NOT NULL,
        applied_at timestamptz DEFAULT now()
      );
    `);

    // 2. Get already-applied migrations
    const { rows } = await client.query(`SELECT name FROM public._migrations ORDER BY name`);
    const appliedNames = new Set(rows.map((r: any) => r.name));

    // 3. Read .sql files from supabase/migrations (skip init.sql)
    const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
    if (!fs.existsSync(migrationsDir)) {
      console.log("[Migrations] No supabase/migrations directory found.");
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql") && f !== "init.sql")
      .sort();

    let migrated = 0;

    for (const file of files) {
      if (appliedNames.has(file)) continue;

      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      console.log(`[Migrations] Applying: ${file} ...`);

      try {
        await client.query(sql);
        await client.query(`INSERT INTO public._migrations (name) VALUES ($1)`, [file]);
        console.log(`[Migrations] ✅ ${file}`);
        migrated++;
      } catch (err: any) {
        console.error(`[Migrations] ❌ ${file}:`, err.message);
        break; // Stop on first error
      }
    }

    if (migrated > 0) {
      console.log(`[Migrations] Done — ${migrated} migration(s) applied.`);
    } else {
      console.log("[Migrations] Database is up to date.");
    }
  } catch (err: any) {
    console.error("[Migrations] Connection error:", err.message);
  } finally {
    await client.end();
  }
}
