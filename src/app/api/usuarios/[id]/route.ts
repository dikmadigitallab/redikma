import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

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
  try {
    const body = await req.json()
    const { id, nome, cargo, role, foto, senhaAtual, novaSenha } = body

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
      if (!senhaAtual) {
        return NextResponse.json({ error: "Senha atual é obrigatória para alterar a senha" }, { status: 400 })
      }

      const { compare } = await import("bcryptjs")
      const senhaValida = await compare(senhaAtual, user.senha_hash || "")

      if (!senhaValida) {
        return NextResponse.json({ error: "Senha atual incorreta" }, { status: 401 })
      }

      const senhaPadrao = novaSenha.replace(/\D/g, "").slice(0, 6)
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

export async function DELETE(req: Request) {
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

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Usuário deletado com sucesso",
      user: { id, nome: user.nome },
    })
  } catch (error) {
    console.error("Erro ao deletar usuário:", error)
    return NextResponse.json({ error: "Erro ao deletar usuário" }, { status: 500 })
  }
}