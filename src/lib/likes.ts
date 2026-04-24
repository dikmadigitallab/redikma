import { prisma } from "./prisma"


export async function addLike(postId: string, userId: string) {
  if (!postId || !userId) {
    throw new Error("Dados obrigatórios não informados")
  }

  const existing = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
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