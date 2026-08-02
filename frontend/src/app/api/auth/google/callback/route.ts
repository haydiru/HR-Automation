import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const host = request.headers.get("host") || "hr-automation-one.vercel.app";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  if (errorParam || !code || !stateRaw) {
    console.error("[OAuth Callback] Authorization error:", errorParam);
    return NextResponse.redirect(
      new URL(`/settings/integrations?error=${encodeURIComponent(errorParam || "Authorization denied")}`, baseUrl)
    );
  }

  try {
    const state = JSON.parse(Buffer.from(stateRaw, "base64").toString("utf-8"));
    const { userId, type, redirectUri } = state;

    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

    // 1. Exchange code for access & refresh tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("[OAuth Token Exchange Error]:", errText);
      return NextResponse.redirect(
        new URL(`/settings/integrations?error=TokenExchangeFailed`, baseUrl)
      );
    }

    const tokens = await tokenRes.json();
    const { access_token, refresh_token, expires_in } = tokens;

    // 2. Fetch connected Google User email
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    let googleEmail = "";
    if (userInfoRes.ok) {
      const userInfo = await userInfoRes.json();
      googleEmail = userInfo.email || "";
    }

    // 3. Store tokens using admin client to bypass RLS for token storage
    const supabase = await createAdminClient();

    if (type === "gmail") {
      // Update company profile for Direct Gmail Ingestion
      await supabase
        .from("profiles")
        .update({
          gmail_connected: true,
          gmail_address: googleEmail,
        })
        .eq("id", userId);
    }

    // Store/upsert token details in google_tokens table or profiles metadata
    const expiresAt = new Date(Date.now() + (expires_in || 3600) * 1000).toISOString();

    const { error: upsertErr } = await supabase.from("google_tokens").upsert(
      {
        user_id: userId,
        provider_type: type,
        access_token,
        refresh_token: refresh_token || undefined, // keep existing refresh_token if not returned
        scope: type === "gmail" ? "gmail.readonly" : "calendar.events",
        expires_at: expiresAt,
      },
      { onConflict: "user_id,provider_type" }
    );

    if (upsertErr) {
      console.warn("[OAuth Store Token Warning]:", upsertErr.message);
    }

    return NextResponse.redirect(
      new URL(`/settings/integrations?success=1&type=${type}&email=${encodeURIComponent(googleEmail)}`, baseUrl)
    );
  } catch (err: any) {
    console.error("[OAuth Callback Exception]:", err);
    return NextResponse.redirect(
      new URL(`/settings/integrations?error=${encodeURIComponent(err.message)}`, baseUrl)
    );
  }
}
