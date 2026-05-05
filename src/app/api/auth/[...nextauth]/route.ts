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

        if (!user) return null

        let senhaValida = false

        if (user.senha_hash) {
          senhaValida = await compare(credentials.senha, user.senha_hash)
        } else {
          const senhaPadrao = gerarSenhaPadrao(user.cpf)
          senhaValida = credentials.senha === senhaPadrao
        }

        if (!senhaValida) return null

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
          telefone: user.telefone ?? "",
          email: user.email ?? "",
          role: user.role,
          foto: user.foto,
          aniversario: user.aniversario.toISOString(),
          admissao: user.admissao.toISOString(),
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.nome = user.nome
        token.username = user.username
        token.cpf = user.cpf
        token.cargo = user.cargo
        token.telefone = user.telefone
        token.email = user.email
        token.role = user.role
        token.foto = user.foto
        token.aniversario = user.aniversario
        token.admissao = user.admissao
      }

      if (trigger === "update" && session) {
        if (session.email !== undefined) token.email = session.email
        if (session.telefone !== undefined) token.telefone = session.telefone
        if (session.foto !== undefined) token.foto = session.foto
      }

      return token
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        nome: token.nome as string,
        username: token.username as string,
        cpf: token.cpf as string,
        cargo: token.cargo as string,
        telefone: token.telefone as string,
        email: token.email as string,
        role: token.role as string,
        foto: token.foto as string | null,
        aniversario: token.aniversario as string,
        admissao: token.admissao as string,
      }

      return session
    },
  },

  pages: {
    signIn: "/login",
  },

session: {
  strategy: "jwt",
  maxAge: 60 * 60 * 24 * 7,
},
jwt: {
  maxAge: 60 * 60 * 24 * 7,
},
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }