import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!(session?.user.role === "ADMIN" || session?.user.role === "SYSTEM_ADM")) {
    console.log("regra de usuario: ", session?.user.role)
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
 //pegar o id do usuario logado
    const id  = searchParams.get("id")

    if (id) {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          nome: true,
          username: true,
          cpf: true,
          cargo: true,
          role: true,
          foto: true,
          aniversario: true,
          admissao: true,
        },
      })

      if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
      }

      return NextResponse.json(user)
    }

    const busca = searchParams.get("busca")
    const where = busca
      ? {
          OR: [
            { nome: { contains: busca, mode: "insensitive" as const } },
            { username: { contains: busca, mode: "insensitive" as const } },
            { cpf: { contains: busca } },
            { cargo: { contains: busca, mode: "insensitive" as const } },
          ],
        }
      : {}

    const usuarios = await prisma.user.findMany({
      where,
      select: {
        id: true,
        nome: true,
        username: true,
        cpf: true,
        cargo: true,
        role: true,
        foto: true,
        aniversario: true,
        admissao: true,
      },
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(usuarios)
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
  }
}

export async function PUT(req: Request) {

    const session = await getServerSession(authOptions)

  if (!(session?.user.role === "ADMIN" || session?.user.role === "SYSTEM_ADM")) {
    console.log("regra de usuario: ", session?.user.role)
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }


  try {
    const body = await req.json()
    const { id, nome, cargo, role, foto, novaSenha } = body

    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const validRoles = ["SYSTEM_ADM", "ADMIN", "POSTADOR", "COMMON"] as const
    type ValidRole = typeof validRoles[number]

    if (role !== undefined && !validRoles.includes(role as ValidRole)) {
      return NextResponse.json({ error: "Role inválido" }, { status: 400 })
    }

    const roleValue = role as ValidRole | undefined

    const updateData: {
      nome?: string
      cargo?: string
      role?: ValidRole
      foto?: string | null
      senha_hash?: string
    } = {}

    if (nome !== undefined) updateData.nome = nome
    if (cargo !== undefined) updateData.cargo = cargo
    if (roleValue !== undefined) updateData.role = roleValue
    if (foto !== undefined) updateData.foto = foto || null

    if (novaSenha) {
      const senhaPadrao = novaSenha.replace(/\D/g, "").slice(0, 6)

      if (!senhaPadrao) {
        return NextResponse.json({ error: "Nova senha inválida" }, { status: 400 })
      }

      updateData.senha_hash = await hash(senhaPadrao, 10)
    }

    const userAtualizado = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        username: true,
        cpf: true,
        cargo: true,
        role: true,
        foto: true,
        aniversario: true,
        admissao: true,
      },
    })

    return NextResponse.json({
      message: "Usuário atualizado com sucesso",
      user: userAtualizado,
    })
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 })
  }
}

//

/* 
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)

  if (!(session?.user.role === "ADMIN" || session?.user.role === "SYSTEM_ADM")) {
    console.log("regra de usuario: ", session?.user.role)
  return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.like.deleteMany({
        where: { userId: id },
      }),
      prisma.comentario.deleteMany({
        where: { authorId: id },
      }),
      prisma.postagem.deleteMany({
        where: { authorId: id },
      }),
      prisma.user.delete({
        where: { id },
      }),
    ])

    return NextResponse.json({
      message: "Usuário deletado com sucesso",
      user: { id, nome: user.nome },
    })
  } catch (error) {
    console.error("Erro ao deletar usuário:", error)
    return NextResponse.json({ error: "Erro ao deletar usuário" }, { status: 500 })
  }
}

 */
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)

  if (
    !(
      session?.user.role === "ADMIN" ||
      session?.user.role === "SYSTEM_ADM"
    )
  ) {
    return NextResponse.json(
      { error: "Não autorizado" },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    await prisma.$transaction(async (tx) => {
      const posts = await tx.postagem.findMany({
        where: {
          authorId: id,
        },
        select: {
          id: true,
        },
      })

      const postIds = posts.map((post) => post.id)

      const comentarios = await tx.comentario.findMany({
        where: {
          OR: [
            {
              authorId: id,
            },
            {
              postId: {
                in: postIds,
              },
            },
          ],
        },
        select: {
          id: true,
        },
      })

      const comentarioIds = comentarios.map((c) => c.id)

      // likes dos comentários
      if (comentarioIds.length > 0) {
        await tx.like.deleteMany({
          where: {
            comentarioId: {
              in: comentarioIds,
            },
          },
        })
      }

      // likes das postagens
      if (postIds.length > 0) {
        await tx.like.deleteMany({
          where: {
            postId: {
              in: postIds,
            },
          },
        })
      }

      // likes do usuário
      await tx.like.deleteMany({
        where: {
          userId: id,
        },
      })

      // comentários filhos
      if (comentarioIds.length > 0) {
        await tx.comentario.deleteMany({
          where: {
            parentId: {
              in: comentarioIds,
            },
          },
        })
      }

      // comentários principais
      await tx.comentario.deleteMany({
        where: {
          OR: [
            {
              authorId: id,
            },
            {
              postId: {
                in: postIds,
              },
            },
          ],
        },
      })

      // notificações recebidas
      await tx.notification.deleteMany({
        where: {
          userId: id,
        },
      })

      // notificações enviadas
      await tx.notification.deleteMany({
        where: {
          actorId: id,
        },
      })

      // aceitações
      await tx.aceite_cookies.deleteMany({
        where: {
          userId: id,
        },
      })

      await tx.aceite_lgpd.deleteMany({
        where: {
          userId: id,
        },
      })

      await tx.aceite_termos.deleteMany({
        where: {
          userId: id,
        },
      })

      // postagens
      await tx.postagem.deleteMany({
        where: {
          authorId: id,
        },
      })

      // usuário
      await tx.user.delete({
        where: {
          id,
        },
      })
    })

    return NextResponse.json({
      message: "Usuário deletado com sucesso",
      user: {
        id,
        nome: user.nome,
      },
    })
  } catch (error) {
    console.error("Erro ao deletar usuário:", error)

    return NextResponse.json(
      { error: "Erro ao deletar usuário" },
      { status: 500 }
    )
  }
}