import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      nome: string
      cpf: string
      foto?: string | null
      primeiroAcesso: boolean
      status: string
      dataNascimento?: Date | null
      dataAdmissao?: Date | null
      roleId: string
      cargoId: string
    }
  }

  interface User {
    id: string
    cpf: string
    nome: string
    email_recuperacao?: string | null
    telefone?: string | null
    senha_hash: string
    foto_url?: string | null
    data_nascimento: Date
    data_admissao: Date
    primeiro_acesso: boolean
    status: string
    data_exclusao_programada?: Date | null

    role_id: string
    cargo_id: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    nome: string
    cpf: string
    foto?: string | null
    primeiroAcesso: boolean
    status: string
    dataNascimento?: string | null
    dataAdmissao?: string | null
    roleId: string
    cargoId: string
  }
}