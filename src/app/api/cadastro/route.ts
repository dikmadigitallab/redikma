import { NextResponse } from "next/server"
import { prisma } from "@//lib/prisma"
import bcrypt from "bcryptjs"
import { UserStatus } from "@prisma/client"



function gerarSenha(cpf: string) {
  const cleaned = cpf.replace(/\D/g, "")
  return `Dk@${cleaned.slice(-6)}`
}

export async function POST(req: Request) {

    console.log("DATABASE_URL:", process.env.DATABASE_URL)
  try {
    const body = await req.json()

    const {
      nome,
      cpf,
      dataNascimento,
      dataAdmissao,
      roleId,
      cargoId,
    } = body

    // 🔒 validação
    if (!nome || !cpf || !dataNascimento || !dataAdmissao || !roleId || !cargoId) {
      return NextResponse.json(
        { error: "Dados obrigatórios não enviados" },
        { status: 400 }
      )
    }

    const cpfLimpo = cpf.replace(/\D/g, "")

    // 🔍 verificar duplicidade
    const userExists = await prisma.user.findUnique({
      where: { cpf: cpfLimpo },
    })

    if (userExists) {
      return NextResponse.json(
        { error: "Usuário já cadastrado com esse CPF" },
        { status: 409 }
      )
    }

    // 🔐 senha
    const senhaGerada = gerarSenha(cpfLimpo)
    const senhaHash = await bcrypt.hash(senhaGerada, 10)

    // 💾 create correto
    const user = await prisma.user.create({
      data: {
        nome,
        cpf: cpfLimpo,
        senha_hash: senhaHash,

        data_nascimento: new Date(dataNascimento),
        data_admissao: new Date(dataAdmissao),

        primeiro_acesso: true,
        status: UserStatus.PENDENTE, // usa enum correto

        role_id: roleId,
        cargo_id: cargoId,
      },
    })

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        userId: user.id,
        senhaInicial: senhaGerada,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Erro interno ao criar usuário" },
      { status: 500 }
    )
  }
}