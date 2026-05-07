import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "../auth/[...nextauth]/route"
import { getServerSession } from "next-auth"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!(session?.user.role === "ADMIN" || session?.user.role === "SYSTEM_ADM")) {
    console.log("regra de usuario: ", session?.user.role)
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }


  try {
    const { searchParams } = new URL(req.url)
    const busca = searchParams.get("busca")

    const where = busca
      ? {
        OR: [
          { nome: { contains: busca, mode: "insensitive" as const } },
          { username: { contains: busca, mode: "insensitive" as const } },
          { cpf: { contains: busca } },
          { cargo: { contains: busca, mode: "insensitive" as const } },
        ],
      }
      : {}

    const usuarios = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nome: true,
        username: true,
        cpf: true,
        cargo: true,
        role: true,
        foto: true,
        aniversario: true,
        admissao: true,
      },
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(usuarios)
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
  }
}