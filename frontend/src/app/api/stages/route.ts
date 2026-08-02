import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/stages
 * Returns the company's default recruitment stages, sorted by order_index.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("recruitment_stages")
    .select("*")
    .eq("company_id", user.id)
    .order("order_index", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

/**
 * POST /api/stages
 * Creates a new default recruitment stage for the company.
 * Body: { name, description?, color?, order_index }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, color, order_index } = body;

  if (!name || order_index === undefined) {
    return NextResponse.json(
      { error: "name and order_index are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("recruitment_stages")
    .insert({
      company_id: user.id,
      name,
      description: description || null,
      color: color || "#6366f1",
      order_index,
      is_system: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
