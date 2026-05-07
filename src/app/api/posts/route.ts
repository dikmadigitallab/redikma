import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadImage } from "@/lib/uploads"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"


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


    if (user.role !== "POSTADOR" && user.role !== "ADMIN" && user.role !== "SYSTEM_ADM")   { 
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

 // Ajuste o caminho conforme seu projeto



export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const loggedUser = session?.user as { id: string; role: string };

    if (!loggedUser?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

   

    if (!postId) {
      return NextResponse.json({ error: "ID da postagem ausente" }, { status: 400 });
    }

    const postagem = await prisma.postagem.findUnique({
      where: { id: postId },
    });

    if (!postagem) {
      return NextResponse.json({ error: "Postagem não encontrada no banco" }, { status: 404 });
    }

    // Lógica: Se for ADM ou for o DONO, ele pode passar
    const isAdmin = false//loggedUser.role === "ADMIN" || loggedUser.role === "SYSTEM_ADM";
    const isOwner = postagem.authorId === loggedUser.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    // Deleção em cascata manual
    await prisma.$transaction([
      prisma.like.deleteMany({ where: { postId } }),
      prisma.comentario.deleteMany({ where: { postId } }),
      prisma.postagem.delete({ where: { id: postId } }),
    ]);

    return NextResponse.json({ message: "Excluído com sucesso" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}