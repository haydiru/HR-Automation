import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Memastikan session di-refresh
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Sederhananya, jika di rute (dashboard) dan tidak ada user, redirect ke login
  if (
    !user &&
    request.nextUrl.pathname.startsWith("/(dashboard)") ||
    (!user && request.nextUrl.pathname.startsWith("/dashboard")) ||
    (!user && request.nextUrl.pathname.startsWith("/jobs")) ||
    (!user && request.nextUrl.pathname.startsWith("/candidates")) ||
    (!user && request.nextUrl.pathname.startsWith("/settings"))
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
