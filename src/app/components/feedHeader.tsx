'use client'

import { useState } from "react"
import { Bell, LogOut, User, LayoutGrid, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

export function Header() {
  const { data: session } = useSession()
  const user = session?.user as any 

  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-neutral-100">
      <div className="h-14 px-4 flex items-center justify-between max-w-7xl mx-auto">
        
        {/* Esquerda: Logo simplificada para celular */}
        <div 
          onClick={() => router.push("/intern/feed")}
          className="flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-sm" style={{ backgroundColor: 'var(--primary-dark)' }}>
            D
          </div>
          <h1 className="text-base font-bold tracking-tight text-neutral-800">ReDikma</h1>
        </div>

        {/* Direita: Ações compactas */}
        <div className="flex items-center gap-1 md:gap-4">
          
          {/* Botão de Busca (Apenas ícone no mobile) */}
          <button className="p-2 text-neutral-500 hover:bg-neutral-50 rounded-full transition-colors">
            <Search size={20} />
          </button>

          {/* Notificações com Badge sutil */}
          <button className="relative p-2 text-neutral-500 hover:bg-neutral-50 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
          </button>

          {/* Avatar com Menu */}
          <div className="relative ml-1">
            <button 
              onClick={() => setOpen(!open)}
              className="flex items-center p-0.5 rounded-full active:bg-neutral-100 transition-colors"
            >
              {user?.foto ? (
                <img
                  src={user.foto}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500">
                  {user?.nome?.charAt(0) || 'U'}
                </div>
              )}
            </button>

            {open && (
              <>
                {/* Overlay transparente para fechar ao tocar fora no celular */}
                <div className="fixed inset-0 z-[-1]" onClick={() => setOpen(false)} />
                
                <div className="absolute right-0 mt-3 w-48 rounded-2xl bg-white shadow-xl border border-neutral-100 py-2 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                  <button 
                    onClick={() => { router.push("/intern/profile"); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-600 active:bg-neutral-50"
                  >
                    <User size={18} /> Perfil
                  </button>
                  <button 
                    onClick={() => { router.push("/intern/feed"); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-600 active:bg-neutral-50"
                  >
                    <LayoutGrid size={18} /> Feed
                  </button>
                  <div className="h-px bg-neutral-50 my-1" />
                  <button 
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 font-bold active:bg-red-50"
                  >
                    <LogOut size={18} /> Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}