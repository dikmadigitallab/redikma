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
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex justify-center px-4 py-6 pb-24">

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-6">
        <Sidebar />

        <FeedNoticias />

        <RightSidebar />
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white/80 backdrop-blur-md rounded-full px-6 py-3 shadow-2xl flex justify-between items-center border border-white/20 z-50">
        <Home size={20} className="text-gray-500 hover:text-teal-500 cursor-pointer transition" />
        <Search size={20} className="text-gray-500 hover:text-teal-500 cursor-pointer transition" />

        <div
          className="w-14 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-teal-400 flex items-center justify-center text-white cursor-pointer shadow-md hover:scale-110 transition-transform"
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

        <Video size={20} className="text-gray-500 hover:text-teal-500 cursor-pointer transition" />
        <User size={20} className="text-gray-500 hover:text-teal-500 cursor-pointer transition" />
      </div>

      <CreatNewPost
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </main>
  )
}