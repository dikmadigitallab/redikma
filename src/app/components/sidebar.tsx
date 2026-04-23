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
    <aside className="hidden lg:flex flex-col gap-6 rounded-xl p-6 w-72 shadow-sm" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)' }}>
      
      {/* Usuário */}
      <UserCard/>

      {/* Menu */}
      <nav className="flex flex-col gap-3" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
        
        <div 
          onClick={() => router.push("/feed")}
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:opacity-70 cursor-pointer"
          style={{ color: 'var(--gray)' }}
        >
          <Home size={18}/> 
          <span className="text-sm">Início</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:opacity-70 cursor-pointer" style={{ color: 'var(--gray)' }}>
          <Search size={18}/> 
          <span className="text-sm">Buscar</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:opacity-70 cursor-pointer" style={{ color: 'var(--gray)' }}>
          <Video size={18}/> 
          <span className="text-sm">Vídeos</span>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:opacity-70 cursor-pointer" style={{ color: 'var(--gray)' }}>
          <User size={18}/> 
          <span className="text-sm">Perfil</span>
        </div>

      </nav>

      {/* Logout */}
      <div className="mt-auto pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg transition hover:opacity-70 cursor-pointer w-full text-sm"
          style={{ color: 'var(--warning)' }}
        >
          <LogOut size={18}/> Sair
        </button>
      </div>

    </aside>
  )
}
