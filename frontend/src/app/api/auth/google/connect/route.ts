import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "calendar"; // 'gmail' | 'calendar'

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID belum dikonfigurasi di environment variables." },
      { status: 500 }
    );
  }

  // Determine dynamic origin (Vercel production vs localhost)
  const host = request.headers.get("host") || "hr-automation-one.vercel.app";
  const protocol = host.includes("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  // Scopes definition
  let scope = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";
  if (type === "gmail") {
    scope += " https://www.googleapis.com/auth/gmail.readonly";
  } else {
    scope += " https://www.googleapis.com/auth/calendar.events";
  }

  const state = JSON.stringify({
    userId: user.id,
    type,
    redirectUri,
  });

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("state", Buffer.from(state).toString("base64"));

  return NextResponse.redirect(authUrl.toString());
}
