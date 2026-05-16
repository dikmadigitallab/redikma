import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Se não estiver logado, redireciona para /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Se estiver logado, permite o acesso
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/intern/:path*",
    "/admin/:path*",
  ],
}