import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { compare, hash } from "bcryptjs"

function limparCPF(cpf: string) {
  return cpf.replace(/\D/g, "")
}

function gerarSenhaPadrao(cpf: string) {
  return cpf.replace(/\D/g, "").slice(0, 6)
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        cpf: { label: "CPF", type: "text" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.cpf || !credentials?.senha) {
          return null
        }

        const cpfLimpo = limparCPF(credentials.cpf)

        const user = await prisma.user.findUnique({
          where: { cpf: cpfLimpo },
        })

        if (!user) {
          return null
        }

        let senhaValida = false

        if (user.senha_hash) {
          senhaValida = await compare(credentials.senha, user.senha_hash)
        } else {
          const senhaPadrao = gerarSenhaPadrao(user.cpf)
          senhaValida = credentials.senha === senhaPadrao
        }

        if (!senhaValida) {
          return null
        }

        if (!user.senha_hash) {
          const senhaPadrao = gerarSenhaPadrao(user.cpf)
          const senhaHash = await hash(senhaPadrao, 10)
          await prisma.user.update({
            where: { id: user.id },
            data: { senha_hash: senhaHash },
          })
        }

        return {
          id: user.id,
          nome: user.nome,
          username: user.username,
          cpf: user.cpf,
          cargo: user.cargo,
          role: user.role,
          foto: user.foto,
          aniversario: user.aniversario.toISOString(),
          admissao: user.admissao.toISOString(),
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user
      }
      return token
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as typeof session.user & {
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
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }