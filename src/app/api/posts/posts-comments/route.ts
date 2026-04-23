import { NextResponse } from "next/server"
import { prisma } from "@//lib/prisma"

// CREATE
export async function POST(req: Request) {
  try {
    const { texto, postId, authorId } = await req.json()

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
        authorId
      },
      include: {
        author: {
          select: {
            id: true,
            nome: true,
            username: true,
            foto: true
          }
        }
      }
    })

    return NextResponse.json(comentario)
  } catch {
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
      include: {
        author: {
          select: {
            id: true,
            nome: true,
            username: true,
            foto: true
          }
        },
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
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar comentários" },
      { status: 500 }
    )
  }
}

// UPDATE
export async function PUT(req: Request) {
  try {
    const { id, texto } = await req.json()

    if (!id || !texto) {
      return NextResponse.json(
        { error: "Dados obrigatórios não informados" },
        { status: 400 }
      )
    }

    const comentario = await prisma.comentario.update({
      where: { id },
      data: { texto }
    })

    return NextResponse.json(comentario)
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar comentário" },
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
  } catch {
    return NextResponse.json(
      { error: "Erro ao deletar comentário" },
      { status: 500 }
    )
  }
}