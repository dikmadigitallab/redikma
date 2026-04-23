"use client"

import { useState, useEffect } from "react"
import { Home, Search, Plus, Video, User, Bell } from "lucide-react"
import { CreatNewPost } from "../components/modal-postagem"
import { useRouter } from "next/navigation"
import { Sidebar } from "../components/sidebar"
import { RightSidebar } from "../components/stories"
import { FeedNoticias } from "../components/feed"
import { Footer } from "../components/footer"

type User = {
  nome: string
  username: string
  foto?: string | null
}

export default function Feed() {
  const [openModal, setOpenModal] = useState(false)
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/autenticar")

        if (!res.ok) return

        const data = await res.json()
        setUser(data)
      } catch (err) {
        console.error(err)
      }
    }

    loadUser()
  }, [])



  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>

      {/* Header - Sticky */}
      <header className="h-14 md:h-16 flex-shrink-0 shadow-sm z-40" style={{ backgroundColor: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        <div className="h-full px-4 md:px-[10%] flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 md:w-10 h-8 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-lg text-white" style={{ backgroundColor: 'var(--primary-dark)' }}>D</div>
            <div className="hidden sm:block">
              <h1 className="text-sm md:text-lg font-bold" style={{ color: 'var(--primary-dark)' }}>ReDikma</h1>
              <p className="text-xs" style={{ color: 'var(--gray)' }}>Comunicando cultura</p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}>
              <Search size={16} style={{ color: 'var(--gray)' }} />
              <input
                type="text"
                placeholder="Pesquisar..."
                className="bg-transparent outline-none text-sm w-32 lg:w-40"
                style={{ color: 'var(--black)' }}
              />
            </div>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition">
              <Bell size={18} style={{ color: 'var(--gray)' }} />
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: 'var(--warning)' }}>3</span>
            </div>
            {user?.foto && (
              <img
                src={user?.foto || undefined}
                alt="user"
                className="w-9 h-9 md:hidden rounded-full object-cover object-center cursor-pointer hover:opacity-70 transition"
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar Left - Desktop only */}
        <aside className="hidden lg:flex lg:w-64 flex-shrink-0 p-4 lg:p-6 border-r overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--white)' }}>
          <Sidebar />
        </aside>

        {/* Centro - Responsivo */}
        <div className="flex-1 flex px-4 md:px-[5%] lg:px-[5%] py-4 md:py-6 gap-4 md:gap-6 overflow-hidden">

          {/* Feed - Apenas este rola */}
          <main className="flex-1 overflow-y-auto">
            <FeedNoticias />
          </main>

          {/* Stories - Desktop only, com scroll próprio */}
          <aside className="hidden lg:flex lg:flex-col lg:w-96 flex-shrink-0 overflow-y-auto" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)', borderRadius: '0.75rem' }}>
            <div className="p-6">
              <RightSidebar />
            </div>
          </aside>

        </div>

      </div>

      {/* Footer - Hidden on mobile, compact on tablet */}
      <Footer />
      {/* Bottom nav - Mobile only */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full px-6 py-3 shadow-lg flex justify-between items-center z-50 border gap-4"
        style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border)', width: 'calc(100% - 2rem)', maxWidth: '420px' }}>
        <Home size={18} style={{ color: 'var(--gray)' }} className="hover:opacity-70 cursor-pointer transition flex-shrink-0" />
        <Search size={18} style={{ color: 'var(--gray)' }} className="hover:opacity-70 cursor-pointer transition flex-shrink-0" />

        <div
          className="w-12 h-10 rounded-full flex items-center justify-center text-white cursor-pointer shadow-md hover:opacity-90 transition flex-shrink-0"
          style={{ backgroundColor: 'var(--primary-dark)' }}
          onClick={() => {
            if (window.innerWidth >= 1024) {
              setOpenModal(true)
              return
            }
            router.push("/feed/new-post")
          }}
        >
          <Plus size={18} />
        </div>

        <Video size={18} style={{ color: 'var(--gray)' }} className="hover:opacity-70 cursor-pointer transition flex-shrink-0" />
        <User size={18} style={{ color: 'var(--gray)' }} className="hover:opacity-70 cursor-pointer transition flex-shrink-0" />
      </div>

      <CreatNewPost
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </div>
  )
}
