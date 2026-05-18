import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { postIds, userId } = await req.json()

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json({})
    }

    const [likes, commentCounts] = await Promise.all([
      prisma.like.findMany({
        where: { postId: { in: postIds } },
        include: {
          user: {
            select: { id: true, nome: true, foto: true },
          },
        },
      }),
      prisma.comentario.groupBy({
        by: ["postId"],
        where: { postId: { in: postIds }, aprovado: true },
        _count: { id: true },
      }),
    ])

    const likesByPost: Record<string, typeof likes> = {}
    for (const like of likes) {
      if (!like.postId) continue
      if (!likesByPost[like.postId]) likesByPost[like.postId] = []
      likesByPost[like.postId].push(like)
    }

    const countsByPost: Record<string, number> = {}
    for (const c of commentCounts) {
      countsByPost[c.postId] = c._count.id
    }

    const result: Record<string, {
      likesCount: number
      liked: boolean
      likers: { id: string; nome: string; foto: string; createdAt: Date }[]
      commentsCount: number
    }> = {}

    for (const postId of postIds) {
      const postLikes = likesByPost[postId] || []
      result[postId] = {
        likesCount: postLikes.length,
        liked: userId ? postLikes.some((l) => l.userId === userId) : false,
        likers: postLikes.map((l) => ({
          id: l.user.id,
          nome: l.user.nome,
          foto: l.user.foto?.trim() ? l.user.foto : "/photoProfile/userDefault.png",
          createdAt: l.createdAt,
        })),
        commentsCount: countsByPost[postId] || 0,
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Erro em feed-data:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
