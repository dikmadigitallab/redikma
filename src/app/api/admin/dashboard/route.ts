import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (session?.user?.role !== "SYSTEM_ADM") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    const [posts, allComments, allLikes] = await Promise.all([
      prisma.postagem.findMany({
        include: {
          author: { select: { id: true, nome: true } },
          _count: { select: { likes: true, comentarios: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.comentario.findMany({
        include: {
          author: { select: { id: true, nome: true } },
          _count: { select: { likes: true } },
        },
      }),
      prisma.like.findMany({
        include: {
          user: { select: { id: true, nome: true } },
        },
      }),
    ])

    const postsByHour: Record<number, number> = {}
    const postsByDay: Record<string, number> = {}
    const postsByMonth: Record<string, number> = {}
    const postsByYear: Record<number, number> = {}

    for (const post of posts) {
      const date = new Date(post.createdAt)
      const hour = date.getHours()
      const day = date.toISOString().split("T")[0]
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const year = date.getFullYear()

      postsByHour[hour] = (postsByHour[hour] || 0) + 1
      postsByDay[day] = (postsByDay[day] || 0) + 1
      postsByMonth[month] = (postsByMonth[month] || 0) + 1
      postsByYear[year] = (postsByYear[year] || 0) + 1
    }

    const mostLikedPosts = posts
      .map((p) => ({
        id: p.id,
        label: p.label,
        author: p.author.nome,
        likeCount: p._count.likes,
      }))
      .sort((a, b) => b.likeCount - a.likeCount)
      .slice(0, 10)

    const mostCommentedPosts = posts
      .map((p) => ({
        id: p.id,
        label: p.label,
        author: p.author.nome,
        commentCount: p._count.comentarios,
      }))
      .sort((a, b) => b.commentCount - a.commentCount)
      .slice(0, 10)

    const commenterMap: Record<string, { id: string; name: string; count: number }> = {}
    for (const c of allComments) {
      if (!commenterMap[c.authorId]) {
        commenterMap[c.authorId] = { id: c.authorId, name: c.author.nome, count: 0 }
      }
      commenterMap[c.authorId].count++
    }
    const topCommenters = Object.values(commenterMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const replyMap: Record<string, { id: string; name: string; count: number }> = {}
    for (const c of allComments) {
      if (!c.parentId) continue
      if (!replyMap[c.authorId]) {
        replyMap[c.authorId] = { id: c.authorId, name: c.author.nome, count: 0 }
      }
      replyMap[c.authorId].count++
    }
    const topReplyGivers = Object.values(replyMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const commentLikeMap: Record<string, { id: string; name: string; count: number }> = {}
    for (const like of allLikes) {
      if (!like.comentarioId) continue
      if (!commentLikeMap[like.userId]) {
        commentLikeMap[like.userId] = { id: like.userId, name: like.user.nome, count: 0 }
      }
      commentLikeMap[like.userId].count++
    }
    const topCommentLikers = Object.values(commentLikeMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const mostEngagedPosts = posts
      .map((p) => ({
        id: p.id,
        label: p.label,
        author: p.author.nome,
        engagementCount: p._count.likes + p._count.comentarios,
      }))
      .sort((a, b) => b.engagementCount - a.engagementCount)
      .slice(0, 10)

    const posterMap: Record<string, { id: string; name: string; count: number }> = {}
    for (const p of posts) {
      if (!posterMap[p.authorId]) {
        posterMap[p.authorId] = { id: p.authorId, name: p.author.nome, count: 0 }
      }
      posterMap[p.authorId].count++
    }
    const topPosters = Object.values(posterMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    let bestHour = -1
    let bestHourCount = 0
    for (const [hour, count] of Object.entries(postsByHour)) {
      if (count > bestHourCount) {
        bestHourCount = count
        bestHour = Number(hour)
      }
    }

    return NextResponse.json({
      stats: {
        totalPosts: posts.length,
        totalComments: allComments.length,
        totalLikes: allLikes.length,
      },
      postsByHour: Object.entries(postsByHour).map(([hour, count]) => ({
        hour: Number(hour),
        count,
      })),
      postsByDay: Object.entries(postsByDay).map(([day, count]) => ({ day, count })),
      postsByMonth: Object.entries(postsByMonth).map(([month, count]) => ({ month, count })),
      postsByYear: Object.entries(postsByYear).map(([year, count]) => ({
        year: Number(year),
        count,
      })),
      mostLikedPosts,
      mostCommentedPosts,
      topPosters,
      topCommenters,
      topReplyGivers,
      topCommentLikers,
      mostEngagedPosts,
      bestPostingHour: { hour: bestHour, count: bestHourCount },
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Erro ao carregar dashboard" }, { status: 500 })
  }
}
