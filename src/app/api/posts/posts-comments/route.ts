import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// CREATE
export async function POST(req: Request) {
  try {
    const { texto, postId, authorId, parentId } = await req.json()

    if (!texto || !postId || !authorId) {
      return NextResponse.json(
        { error: "Dados obrigatórios não informados" },
        { status: 400 }
      )
    }

    const comentario = await prisma.comentario.create({
      data: {
        texto,
        postId,
        authorId,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            nome: true,
            username: true,
            foto: true
          }
        },
        likes: true,
        _count: {
          select: {
            likes: true
          }
        }
      }
    })

    return NextResponse.json(comentario)
  } catch (error) {
    console.error("Erro ao criar comentário:", error)
    return NextResponse.json(
      { error: "Erro ao criar comentário" },
      { status: 500 }
    )
  }
}

// READ (por post)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json(
        { error: "postId não informado" },
        { status: 400 }
      )
    }

    const comentarios = await prisma.comentario.findMany({
      where: {
        postId,
        aprovado: true
      },
      select: {
        id: true,
        texto: true,
        parentId: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            nome: true,
            username: true,
            foto: true
          }
        },
        likes: true,
        _count: {
          select: {
            likes: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(comentarios)
  } catch (error) {
    console.error("Erro ao buscar comentários:", error)
    return NextResponse.json(
      { error: "Erro ao buscar comentários" },
      { status: 500 }
    )
  }
}

// DELETE
export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json(
        { error: "Id não informado" },
        { status: 400 }
      )
    }

    await prisma.comentario.delete({
      where: { id }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Erro ao deletar comentário:", error)
    return NextResponse.json(
      { error: "Erro ao deletar comentário" },
      { status: 500 }
    )
  }
}