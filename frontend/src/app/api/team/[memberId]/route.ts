import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/team/[memberId]
 * Updates a team member's role (super_admin vs recruiter).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { memberId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ error: "Role wajib diisi." }, { status: 400 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("id", memberId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, memberId, role });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/team/[memberId]
 * Revokes team access for a member.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  const { memberId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (memberId === user.id) {
    return NextResponse.json(
      { error: "Anda tidak dapat mencabut akses akun Anda sendiri." },
      { status: 400 }
    );
  }

  // Remove role or update profile
  const { error } = await supabase
    .from("profiles")
    .update({ role: "revoked" })
    .eq("id", memberId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, memberId });
}
