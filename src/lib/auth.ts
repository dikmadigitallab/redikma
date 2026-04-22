import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@//lib/prisma"
import bcrypt from "bcryptjs"


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        cpf: { label: "CPF", type: "text" },
        password: { label: "Senha", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.cpf || !credentials?.password) {
          throw new Error("CPF e senha são obrigatórios")
        }

        // 🔹 Remove máscara do CPF (caso venha formatado)
        const cpf = credentials.cpf.replace(/\D/g, "")

        const user = await prisma.user.findUnique({
          where: { cpf },
        })

        if (!user) {
          throw new Error("Usuário não encontrado")
        }

        // 🔒 Validação de senha
        const senhaValida = await bcrypt.compare(
          credentials.password,
          user.senha_hash
        )

        if (!senhaValida) {
          throw new Error("Senha inválida")
        }

        // 🚫 Bloqueia usuários não ativos (regra de negócio)
        if (user.status !== "ATIVO") {
          throw new Error("Usuário não está ativo")
        }

        // ✅ Retorno seguro (NUNCA incluir senha)
        return {
          id: user.id,
          nome: user.nome_completo,
          cpf: user.cpf,
          foto: user.foto_url ?? null,
          primeiroAcesso: user.primeiro_acesso,
          status: user.status,

          // Campos opcionais
          dataNascimento: user.data_nascimento ?? null,
          dataAdmissao: user.data_admissao ?? null,
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    error: "/login", // redireciona erros pro login
  },

  callbacks: {
    async jwt({ token, user }) {
      // 🔁 Primeiro login
      if (user) {
        token.id = user.id
        token.nome = user.nome
        token.cpf = user.cpf
        token.foto = user.foto
        token.primeiroAcesso = user.primeiroAcesso
        token.status = user.status

        // ⚠️ Datas serializadas
        token.dataNascimento = user.dataNascimento
          ? new Date(user.dataNascimento).toISOString()
          : null

        token.dataAdmissao = user.dataAdmissao
          ? new Date(user.dataAdmissao).toISOString()
          : null
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          nome: token.nome as string,
          cpf: token.cpf as string,
          foto: token.foto as string | null,
          primeiroAcesso: token.primeiroAcesso as boolean,
          status: token.status as string,

          // 🔄 Convertendo de volta se quiser usar como Date depois
          dataNascimento: token.dataNascimento
            ? new Date(token.dataNascimento as string)
            : null,

          dataAdmissao: token.dataAdmissao
            ? new Date(token.dataAdmissao as string)
            : null,
        }
      }

      return session
    },
  },

  // 🔐 Use uma chave forte no .env
  secret: process.env.NEXTAUTH_SECRET,

  // 🔥 Melhor prática em produção
  debug: process.env.NODE_ENV === "development",
}