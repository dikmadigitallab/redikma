"use client"

import { useSession } from "next-auth/react"

type CardUserProps = {
  size?: "sm" | "md" | "lg"
}

export function UserCard({ size = "md" }: CardUserProps) {
  const { data: session } = useSession()

  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  }

  const user = session?.user

  return (
    <div className="flex items-center gap-3">
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