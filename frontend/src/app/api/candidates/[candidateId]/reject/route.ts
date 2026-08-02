import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/candidates/[candidateId]/reject
 * Rejects a candidate at their current stage.
 * 
 * Body (optional): { notes?: string }
 * 
 * Logic:
 * 1. Update candidate status to "Rejected"
 * 2. Log the rejection to candidate_stage_history
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { candidateId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    // No body is fine
  }

  // 1. Fetch the candidate
  const { data: candidate, error: candErr } = await supabase
    .from("candidates")
    .select("id, full_name, current_stage_name, status")
    .eq("id", candidateId)
    .single();

  if (candErr || !candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  const fromStageName = candidate.current_stage_name || candidate.status || "Unknown";

  // 2. Update candidate status to Rejected
  const { error: updateErr } = await supabase
    .from("candidates")
    .update({
      status: "Rejected",
      current_stage_name: "Rejected",
    })
    .eq("id", candidateId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // 3. Log the rejection
  await supabase.from("candidate_stage_history").insert({
    candidate_id: candidateId,
    from_stage_name: fromStageName,
    to_stage_name: "Rejected",
    changed_by_user_id: user.id,
    notes: body.notes || null,
  });

  return NextResponse.json({
    success: true,
    from_stage: fromStageName,
    to_stage: "Rejected",
    candidate_name: candidate.full_name,
  });
}
