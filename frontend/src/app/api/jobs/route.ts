import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  
  // Fetch jobs with candidate counts
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*, candidates(id, is_qualified)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform to include candidate_count and qualified_count
  const enrichedJobs = (jobs || []).map((job: any) => {
    const candidates = job.candidates || [];
    return {
      ...job,
      status: job.status || "active",
      candidate_count: candidates.length,
      qualified_count: candidates.filter((c: any) => c.is_qualified).length,
      candidates: undefined, // Remove raw candidates array from response
    };
  });

  return NextResponse.json(enrichedJobs);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, mandatory_criteria, optional_criteria, passing_grade, alias_email } = body;

  const { data: job, error } = await supabase
    .from("jobs")
    .insert([
      {
        user_id: user.id,
        title,
        description,
        mandatory_criteria,
        optional_criteria,
        passing_grade,
        alias_email,
        status: "active",
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(job);
}
