"use client"

import { Users, UserPlus, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"


export function AdminSidebar() {
  const router = useRouter()

async function handleLogout() {
  await signOut({ callbackUrl: "/login" })
}

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-[var(--border)] flex flex-col gap-6 p-4 z-40"
      style={{
        borderTop: "3px solid var(--primary)"
      }}
    >
      <nav
        className="flex-1 flex flex-col gap-2 pt-4"
      >
        <div
          onClick={() => router.push("/admin/usuarios")}
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:opacity-70 cursor-pointer group"
          style={{ color: 'var(--gray)' }}
        >
          <div 
            className="transition-colors"
            style={{ color: 'var(--primary)' }}
          >
            <Users size={18} />
          </div>
          <span className="text-sm font-medium">Usuários</span>
        </div>
        <div
          onClick={() => router.push("/admin/cadastro")}
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:opacity-70 cursor-pointer group"
          style={{ color: 'var(--gray)' }}
        >
          <div 
            className="transition-colors"
            style={{ color: 'var(--primary)' }}
          >
            <UserPlus size={18} />
          </div>
          <span className="text-sm font-medium">Cadastrar</span>
        </div>
      </nav>
    </aside>
  )
}
