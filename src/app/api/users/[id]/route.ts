import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        username: true,
        cargo: true,
        foto: true,
        role: true,
        email: true,
        telefone: true,
        aniversario: true,
        admissao: true,
        _count: {
          select: {
            postagens: true,
            likes: true,
            comentarios: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    const postagens = await prisma.postagem.findMany({
      where: { authorId: id },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            nome: true,
            foto: true,
            cargo: true,
            role: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comentarios: true,
          },
        },
      },
    })

    return NextResponse.json({ user, postagens }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar perfil" },
      { status: 500 }
    )
  }
}
