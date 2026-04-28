import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadImage } from "@/lib/uploads"


export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const label = formData.get("label") as string
    const authorId = formData.get("authorId") as string
    const postador = formData.get("postador") as string
    const duration = formData.get("duration") as string
    const imageFile = formData.get("image")

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

    if (user.role !== "COMMON") { //no futuro sometne postador
      return NextResponse.json(
        { error: "Sem permissão para postar" },
        { status: 403 }
      )
    }

    let imageUrl: string | null = null

    if (imageFile && imageFile instanceof File) {
      imageUrl = await uploadImage(imageFile, "Postagens")
    }

    const postagem = await prisma.postagem.create({
      data: {
        label,
        authorId,
        duration: duration ?? "",
        image: imageUrl,
        video: null,
        postador,
        publicado: true,
      },
    })

    return NextResponse.json(postagem, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao criar postagem" },
      { status: 500 }
    )
  }
}



  export async function GET() {
  try {
    const postagens = await prisma.postagem.findMany({
      orderBy: {
        createdAt: "desc"
      },
      include: {
        author: {
          select: {
            id: true,
            nome: true,
            foto: true
          }
        }
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