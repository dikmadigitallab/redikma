import { prisma } from "./prisma"

export async function addLike({
  postId,
  userId,
  comentarioId,
}: {
  postId: string
  userId: string
  comentarioId?: string
}) {
  if (!postId || !userId) {
    throw new Error("Dados obrigatórios não informados")
  }

  if (comentarioId) {
    const existing = await prisma.like.findFirst({
      where: {
        comentarioId,
        userId,
      },
    })

    if (existing) {
      return existing
    }

    return prisma.like.create({
      data: {
        postId,
        userId,
        comentarioId,
      },
    })
  }

  const existing = await prisma.like.findFirst({
    where: {
      postId,
      userId,
    },
  })

  if (existing) {
    return existing
  }

  return prisma.like.create({
    data: {
      postId,
      userId,
    },
  })
}