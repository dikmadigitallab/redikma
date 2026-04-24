import { prisma } from "./prisma"

export async function countCommentsByPostId(postId: string) {
  if (!postId) return 0

  const total = await prisma.comentario.count({
    where: {
      postId,
    },
  })

  return total
}