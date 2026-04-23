import { NextResponse } from "next/server"
import { prisma } from "@//lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { label, authorId,postador, duration, image, video } = body

    if (!label || !authorId) {
      return NextResponse.json(
        { error: "Campos obrigatórios não informados" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: authorId },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    if (user.role !== "COMMON") {
      return NextResponse.json(
        { error: "Sem permissão para postar" },
        { status: 403 }
      )
    }

    const postagem = await prisma.postagem.create({
      data: {
        label,
        authorId,
        duration: duration ?? "",
        image,
        video,
        postador,
        publicado: true,
      },
    })

    return NextResponse.json(postagem, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar postagem" },
      { status: 500 }
    )
  }
}


export async function GET() {
  try {
    const postagens = await prisma.postagem.findMany({
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(postagens, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar postagens" },
      { status: 500 }
    )
  }
}