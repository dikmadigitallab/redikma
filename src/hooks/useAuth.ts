"use client"

import { signOut, useSession } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    session,
    user: session?.user ?? null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    logout: () => signOut({ callbackUrl: "/login" }),
  }
}