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
<div
  className="flex items-center gap-3 p-3 rounded-2xl border shadow-sm"
  style={{
    backgroundColor: "var(--white)",
    borderColor: "var(--border)",
  }}
>
  {/* Avatar */}
  <div className="relative flex-shrink-0">
    <div
      className="absolute -inset-1 rounded-full opacity-20"
      style={{ backgroundColor: "var(--secondary)" }}
    />

    {user?.foto ? (
      <img
        src={user.foto}
        alt={user?.nome || "Usuário"}
        className={`relative ${sizes[size]} rounded-full object-cover border-2`}
        style={{ borderColor: "var(--white)" }}
      />
    ) : (
      <img
        src="../photoProfile/userDefault.png"
        alt="Usuário padrão"
        className={`relative ${sizes[size]} rounded-full object-cover border-2`}
        style={{ borderColor: "var(--white)" }}
      />
    )}
  </div>

  {/* Informações do usuário */}
  <div className="min-w-0 flex-1">
    <p
      className="text-sm font-semibold truncate"
      style={{ color: "var(--black)" }}
    >
      {user?.nome || "Carregando..."}
    </p>

    <p
      className="text-xs truncate mt-0.5"
      style={{ color: "var(--gray)" }}
    >
      @{user?.username || "..."}
    </p>
  </div>
</div>
  )
}