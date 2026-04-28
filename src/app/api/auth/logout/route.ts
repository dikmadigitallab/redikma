import NextAuth from "next-auth"

const handler = NextAuth({
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user
      }
      return session
    },
  },
})

export { handler as GET, handler as POST }