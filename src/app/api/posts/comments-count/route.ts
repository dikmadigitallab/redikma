

import { NextRequest, NextResponse } from "next/server"
import { countCommentsByPostId } from "@/lib/comentarios"

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

    const total = await countCommentsByPostId(postId)

    return NextResponse.json({ total })
  } catch (error) {
    console.error("Erro ao contar comentários:", error)

    return NextResponse.json(
      { error: "Erro ao contar comentários" },
      { status: 500 }
    )
  }
}