import NextAuth from "next-auth"
import { authOptions } from "@//lib/auth"

// Cria o handler do NextAuth com suas configurações
const handler = NextAuth(authOptions)

/**
 * App Router exige export explícito por método HTTP
 * NextAuth usa GET e POST internamente
 */
export { handler as GET, handler as POST }