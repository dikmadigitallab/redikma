import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

function gerarSenhaPadrao(cpf: string) {
  return cpf.replace(/\D/g, "").slice(0, 6)
}

function gerarUsername(nome: string, cpf: string): string {
  const nomeFormatado = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "")
    .slice(0, 15)

  const ultimosDigitos = cpf.slice(-6)
  const numerosEmbaralhados = ultimosDigitos.split("").sort(() => Math.random() - 0.5).join("")

  return `${nomeFormatado}_${numerosEmbaralhados}`
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = session.user as { role?: string }
    if (user.role !== "SYSTEM_ADM" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const { nome, admissao, cargo, nascimento, cpf } = await req.json()

    if (!nome || !admissao || !cargo || !nascimento || !cpf) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 })
    }

    const cpfLimpo = cpf.replace(/\D/g, "")

    if (cpfLimpo.length !== 11) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { cpf: cpfLimpo },
    })

    if (existingUser) {
      return NextResponse.json({ error: "CPF já cadastrado" }, { status: 409 })
    }

    const senhaPadrao = gerarSenhaPadrao(cpfLimpo)
    const senhaHash = await hash(senhaPadrao, 10)
    const username = gerarUsername(nome, cpfLimpo)

    const newUser = await prisma.user.create({
      data: {
        nome,
        username,
        cpf: cpfLimpo,
        cargo,
        aniversario: new Date(nascimento),
        admissao: new Date(admissao),
        senha_hash: senhaHash,
      },
    })

    return NextResponse.json({
      message: "Usuário cadastrado com sucesso",
      user: {
        id: newUser.id,
        nome: newUser.nome,
        username: newUser.username,
        cpf: newUser.cpf,
      },
      senhaPadrao,
    })
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error)
    return NextResponse.json({ error: "Erro interno ao cadastrar usuário" }, { status: 500 })
  }
}