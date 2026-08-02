import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/candidates/[candidateId]/advance
 * Advances a candidate to the next stage in their job's recruitment pipeline.
 * 
 * Body (optional): { notes?: string }
 * 
 * Logic:
 * 1. Fetch candidate's current stage info
 * 2. Determine the job's effective stages (custom or default)
 * 3. Find the next stage by order_index
 * 4. Update candidate's current_stage_id and current_stage_name
 * 5. Log the transition to candidate_stage_history
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
    .select("*, jobs(id, user_id, use_custom_stages)")
    .eq("id", candidateId)
    .single();

  if (candErr || !candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  const job = candidate.jobs;
  if (!job) {
    return NextResponse.json({ error: "Job not found for candidate" }, { status: 404 });
  }

  // 2. Get the effective stages for this job
  let stages: any[] = [];

  if (job.use_custom_stages) {
    const { data: customStages } = await supabase
      .from("job_stages")
      .select("*")
      .eq("job_id", job.id)
      .order("order_index", { ascending: true });
    stages = customStages || [];
  } else {
    const { data: defaultStages } = await supabase
      .from("recruitment_stages")
      .select("*")
      .eq("company_id", job.user_id)
      .order("order_index", { ascending: true });
    stages = defaultStages || [];
  }

  if (stages.length === 0) {
    return NextResponse.json({ error: "No stages defined for this job" }, { status: 400 });
  }

  // 3. Find candidate's current stage index
  const currentStageName = candidate.current_stage_name;
  let currentIndex = -1;

  if (currentStageName) {
    currentIndex = stages.findIndex((s) => s.name === currentStageName);
  }

  // If candidate has no stage yet (newly applied), they start at stage 0
  if (currentIndex === -1) {
    currentIndex = -1; // Will advance to index 0
  }

  // 4. Determine next stage
  const nextIndex = currentIndex + 1;

  if (nextIndex >= stages.length) {
    // Already at the final stage - mark as the last stage (e.g., "Diterima")
    return NextResponse.json({
      message: "Kandidat sudah berada di tahapan terakhir.",
      current_stage: currentStageName,
    });
  }

  const nextStage = stages[nextIndex];
  const fromStageName = currentStageName || "Belum Ada Tahapan";
  const toStageName = nextStage.name;

  // 5. Update candidate
  const { error: updateErr } = await supabase
    .from("candidates")
    .update({
      current_stage_id: nextStage.id,
      current_stage_name: toStageName,
      status: toStageName, // Keep status in sync with stage name
    })
    .eq("id", candidateId);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // 6. Log the transition
  await supabase.from("candidate_stage_history").insert({
    candidate_id: candidateId,
    from_stage_name: fromStageName,
    to_stage_name: toStageName,
    changed_by_user_id: user.id,
    notes: body.notes || null,
  });

  // 7. If the next stage has a default_assignee_id (for custom stages), create a notification
  if (nextStage.default_assignee_id) {
    await supabase.from("notifications").insert({
      user_id: nextStage.default_assignee_id,
      title: `Kandidat baru di tahap "${toStageName}"`,
      message: `${candidate.full_name} telah memasuki tahap "${toStageName}" dan membutuhkan evaluasi Anda.`,
      type: "stage_advance",
      link: `/candidates/${candidateId}`,
    });
  }

  return NextResponse.json({
    success: true,
    from_stage: fromStageName,
    to_stage: toStageName,
    stage_index: nextIndex + 1,
    total_stages: stages.length,
  });
}
