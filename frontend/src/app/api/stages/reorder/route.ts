import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/stages/reorder
 * Batch update the order_index of multiple stages.
 * Body: { stages: [{ id, order_index }] }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { stages } = body;

  if (!Array.isArray(stages) || stages.length === 0) {
    return NextResponse.json(
      { error: "stages array is required" },
      { status: 400 }
    );
  }

  // First, temporarily set all to negative values to avoid unique constraint conflicts
  for (let i = 0; i < stages.length; i++) {
    const { id, order_index } = stages[i];
    const { error } = await supabase
      .from("recruitment_stages")
      .update({ order_index: -(i + 1000) })
      .eq("id", id)
      .eq("company_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Then set to actual values
  for (const { id, order_index } of stages) {
    const { error } = await supabase
      .from("recruitment_stages")
      .update({ order_index })
      .eq("id", id)
      .eq("company_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, count: stages.length });
}
