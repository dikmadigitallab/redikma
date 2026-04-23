"use client"

import { useState } from "react"
import { Home, Search, Plus, Video, User, Bell } from "lucide-react"
import { CreatNewPost } from "../components/modal-postagem"
import { useRouter } from "next/navigation"
import { Sidebar } from "../components/sidebar"
import { RightSidebar } from "../components/stories"
import { FeedNoticias } from "../components/feed"
import { Footer } from "../components/footer"
import { Header } from "../components/feedHeader"

export default function Feed() {
  const [openModal, setOpenModal] = useState(false)
  const router = useRouter()

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>

      {/* Header - Sticky */}
      <Header />

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
          <aside className="w-96 overflow-y-auto" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)', borderRadius: '0.75rem' }}>
            <div className="p-6">

              <RightSidebar />
            </div>
          </aside>

        </div>

      </div>

      {/* Footer - Sticky */}
      <Footer />

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
