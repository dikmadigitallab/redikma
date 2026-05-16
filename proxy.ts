import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isProtected = ["/intern", "/admin"].some((route) =>
    pathname.startsWith(route)
  )

  if (!isProtected) return NextResponse.next()

  let token
  try {
    token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })
  } catch {
    token = null
  }

  if (!token) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (token.first_acess) {
    return NextResponse.redirect(new URL("/primeiro-acesso", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/intern/:path*",
    "/admin/:path*",
  ],
}