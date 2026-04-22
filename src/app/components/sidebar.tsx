"use client"

import { Home, Search, Video, User, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

export function Sidebar() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/autenticar/logout", {
      method: "POST",
    })

    router.push("/login")
  }

  return (
    <aside className="hidden lg:flex flex-col gap-6 bg-white rounded-2xl p-5 shadow-sm border">
      
      {/* Usuário */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-teal-400" />
        <div>
          <p className="text-sm font-semibold text-gray-800">Seu nome</p>
          <p className="text-xs text-gray-500">@usuario</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-4 text-gray-600">
        
        <div 
          onClick={() => router.push("/feed")}
          className="flex items-center gap-3 hover:text-black cursor-pointer"
        >
          <Home size={18}/> Início
        </div>

        <div className="flex items-center gap-3 hover:text-black cursor-pointer">
          <Search size={18}/> Buscar
        </div>

        <div className="flex items-center gap-3 hover:text-black cursor-pointer">
          <Video size={18}/> Vídeos
        </div>

        <div className="flex items-center gap-3 hover:text-black cursor-pointer">
          <User size={18}/> Perfil
        </div>

      </nav>

      {/* Logout */}
      <div className="mt-auto pt-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-500 hover:text-red-700 transition cursor-pointer"
        >
          <LogOut size={18}/> Sair
        </button>
      </div>

    </aside>
  )
}