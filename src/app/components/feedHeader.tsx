'use client'

import { useState } from "react"
import { Search, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

export function Header() {
  // Invoca o hook useSession e desestrutura a propriedade 'data' como 'session'
  const { data: session } = useSession()
  
  // Acessa o usuário de forma segura através do optional chaining
  // Adicionado 'as any' para evitar erros de tipagem caso o schema do NextAuth esteja básico
  const user = session?.user 

  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <header className="h-14 md:h-16 shrink-0 z-40 w-full" style={{ backgroundColor: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
      <div className="h-full px-4 lg:px-8 flex items-center justify-between w-full mx-auto max-w-7xl">
        
        {/* Logo e Branding */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <div className="w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-lg text-white shrink-0" style={{ backgroundColor: 'var(--primary-dark)' }}>D</div>
          <div className="hidden sm:block">
            <h1 className="text-sm md:text-lg font-bold" style={{ color: 'var(--primary-dark)' }}>ReDikma</h1>
            <p className="text-xs truncate" style={{ color: 'var(--gray)' }}>Comunicando cultura</p>
          </div>
        </div>

        {/* Ações da Direita */}
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          
          {/* Barra de Pesquisa */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
            <Search size={16} style={{ color: 'var(--gray)' }} className="shrink-0" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="bg-transparent outline-none text-sm w-32 lg:w-40"
              style={{ color: 'var(--black)' }}
            />
          </div>

          {/* Notificações */}
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition shrink-0">
            <Bell size={18} style={{ color: 'var(--gray)' }} />
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: 'var(--warning)' }}>3</span>
          </div>

          {/* Menu do Usuário */}
          <div className="relative shrink-0">
            {/* Verifica 'image' (padrão NextAuth) ou 'foto' (seu campo customizado) */}
            {user?.foto || user?.foto ? (
              <img
                src={user?.foto || user?.foto}
                alt="Avatar do usuário"
                onClick={() => setOpen(!open)}
                className="w-9 h-9 rounded-full object-cover cursor-pointer border-2 border-transparent hover:border-gray-300 transition"
              />
            ) : (
              <div 
                onClick={() => setOpen(!open)}
                className="w-9 h-9 rounded-full bg-gray-200 cursor-pointer flex items-center justify-center text-xs font-bold shadow-sm"
              >
                {user?.nome?.charAt(0) || user?.nome?.charAt(0) || 'U'}
              </div>
            )}

            {open && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-2 z-50 animate-in fade-in zoom-in duration-200" style={{ backgroundColor: "var(--white)", border: "1px solid var(--border)" }}>
                <button 
                  onClick={() => { router.push("/intern/profile"); setOpen(false); }} 
                  className="w-full text-left px-4 py-2 text-sm transition hover:bg-gray-100"
                  style={{ color: 'var(--black)' }}
                >
                  Meu perfil
                </button>
                <button 
                  onClick={() => { router.push("/intern/feed"); setOpen(false); }} 
                  className="w-full text-left px-4 py-2 text-sm transition hover:bg-gray-100"
                  style={{ color: 'var(--black)' }}
                >
                  Feed
                </button>
                <div className="h-[1px] my-1" style={{ backgroundColor: 'var(--border)' }} />
                <button 
                  onClick={() => signOut({ callbackUrl: "/login" })} 
                  className="w-full text-left px-4 py-2 text-sm transition hover:bg-red-50 text-red-600 font-medium"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}