import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { pollUserGmailInbox } from "@/lib/gmail-poller";

/**
 * GET/POST /api/cron/gmail-ingest
 * Cron service endpoint to trigger automated Gmail inbox polling for all users who connected Gmail.
 */
export async function GET(request: Request) {
  return handleCronIngest(request);
}

export async function POST(request: Request) {
  return handleCronIngest(request);
}

async function handleCronIngest(request: Request) {
  const supabase = await createClient();

  try {
    // Fetch all connected Gmail tokens
    const { data: gmailTokens } = await supabase
      .from("google_tokens")
      .select("user_id")
      .eq("provider_type", "gmail");

    if (!gmailTokens || gmailTokens.length === 0) {
      return NextResponse.json({
        message: "No connected Gmail integrations found.",
        ingestedCount: 0,
      });
    }

    let totalIngested = 0;
    const allResults = [];

    for (const token of gmailTokens) {
      const res = await pollUserGmailInbox(token.user_id);
      totalIngested += res.length;
      allResults.push(...res);
    }

    return NextResponse.json({
      success: true,
      usersProcessed: gmailTokens.length,
      totalIngested,
      results: allResults,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
