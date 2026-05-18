import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { notify } from "@/lib/notifications/notify"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function POST(req: Request) {
  try {
    const { commentId, userId } = await req.json()

    if (!commentId || !userId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const comment = await prisma.comentario.findUnique({
      where: { id: commentId },
      select: {
        postId: true,
        authorId: true,
      },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 })
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
        postId: comment.postId,
      },
    })

    // Notifica o autor do comentário
    const session = await getServerSession(authOptions)
    const nome = session?.user?.nome || "Alguém"

    if (comment.authorId !== userId) {
      await notify({
        type: "LIKE",
        title: "Nova curtida",
        message: `${nome} curtiu seu comentário`,
        userIds: [comment.authorId],
        actorId: userId,
        data: { postId: comment.postId },
      })
    }

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