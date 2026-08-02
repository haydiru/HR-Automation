import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/candidates/[candidateId]/notify
 * Sends email notification to candidate (e.g. interview invitation or status update).
 * 
 * Body: {
 *   subject: string;
 *   message: string;
 *   type?: "interview_invitation" | "rejection" | "update";
 * }
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

  try {
    const body = await request.json();
    const { subject, message, type } = body;

    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject dan message wajib diisi." },
        { status: 400 }
      );
    }

    const { data: candidate, error } = await supabase
      .from("candidates")
      .select("id, full_name, email, job_title")
      .eq("id", candidateId)
      .single();

    if (error || !candidate) {
      return NextResponse.json({ error: "Kandidat tidak ditemukan." }, { status: 404 });
    }

    // Log the email notification dispatch
    // In production, integrate Resend / SMTP / Gmail API to deliver the email
    console.log(`[Email Dispatch] To: ${candidate.email} | Subject: ${subject} | Type: ${type || "general"}`);

    return NextResponse.json({
      success: true,
      recipient: candidate.email,
      candidate_name: candidate.full_name,
      subject,
      dispatched_at: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
