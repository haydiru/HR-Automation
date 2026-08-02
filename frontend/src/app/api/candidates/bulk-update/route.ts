import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/candidates/bulk-update
 * Perform batch operations on multiple candidates (bulk advance, bulk reject, or bulk assign).
 * 
 * Body: {
 *   candidate_ids: string[];
 *   action: "advance" | "reject" | "assign_staff";
 *   assigned_to_user_id?: string;
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
    const { candidate_ids, action, assigned_to_user_id, notes } = body;

    if (!Array.isArray(candidate_ids) || candidate_ids.length === 0) {
      return NextResponse.json(
        { error: "candidate_ids (array non-kosong) wajib diisi." },
        { status: 400 }
      );
    }

    if (!["advance", "reject", "assign_staff"].includes(action)) {
      return NextResponse.json(
        { error: "action tidak valid. Pilih: advance, reject, atau assign_staff." },
        { status: 400 }
      );
    }

    let successCount = 0;
    const errors: string[] = [];

    if (action === "reject") {
      const { error } = await supabase
        .from("candidates")
        .update({
          status: "Rejected",
          current_stage_name: "Rejected",
        })
        .in("id", candidate_ids);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Log to history
      const historyRows = candidate_ids.map((id) => ({
        candidate_id: id,
        from_stage_name: "Unknown",
        to_stage_name: "Rejected",
        changed_by_user_id: user.id,
        notes: notes || "Mass Rejection",
      }));
      await supabase.from("candidate_stage_history").insert(historyRows);

      successCount = candidate_ids.length;
    } else if (action === "assign_staff") {
      if (!assigned_to_user_id) {
        return NextResponse.json(
          { error: "assigned_to_user_id wajib untuk action assign_staff." },
          { status: 400 }
        );
      }

      const { data: assignee } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", assigned_to_user_id)
        .single();

      const assigneeName = assignee?.full_name || assignee?.email || "SR Staff";

      const { error } = await supabase
        .from("candidates")
        .update({
          assigned_to_user_id,
          assigned_staff_name: assigneeName,
        })
        .in("id", candidate_ids);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Create notification
      await supabase.from("notifications").insert({
        user_id: assigned_to_user_id,
        title: `Mandat Massal: ${candidate_ids.length} Kandidat`,
        message: `Anda telah ditugaskan menguji ${candidate_ids.length} kandidat baru.`,
        type: "mandate",
        link: "/candidates",
      });

      successCount = candidate_ids.length;
    } else if (action === "advance") {
      // Loop through candidate_ids and advance each
      for (const candId of candidate_ids) {
        try {
          const { data: cand } = await supabase
            .from("candidates")
            .select("*, jobs(id, user_id, use_custom_stages)")
            .eq("id", candId)
            .single();

          if (!cand || !cand.jobs) continue;

          const job = cand.jobs;
          let stages: any[] = [];

          if (job.use_custom_stages) {
            const { data: cStages } = await supabase
              .from("job_stages")
              .select("*")
              .eq("job_id", job.id)
              .order("order_index", { ascending: true });
            stages = cStages || [];
          } else {
            const { data: dStages } = await supabase
              .from("recruitment_stages")
              .select("*")
              .eq("company_id", job.user_id)
              .order("order_index", { ascending: true });
            stages = dStages || [];
          }

          if (stages.length === 0) continue;

          const currentStageName = cand.current_stage_name;
          let currentIndex = stages.findIndex((s) => s.name === currentStageName);
          const nextIndex = currentIndex + 1;

          if (nextIndex < stages.length) {
            const nextStage = stages[nextIndex];
            await supabase
              .from("candidates")
              .update({
                current_stage_id: nextStage.id,
                current_stage_name: nextStage.name,
                status: nextStage.name,
              })
              .eq("id", candId);

            await supabase.from("candidate_stage_history").insert({
              candidate_id: candId,
              from_stage_name: currentStageName || "Pending",
              to_stage_name: nextStage.name,
              changed_by_user_id: user.id,
              notes: notes || "Mass Advance",
            });

            successCount++;
          }
        } catch (e: any) {
          errors.push(`Failed for ${candId}: ${e.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      action,
      total_requested: candidate_ids.length,
      processed: successCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
