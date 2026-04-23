"use client"

import { useState } from "react"
import { Home, Search, Plus, Video, User } from "lucide-react"
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
      <header className="h-16 flex-shrink-0 shadow-md z-40" style={{ backgroundColor: 'var(--secondary)' }}>
        <div className="h-full px-[5%] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{ backgroundColor: 'var(--white)', color: 'var(--primary-dark)' }}>D</div>
            <h1 className="text-2xl font-bold text-white">Dikma</h1>
          </div>
          <div className="flex items-center gap-6 text-white">
            <div className="flex items-center gap-2">
              <span className="text-sm">🔔</span>
              <span className="text-sm font-medium">3 notificações</span>
            </div>
            <img src="https://i.pravatar.cc/100?img=1" alt="user" className="w-9 h-9 rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar - Fixed Left */}
        <aside className="w-64 flex-shrink-0 overflow-y-auto p-6 border-r" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--white)' }}>
          <Sidebar />
        </aside>

        {/* Feed - Scrollable Center */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <FeedNoticias />
          </div>
        </main>

        {/* Stories - Fixed Right */}
        <aside className="w-80 flex-shrink-0 overflow-y-auto p-6 border-l" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--white)' }}>
          <RightSidebar />
        </aside>

      </div>

      {/* Footer - Sticky */}
      <footer className="h-14 flex-shrink-0 shadow-md" style={{ backgroundColor: 'var(--secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="h-full px-[5%] flex items-center justify-between">
          <p className="text-sm text-white/80">© 2026 Dikma - Rede Social Corporativa</p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-white/80 hover:text-white transition">Privacidade</a>
            <a href="#" className="text-white/80 hover:text-white transition">Termos</a>
            <a href="#" className="text-white/80 hover:text-white transition">Suporte</a>
          </div>
        </div>
      </footer>

      {/* Bottom nav - Mobile only */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm rounded-full px-6 py-3 shadow-lg flex justify-between items-center z-50 border" 
        style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border)' }}>
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
