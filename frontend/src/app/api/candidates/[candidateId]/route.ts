import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { candidateId } = await params;
  const supabase = await createAdminClient();
  
  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("*, jobs(*)")
    .eq("id", candidateId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Generate Signed URL for CV (Private)
  if (candidate.cv_url) {
    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from("cv-documents")
      .createSignedUrl(candidate.cv_url, 3600); // 1 jam validitas
    
    if (signedUrlError) {
      console.error("Signed URL Error:", signedUrlError.message);
    } else {
      candidate.signed_cv_url = signedUrl.signedUrl;
    }
  }

  return NextResponse.json(candidate);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { candidateId } = await params;
  const supabase = await createAdminClient();
  const body = await request.json();
  const { status } = body;

  const { data: candidate, error } = await supabase
    .from("candidates")
    .update({ status })
    .eq("id", candidateId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(candidate);
}
