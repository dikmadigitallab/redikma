"use client"

import { useEffect, useState } from "react"

type User = {
  nome: string
  username: string
  foto?: string | null
}

type CardUserProps = {
  size?: "sm" | "md" | "lg"
}

export function UserCard({ size = "md" }: CardUserProps) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/autenticar")

        if (!res.ok) return

        const data = await res.json()
        setUser(data)
      } catch (err) {
        console.error(err)
      }
    }

    loadUser()
  }, [])

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  }

  return (
    <div className="flex items-center gap-3">
      
      {/* FOTO */}
      {user?.foto ? (
        <img
          src={user.foto}
          className={`${sizes[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-semibold`}
          style={{ backgroundColor: 'var(--secondary)' }}
        >
          {user?.nome?.charAt(0) || "?"}
        </div>
      )}

      {/* INFO */}
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--black)' }}>
          {user?.nome || "Carregando..."}
        </p>
        <p className="text-xs" style={{ color: 'var(--gray)' }}>
          @{user?.username || "..."}
        </p>
      </div>

    </div>
  )
}
