import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const loggedUser = session?.user as { id: string; role: string }

    if (!loggedUser?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id } = await params
    const { label } = await req.json()

    if (!label || !label.trim()) {
      return NextResponse.json({ error: "O texto não pode ficar vazio" }, { status: 400 })
    }

    const postagem = await prisma.postagem.findUnique({
      where: { id },
    })

    if (!postagem) {
      return NextResponse.json({ error: "Postagem não encontrada" }, { status: 404 })
    }

    const isAdmin = loggedUser.role === "ADMIN" || loggedUser.role === "SYSTEM_ADM"
    const isOwner = postagem.authorId === loggedUser.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Sem permissão para editar" }, { status: 403 })
    }

    const updated = await prisma.postagem.update({
      where: { id },
      data: { label: label.trim() },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao editar postagem" },
      { status: 500 }
    )
  }
}
