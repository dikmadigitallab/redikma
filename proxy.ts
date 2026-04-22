import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(req: NextRequest) {
  const session = req.cookies.get("session")

  const isLoginPage = req.nextUrl.pathname.startsWith("/login")

  // ❌ não logado → manda pro login
  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // ✅ já logado → evita voltar pro login
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL("/feed", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/feed/:path*",
    "/login",
  ],
}