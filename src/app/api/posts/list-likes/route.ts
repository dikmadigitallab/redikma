import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json(
        { error: "postId é obrigatório" },
        { status: 400 }
      )
    }

    const likes = await prisma.like.findMany({
      where: {
        postId,
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            foto: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    console.log("LIKES ENCONTRADOS:", JSON.stringify(likes, null, 2))

    const likers = likes
      .filter((like) => like.user)
      .map((like) => ({
        id: like.user.id,
        nome: like.user.nome,
        foto:
          like.user.foto && like.user.foto.trim() !== ""
            ? like.user.foto
            : "https://i.pravatar.cc/150?u=" + like.user.id,
        createdAt: like.createdAt,
      }))

    console.log("LIKERS RETORNADOS:", JSON.stringify(likers, null, 2))

    return NextResponse.json({
      total: likers.length,
      likers,
    })
  } catch (error) {
    console.error("Erro ao buscar usuários que curtiram:", error)

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
      },
      {
        status: 500,
      }
    )
  }
}