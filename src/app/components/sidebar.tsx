"use client"

import { Home, Search, Video, User, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { UserCard } from "./cardUser"



export function Sidebar() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/autenticar/logout", {
      method: "POST",
    })

    router.push("/login")
  }

  return (
    <div className="hidden lg:flex flex-col gap-6 h-full">
      
      {/* Usuário */}
      <UserCard/>

      {/* Menu */}
      <nav className="flex-1 flex flex-col gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
        
        <div 
          onClick={() => router.push("/feed")}
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:opacity-70 cursor-pointer"
          style={{ color: 'var(--gray)' }}
        >
          <Home size={18}/> 
          <span className="text-sm font-medium">Início</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:opacity-70 cursor-pointer" style={{ color: 'var(--gray)' }}>
          <Search size={18}/> 
          <span className="text-sm font-medium">Buscar</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:opacity-70 cursor-pointer" style={{ color: 'var(--gray)' }}>
          <Video size={18}/> 
          <span className="text-sm font-medium">Vídeos</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:opacity-70 cursor-pointer" style={{ color: 'var(--gray)' }}>
          <User size={18}/> 
          <span className="text-sm font-medium">Perfil</span>
        </div>

      </nav>

      {/* Logout */}
      <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:opacity-70 cursor-pointer w-full text-sm font-medium"
          style={{ color: 'var(--warning)' }}
        >
          <LogOut size={18}/> Sair
        </button>
      </div>

    </div>
  )
}
