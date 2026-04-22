import { NextResponse } from "next/server"
import { prisma } from "@//lib/prisma"

function limparCPF(cpf: string) {
  return cpf.replace(/\D/g, "")
}

export async function POST(req: Request) {
  const { cpf } = await req.json()
  const cpfLimpo = limparCPF(cpf)

  const user = await prisma.user.findUnique({
    where: { cpf: cpfLimpo },
  })

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  }

  const response = NextResponse.json({ message: "Login OK" })

  // 🍪 COOKIE PERSISTENTE
  response.cookies.set("session", user.id, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 1, // 7 dias
  })

  return response
}