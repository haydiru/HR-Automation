import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { startOfDay, subDays, format } from "date-fns";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Get Summary Stats
  const today = startOfDay(new Date()).toISOString();
  
  const [
    { count: totalToday },
    { count: totalQualified },
    { count: totalCandidates },
    { count: activeJobsCount },
    { count: pendingReview }
  ] = await Promise.all([
    supabase.from("candidates").select("*", { count: "exact", head: true }).gte("created_at", today),
    supabase.from("candidates").select("*", { count: "exact", head: true }).eq("is_qualified", true),
    supabase.from("candidates").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("candidates").select("*", { count: "exact", head: true }).eq("status", "Pending")
  ]);

  // 2. Get Recent Candidates (with job title)
  const { data: recentCandidates } = await supabase
    .from("candidates")
    .select("*, jobs(title)")
    .order("created_at", { ascending: false })
    .limit(5);

  // 3. Get Active Jobs (with real candidate counts)
  const { data: activeJobs } = await supabase
    .from("jobs")
    .select("*, candidates(id, is_qualified)")
    .order("created_at", { ascending: false })
    .limit(4);

  // 4. Build Chart Data from real candidate data (last 7 days)
  const { data: chartCandidates } = await supabase
    .from("candidates")
    .select("created_at, is_qualified")
    .gte("created_at", subDays(new Date(), 6).toISOString())
    .order("created_at", { ascending: true });

  // Group by date
  const chartMap = new Map<string, { applicants: number; qualified: number }>();
  for (let i = 0; i <= 6; i++) {
    const d = subDays(new Date(), 6 - i);
    const key = format(d, "dd MMM");
    chartMap.set(key, { applicants: 0, qualified: 0 });
  }
  
  (chartCandidates || []).forEach((c: any) => {
    const key = format(new Date(c.created_at), "dd MMM");
    const entry = chartMap.get(key);
    if (entry) {
      entry.applicants++;
      if (c.is_qualified) entry.qualified++;
    }
  });

  const chartData = Array.from(chartMap.entries()).map(([date, data]) => ({
    date,
    ...data,
  }));

  return NextResponse.json({
    stats: {
      total_applicants_today: totalToday || 0,
      qualified_percentage: totalCandidates ? Math.round(((totalQualified || 0) / totalCandidates) * 100) : 0,
      active_jobs: activeJobsCount || 0,
      pending_review: pendingReview || 0,
    },
    recentCandidates: recentCandidates?.map(c => ({
      ...c,
      job_title: (c.jobs as any)?.title
    })) || [],
    activeJobs: activeJobs?.map(j => {
      const candidates = (j.candidates as any[]) || [];
      return {
        ...j,
        candidate_count: candidates.length,
        qualified_count: candidates.filter((c: any) => c.is_qualified).length,
        candidates: undefined,
      };
    }) || [],
    chartData
  });
}
