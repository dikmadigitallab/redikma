import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      nome: string
      username: string
      cpf: string
      cargo: string
      role: string
      foto: string | null
      aniversario: string
      admissao: string
    }
  }

  interface User {
    id: string
    nome: string
    username: string
    cpf: string
    cargo: string
    role: string
    foto: string | null
    aniversario: string
    admissao: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string
      nome: string
      username: string
      cpf: string
      cargo: string
      role: string
      foto: string | null
      aniversario: string
      admissao: string
    }
  }
}