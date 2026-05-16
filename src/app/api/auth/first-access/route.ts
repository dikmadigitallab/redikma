import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { encode, decode } from "next-auth/jwt"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { aceiteTermos, aceiteLgpd, aceiteCookies } = await req.json()

    if (!aceiteTermos || !aceiteLgpd || !aceiteCookies) {
      return NextResponse.json({ error: "Todos os termos devem ser aceitos" }, { status: 400 })
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? req.headers.get("x-real-ip")
      ?? "unknown"

    await prisma.aceite_termos.create({
      data: { userId: session.user.id },
    })

    await prisma.aceite_lgpd.create({
      data: { userId: session.user.id },
    })

    await prisma.aceite_cookies.create({
      data: { userId: session.user.id, ip },
    })

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { first_acess: true },
    })

    const raw = req.headers.get("cookie") || ""
    const pairs = raw.split(";").filter(Boolean)
    const cookies: Record<string, string> = {}
    for (const pair of pairs) {
      const idx = pair.indexOf("=")
      if (idx > 0) {
        cookies[pair.substring(0, idx).trim()] = pair.substring(idx + 1).trim()
      }
    }

    const tokenName = "next-auth.session-token" in cookies
      ? "next-auth.session-token"
      : "__Secure-next-auth.session-token"
    const sessionToken = cookies[tokenName]

    if (sessionToken) {
      const decoded = await decode({
        token: sessionToken,
        secret: process.env.NEXTAUTH_SECRET!,
      })

      if (decoded) {
        decoded.first_acess = true

        const newToken = await encode({
          token: decoded,
          secret: process.env.NEXTAUTH_SECRET!,
          maxAge: 60 * 60 * 24 * 7,
        })

        const response = NextResponse.json({ success: true, user: { first_acess: user.first_acess } })
        response.cookies.set(tokenName, newToken, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7,
        })

        return response
      }
    }

    return NextResponse.json({ success: true, user: { first_acess: user.first_acess } })
  } catch (error) {
    console.error("Erro no first-access:", error)
    return NextResponse.json({ error: "Erro ao processar primeiro acesso" }, { status: 500 })
  }
}
