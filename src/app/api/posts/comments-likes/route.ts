import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { commentId, userId } = await req.json()

    if (!commentId || !userId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        comentarioId: commentId,
        userId: userId,
      },
    })

    if (existingLike) {
      return NextResponse.json({ message: "Já curtido" })
    }

    await prisma.like.create({
      data: {
        comentarioId: commentId,
        userId: userId,
      },
    })

    return NextResponse.json({ message: "Curtido com sucesso" })
  } catch (error) {
    console.error("Erro ao curtir comentário:", error)
    return NextResponse.json({ error: "Erro ao curtir" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { commentId, userId } = await req.json()

    if (!commentId || !userId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    await prisma.like.deleteMany({
      where: {
        comentarioId: commentId,
        userId: userId,
      },
    })

    return NextResponse.json({ message: "Curtida removida" })
  } catch (error) {
    console.error("Erro ao remover curtida:", error)
    return NextResponse.json({ error: "Erro ao remover" }, { status: 500 })
  }
}