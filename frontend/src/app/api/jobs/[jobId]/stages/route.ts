import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/jobs/[jobId]/stages
 * Returns the effective recruitment stages for a specific job.
 * If job.use_custom_stages is true, returns stages from `job_stages`.
 * Otherwise, returns company default stages from `recruitment_stages`.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Fetch job details
  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .select("id, user_id, use_custom_stages")
    .eq("id", jobId)
    .single();

  if (jobErr || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // 2. Check if job uses custom stages
  if (job.use_custom_stages) {
    const { data: customStages, error: customErr } = await supabase
      .from("job_stages")
      .select("*")
      .eq("job_id", jobId)
      .order("order_index", { ascending: true });

    if (customErr) {
      return NextResponse.json({ error: customErr.message }, { status: 500 });
    }

    return NextResponse.json({
      use_custom_stages: true,
      stages: customStages || [],
    });
  }

  // 3. Fallback to company default recruitment_stages
  const { data: defaultStages, error: defaultErr } = await supabase
    .from("recruitment_stages")
    .select("*")
    .eq("company_id", job.user_id)
    .order("order_index", { ascending: true });

  if (defaultErr) {
    return NextResponse.json({ error: defaultErr.message }, { status: 500 });
  }

  return NextResponse.json({
    use_custom_stages: false,
    stages: defaultStages || [],
  });
}

/**
 * POST /api/jobs/[jobId]/stages
 * Copies company default stages to job_stages so they can be customized per-job,
 * and sets job.use_custom_stages = true.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Fetch company default stages
  const { data: defaultStages } = await supabase
    .from("recruitment_stages")
    .select("*")
    .eq("company_id", user.id)
    .order("order_index", { ascending: true });

  if (!defaultStages || defaultStages.length === 0) {
    return NextResponse.json(
      { error: "Belum ada tahapan default perusahaan." },
      { status: 400 }
    );
  }

  // 2. Insert into job_stages
  const newJobStages = defaultStages.map((s) => ({
    job_id: jobId,
    name: s.name,
    description: s.description,
    order_index: s.order_index,
    color: s.color,
  }));

  const { data: inserted, error: insertErr } = await supabase
    .from("job_stages")
    .insert(newJobStages)
    .select();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // 3. Update job.use_custom_stages = true
  await supabase
    .from("jobs")
    .update({ use_custom_stages: true })
    .eq("id", jobId)
    .eq("user_id", user.id);

  return NextResponse.json({
    use_custom_stages: true,
    stages: inserted,
  });
}

/**
 * PATCH /api/jobs/[jobId]/stages
 * Save or update custom stages array for this job.
 * Body: { use_custom_stages: boolean, stages?: Array<{ name, description?, order_index, color?, default_assignee_id? }> }
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { use_custom_stages, stages } = body;

  // 1. If switching back to company default
  if (use_custom_stages === false) {
    await supabase.from("job_stages").delete().eq("job_id", jobId);
    await supabase
      .from("jobs")
      .update({ use_custom_stages: false })
      .eq("id", jobId)
      .eq("user_id", user.id);

    return NextResponse.json({ use_custom_stages: false });
  }

  // 2. If saving custom stages
  if (Array.isArray(stages)) {
    // Delete existing job_stages
    await supabase.from("job_stages").delete().eq("job_id", jobId);

    // Insert new custom stages
    const newJobStages = stages.map((s, idx) => ({
      job_id: jobId,
      name: s.name,
      description: s.description || null,
      order_index: idx + 1,
      color: s.color || "#6366f1",
      default_assignee_id: s.default_assignee_id || null,
    }));

    const { data: inserted, error: insertErr } = await supabase
      .from("job_stages")
      .insert(newJobStages)
      .select();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    await supabase
      .from("jobs")
      .update({ use_custom_stages: true })
      .eq("id", jobId)
      .eq("user_id", user.id);

    return NextResponse.json({
      use_custom_stages: true,
      stages: inserted,
    });
  }

  return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
}
