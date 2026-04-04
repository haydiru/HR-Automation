import { createAdminClient } from "@/lib/supabase/server";
import { analyzeCandidate } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // 1. Validasi Keamanan
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  
  // Periksa apakah request datang dari origin yang sama (Formulir Website kita sendiri)
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const isSameOrigin = origin && host && origin.includes(host);
  
  // Jika bukan dari website sendiri DAN secret tidak cocok, maka Unauthorized
  if (!isSameOrigin && secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createAdminClient();
  
  try {
    const formData = await request.formData();
    let jobId = formData.get("job_id") as string;
    const aliasEmail = formData.get("alias_email") as string; // Optional: can be used to find job
    const fullName = formData.get("full_name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const cvFile = formData.get("cv_file") as File;

    if (!jobId && !aliasEmail) {
      return NextResponse.json({ error: "Missing job_id or alias_email" }, { status: 400 });
    }

    if (!cvFile) {
      return NextResponse.json({ error: "Missing cv_file" }, { status: 400 });
    }

    // 1. Get Job details (by ID or Alias)
    let query = supabase.from("jobs").select("*");
    
    if (jobId) {
      query = query.eq("id", jobId);
    } else {
      query = query.eq("alias_email", aliasEmail);
    }

    const { data: job, error: jobError } = await query.single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Since we found the job, ensure we have the real ID
    jobId = job.id;

    if (job.status !== "active") {
      return NextResponse.json({ error: "Job is no longer active" }, { status: 400 });
    }

    // 2. Upload to Supabase Storage (Private)
    const fileName = `${jobId}/${Date.now()}-${cvFile.name}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from("cv-documents")
      .upload(fileName, cvFile);

    if (storageError) {
      throw new Error(`Storage error: ${storageError.message}`);
    }

    const emailBody = formData.get("email_body") as string;
    const subject = formData.get("subject") as string;

    // 3. Extract Text & Analyze with Gemini (Direct PDF)
    const arrayBuffer = await cvFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const analysis = await analyzeCandidate(
      buffer,
      job.title,
      job.mandatory_criteria,
      job.optional_criteria,
      job.passing_grade,
      emailBody,
      subject
    );

    const rawText = analysis.extracted_text;

    // 5. Save to Database (Prioritize data extracted by AI from PDF)
    const finalName = analysis.candidate_name || fullName || "Anonymous Applicant";
    const finalEmail = analysis.candidate_email || email || "no-email@provided.com";

    const { data: candidate, error: candidateError } = await supabase
      .from("candidates")
      .insert([
        {
          job_id: jobId,
          full_name: finalName,
          email: finalEmail,
          phone: phone || analysis.candidate_phone || "",
          cv_url: storageData.path,
          raw_text: rawText,
          analysis_result: analysis,
          total_score: analysis.total_score,
          is_qualified: analysis.is_qualified,
          status: analysis.is_qualified ? "Ready to Interview" : "Pending",
        },
      ])
      .select()
      .single();

    if (candidateError) {
      throw new Error(`Database error: ${candidateError.message}`);
    }

    return NextResponse.json({
      success: true,
      candidate_id: candidate.id,
      score: analysis.total_score,
      qualified: analysis.is_qualified
    });

  } catch (error: any) {
    console.error("Ingest Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
