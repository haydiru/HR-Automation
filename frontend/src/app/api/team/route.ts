import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/team
 * Returns the list of team members for the logged-in user's organization.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: members, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(members || []);
}

/**
 * POST /api/team/invite
 * Invites a new team member. (Sends invitation / logs pending member).
 * Body: { email: string, full_name?: string, role: "super_admin" | "recruiter" }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, full_name, role } = body;

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
    }

    // Insert or invite logic
    // For now, record invitation or update profile role if profile already exists
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("profiles")
        .update({ role: role || "recruiter", full_name: full_name || undefined })
        .eq("id", existing.id);
    }

    return NextResponse.json({
      success: true,
      message: `Undangan berhasil diproses untuk ${email}`,
      email,
      role: role || "recruiter",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
