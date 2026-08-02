import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/interviews
 * Assigns a mandate / schedules an interview for a candidate.
 * 
 * Body: {
 *   candidate_id: string;
 *   assigned_to_user_id: string;
 *   scheduled_at?: string;
 *   location?: string;
 *   notes?: string;
 * }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { candidate_id, assigned_to_user_id, scheduled_at, location, notes } = body;

    if (!candidate_id || !assigned_to_user_id) {
      return NextResponse.json(
        { error: "candidate_id dan assigned_to_user_id wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Get candidate details & assignee profile
    const [candRes, assigneeRes] = await Promise.all([
      supabase.from("candidates").select("id, full_name, current_stage_name").eq("id", candidate_id).single(),
      supabase.from("profiles").select("id, full_name, email").eq("id", assigned_to_user_id).single(),
    ]);

    if (candRes.error || !candRes.data) {
      return NextResponse.json({ error: "Kandidat tidak ditemukan." }, { status: 404 });
    }

    const candidate = candRes.data;
    const assigneeName = assigneeRes.data?.full_name || assigneeRes.data?.email || "SR Staff";

    // 2. Update candidate record
    const { error: updateErr } = await supabase
      .from("candidates")
      .update({
        assigned_to_user_id,
        assigned_staff_name: assigneeName,
        scheduled_at: scheduled_at || null,
        location: location || null,
        interview_status: "Scheduled",
      })
      .eq("id", candidate_id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // 3. Create candidate_assignments log
    await supabase.from("candidate_assignments").insert({
      candidate_id,
      assigned_to_user_id,
      assigned_by_user_id: user.id,
      stage_name: candidate.current_stage_name || "Wawancara",
      scheduled_at: scheduled_at || null,
      location: location || null,
      notes: notes || null,
      status: "pending",
    });

    // 4. Create in-app notification for the assigned SR staff
    await supabase.from("notifications").insert({
      user_id: assigned_to_user_id,
      title: `Mandat Wawancara Baru: ${candidate.full_name}`,
      message: `Anda ditugaskan menguji wawancara ${candidate.full_name}${scheduled_at ? ` pada ${new Date(scheduled_at).toLocaleString("id-ID")}` : ""}.`,
      type: "mandate",
      link: `/candidates/${candidate_id}`,
    });

    return NextResponse.json({
      success: true,
      candidate_id,
      assigned_to: assigneeName,
      scheduled_at,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PATCH /api/interviews
 * Reschedule interview or update interview status.
 * 
 * Body: {
 *   candidate_id: string;
 *   scheduled_at?: string;
 *   location?: string;
 *   interview_status?: string;
 * }
 */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { candidate_id, scheduled_at, location, interview_status } = body;

    if (!candidate_id) {
      return NextResponse.json({ error: "candidate_id wajib diisi." }, { status: 400 });
    }

    const updates: any = {};
    if (scheduled_at !== undefined) updates.scheduled_at = scheduled_at;
    if (location !== undefined) updates.location = location;
    if (interview_status !== undefined) updates.interview_status = interview_status;

    const { data: candidate, error: candErr } = await supabase
      .from("candidates")
      .update(updates)
      .eq("id", candidate_id)
      .select("id, full_name, assigned_to_user_id")
      .single();

    if (candErr) {
      return NextResponse.json({ error: candErr.message }, { status: 500 });
    }

    // Notify assigned staff if rescheduled
    if (scheduled_at && candidate?.assigned_to_user_id) {
      await supabase.from("notifications").insert({
        user_id: candidate.assigned_to_user_id,
        title: `Reschedule Wawancara: ${candidate.full_name}`,
        message: `Jadwal wawancara dengan ${candidate.full_name} telah diubah menjadi ${new Date(scheduled_at).toLocaleString("id-ID")}.`,
        type: "reschedule",
        link: `/candidates/${candidate_id}`,
      });
    }

    return NextResponse.json({ success: true, candidate_id, updates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
