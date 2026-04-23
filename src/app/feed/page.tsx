"use client"

import { useState } from "react"
import { Home, Search, Plus, Video, User, Bell } from "lucide-react"
import { CreatNewPost } from "../components/modal-postagem"
import { useRouter } from "next/navigation"
import { Sidebar } from "../components/sidebar"
import { RightSidebar } from "../components/stories"
import { FeedNoticias } from "../components/feed"

export default function Feed() {
  const [openModal, setOpenModal] = useState(false)
  const router = useRouter()

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      
      {/* Header - Sticky */}
      <header className="h-16 flex-shrink-0 shadow-sm z-40" style={{ backgroundColor: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        <div className="h-full px-[10%] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg text-white" style={{ backgroundColor: 'var(--primary-dark)' }}>D</div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--primary-dark)' }}>Dikma</h1>
              <p className="text-xs" style={{ color: 'var(--gray)' }}>Rede Social Corporativa</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
              <Search size={16} style={{ color: 'var(--gray)' }} />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="bg-transparent outline-none text-sm w-40"
                style={{ color: 'var(--black)' }}
              />
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition">
              <Bell size={18} style={{ color: 'var(--gray)' }} />
              <span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ backgroundColor: 'var(--warning)' }}>3</span>
            </div>
            <img src="https://i.pravatar.cc/100?img=2" alt="user" className="w-9 h-9 rounded-full cursor-pointer hover:opacity-70 transition" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Left - Não rola */}
        <aside className="w-64 flex-shrink-0 p-6 border-r overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--white)' }}>
          <Sidebar />
        </aside>

        {/* Centro com 10% de margem */}
        <div className="flex-1 flex px-[5%] py-6 gap-6 overflow-hidden">
          
          {/* Feed - Apenas este rola */}
          <main className="flex-1 overflow-y-auto">
            <FeedNoticias />
          </main>

          {/* Stories - Sidebar Direita - com scroll próprio */}
          <aside className="w-96 flex-shrink-0 overflow-y-auto" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)', borderRadius: '0.75rem' }}>
            <div className="p-6">
              <RightSidebar />
            </div>
          </aside>

        </div>

      </div>

      {/* Footer - Sticky */}
      <footer className="flex-shrink-0 shadow-sm" style={{ backgroundColor: 'var(--white)', borderTop: '1px solid var(--border)' }}>
        <div className="px-[10%] py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-6">
            <div>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--black)' }}>Sobre Dikma</h3>
              <p className="text-sm" style={{ color: 'var(--gray)' }}>Plataforma de engajamento corporativo para conectar equipes e fortalecer a cultura organizacional.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--black)' }}>Produto</h3>
              <ul className="text-sm space-y-2" style={{ color: 'var(--gray)' }}>
                <li className="hover:opacity-70 cursor-pointer transition">Recursos</li>
                <li className="hover:opacity-70 cursor-pointer transition">Preços</li>
                <li className="hover:opacity-70 cursor-pointer transition">Segurança</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--black)' }}>Empresa</h3>
              <ul className="text-sm space-y-2" style={{ color: 'var(--gray)' }}>
                <li className="hover:opacity-70 cursor-pointer transition">Blog</li>
                <li className="hover:opacity-70 cursor-pointer transition">Carreira</li>
                <li className="hover:opacity-70 cursor-pointer transition">Contato</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--black)' }}>Legal</h3>
              <ul className="text-sm space-y-2" style={{ color: 'var(--gray)' }}>
                <li className="hover:opacity-70 cursor-pointer transition">Privacidade</li>
                <li className="hover:opacity-70 cursor-pointer transition">Termos de Uso</li>
                <li className="hover:opacity-70 cursor-pointer transition">Cookies</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-xs pt-6" style={{ color: 'var(--gray)', borderTop: '1px solid var(--border)' }}>
            © 2026 Dikma. Todos os direitos reservados. | Versão 1.0.0
          </div>
        </div>
      </footer>

      {/* Bottom nav - Mobile only */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full px-6 py-3 shadow-lg flex justify-between items-center z-50 border" 
        style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border)', width: '80%', maxWidth: '400px' }}>
        <Home size={20} style={{ color: 'var(--gray)' }} className="hover:opacity-70 cursor-pointer transition" />
        <Search size={20} style={{ color: 'var(--gray)' }} className="hover:opacity-70 cursor-pointer transition" />

        <div
          className="w-14 h-10 rounded-full flex items-center justify-center text-white cursor-pointer shadow-md hover:opacity-90 transition"
          style={{ backgroundColor: 'var(--primary-dark)' }}
          onClick={() => {
            if (window.innerWidth >= 1024) {
              setOpenModal(true)
              return
            }
            router.push("/feed/new-post")
          }}
        >
          <Plus size={20} />
        </div>

        <Video size={20} style={{ color: 'var(--gray)' }} className="hover:opacity-70 cursor-pointer transition" />
        <User size={20} style={{ color: 'var(--gray)' }} className="hover:opacity-70 cursor-pointer transition" />
      </div>

      <CreatNewPost
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </div>
  )
}
