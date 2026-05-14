import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { uploadProfileImage } from "@/lib/uploads"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      nome: session.user.nome,
      username: session.user.username,
      cpf: session.user.cpf,
      cargo: session.user.cargo,
      role: session.user.role,
      foto: session.user.foto,
      email: session.user.email,
      telefone: session.user.telefone,
      aniversario: session.user.aniversario,
      admissao: session.user.admissao,
    },
  })
}



/* 
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()

    const dataToUpdate: {
      email?: string
      telefone?: string
      foto?: string
      senha_hash?: string
    } = {}

    if (body.email) dataToUpdate.email = body.email
    if (body.telefone) dataToUpdate.telefone = body.telefone
    if (body.foto) dataToUpdate.foto = body.foto

    if (body.senha) {
      const hash = await bcrypt.hash(body.senha, 10)
      dataToUpdate.senha_hash = hash
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
    })

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
}

 */

/* 
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const formData = await req.formData()

    const email = formData.get("email") as string | null
    const telefone = formData.get("telefone") as string | null
    const senha = formData.get("senha") as string | null
    const file = formData.get("foto") as File | null

    const dataToUpdate: {
      email?: string
      telefone?: string
      foto?: string
      senha_hash?: string
    } = {}

    if (email) dataToUpdate.email = email
    if (telefone) dataToUpdate.telefone = telefone

    if (senha) {
      const hash = await bcrypt.hash(senha, 10)
      dataToUpdate.senha_hash = hash
    }

    if (file && file.size > 0) {
      const url = await uploadProfileImage(
        file,
        session.user.id,
        "profile" // nome do bucket
      )

      dataToUpdate.foto = url
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate,
    })

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 })
  }
} */

  export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const contentType = req.headers.get("content-type") || ""

    let email: string | null = null
    let telefone: string | null = null
    let senha: string | null = null
    let file: File | null = null

    // Se vier multipart/form-data (com foto)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()

      email = formData.get("email") as string | null
      telefone = formData.get("telefone") as string | null
      senha = formData.get("senha") as string | null

      const foto = formData.get("foto")
      if (foto instanceof File && foto.size > 0) {
        file = foto
      }
    } else {
      // Se vier JSON (sem foto)
      const body = await req.json()

      email = body.email || null
      telefone = body.telefone || null
      senha = body.senha || null
    }

    const dataToUpdate: {
      email?: string
      telefone?: string
      foto?: string
      senha_hash?: string
    } = {}

    if (email) {
      dataToUpdate.email = email
    }

    if (telefone) {
      dataToUpdate.telefone = telefone
    }

    if (senha) {
      const hash = await bcrypt.hash(senha, 10)
      dataToUpdate.senha_hash = hash
    }

    if (file) {
      const url = await uploadProfileImage(
        file,
        session.user.id,
        "profile"
      )

      dataToUpdate.foto = url
    }

    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: dataToUpdate,
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao atualizar perfil",
      },
      { status: 500 }
    )
  }
}