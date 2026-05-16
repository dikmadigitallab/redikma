import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/intern", "/admin"]

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (!isProtected) {
    return NextResponse.next()
  }

  const token = req.cookies.get("next-auth.session-token")

  if (!token?.value) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/intern/:path*",
    "/admin/:path*",
  ],
}