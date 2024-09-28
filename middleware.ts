import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname
    const token = req.nextauth.token

    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (path === "/dashboard" && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ["/dashboard", "/admin/:path*"]
}