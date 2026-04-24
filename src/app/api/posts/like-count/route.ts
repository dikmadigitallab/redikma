import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@//lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json(
        { error: "PostId não informado" },
        { status: 400 }
      )
    }

    const total = await prisma.like.count({
      where: {
        postId,
      },
    })

    return NextResponse.json({ total })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Erro ao buscar quantidade de likes" },
      { status: 500 }
    )
  }
}