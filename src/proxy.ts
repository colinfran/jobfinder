import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/auth"

export const proxy = async (request: NextRequest): Promise<NextResponse> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const url = new URL(request.url)
  const pathname = url.pathname

  // If user is NOT signed in and tries to access dashboard → redirect home
  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // If user IS signed in and tries to access homepage → redirect dashboard
  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // All other routes are allowed
  return NextResponse.next()
}

export const config = {
  // Apply proxy to homepage and dashboard routes
  matcher: ["/", "/dashboard/:path*"],
}
