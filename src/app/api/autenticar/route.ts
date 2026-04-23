import { NextResponse } from "next/server"
import { prisma } from "@//lib/prisma"
import { cookies } from "next/headers"

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





export async function GET() {
  const cookieStore = await cookies() // 👈 AQUI
 
  const session = cookieStore.get("session")?.value

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session },
    select: {
      id: true,
      nome: true,
      username: true, 
      foto: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
  }

  return NextResponse.json(user)
}