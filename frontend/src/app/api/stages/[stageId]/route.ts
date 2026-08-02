import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * PATCH /api/stages/[stageId]
 * Updates an existing recruitment stage (name, description, color, order_index).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ stageId: string }> }
) {
  const { stageId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, any> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.color !== undefined) updates.color = body.color;
  if (body.order_index !== undefined) updates.order_index = body.order_index;

  const { data, error } = await supabase
    .from("recruitment_stages")
    .update(updates)
    .eq("id", stageId)
    .eq("company_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * DELETE /api/stages/[stageId]
 * Deletes a recruitment stage (only non-system stages).
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ stageId: string }> }
) {
  const { stageId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if the stage is a system stage
  const { data: stage } = await supabase
    .from("recruitment_stages")
    .select("is_system")
    .eq("id", stageId)
    .eq("company_id", user.id)
    .single();

  if (stage?.is_system) {
    return NextResponse.json(
      { error: "Tahapan bawaan sistem tidak bisa dihapus." },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("recruitment_stages")
    .delete()
    .eq("id", stageId)
    .eq("company_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
