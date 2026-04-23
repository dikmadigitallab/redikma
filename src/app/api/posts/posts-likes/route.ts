import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@//lib/prisma"

//curtir
export async function POST(req: Request) {
  try {
    const { postId, userId } = await req.json()

    if (!postId || !userId) {
      return NextResponse.json(
        { error: "Dados obrigatórios não informados" },
        { status: 400 }
      )
    }

    const like = await prisma.like.create({
      data: {
        postId,
        userId
      }
    })

    return NextResponse.json(like)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao curtir postagem" },
      { status: 500 }
    )
  }
}


export async function GET(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json(
        { error: "PostId não informado" },
        { status: 400 }
      )
    }

    const likes = await prisma.like.findMany({
      where: {
        postId
      },
      include: {
        user: {
          select: {
            id: true,
            nome: true,
            username: true,
            foto: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json({
      total: likes.length,
      likes
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar likes" },
      { status: 500 }
    )
  }
}

//descurtir
export async function DELETE(req: Request) {
  try {
    const { postId, userId } = await req.json()

    await prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao remover like" },
      { status: 500 }
    )
  }
}