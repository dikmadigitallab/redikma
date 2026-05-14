import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const query = searchParams.get("query") || ""

    if (!query.trim()) {
      return NextResponse.json({
        posts: [],
      })
    }

    const posts = await prisma.postagem.findMany({
      where: {
        OR: [
          {
            label: {
              contains: query,
              mode: "insensitive",
            },
          },

          {
            postador: {
              contains: query,
              mode: "insensitive",
            },
          },

          {
            author: {
              nome: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        ],
      },

      select: {
        id: true,
        image: true,
        label: true,
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 50,
    })

    return NextResponse.json({
      posts,
    })
  } catch (error) {
    console.log(error)

    return NextResponse.json(
      {
        error: "Erro ao buscar posts",
      },
      {
        status: 500,
      }
    )
  }
}