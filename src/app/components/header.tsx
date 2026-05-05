"use client"

import { LogOut, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { UserCard } from "./cardUser"

export function Header() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/autenticar/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <header className="fixed top-0 left-64 right-0 h-16 flex items-center justify-between px-6 bg-white border-b border-[var(--border)] z-50">
      <span className="text-lg font-semibold text-[var(--primary)]">ReDikma</span>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:opacity-70 transition">
          <Bell size={18} className="text-[var(--gray)]" />
        </button>
        <UserCard size="sm" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--warning)] hover:opacity-70 transition"
        >
          <LogOut size={16} /> Sair
        </button>
      </div>
    </header>
  )
}
