import { runMigrations } from "@/lib/migrations";

/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts (both dev and production).
 * Used here to automatically apply pending database migrations.
 */
export async function register() {
  // Only run migrations on the server (Node.js runtime), not on Edge
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      await runMigrations();
    } catch (err) {
      console.error("[Instrumentation] Migration error:", err);
    }
  }
}
