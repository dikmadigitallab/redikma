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
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex justify-center px-4 py-6">

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-6">


       <Sidebar/>
        {/* Feed */}
          <FeedNoticias/>
        {/* Sidebar direita */}
       <RightSidebar/>

      </div>

      {/* Bottom nav mobile */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white rounded-full px-6 py-3 shadow-lg flex justify-between items-center lg:hidden border">
        <Home size={20} className="text-gray-500" />
        <Search size={20} className="text-gray-500" />

        <div
          className="w-14 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-teal-400 flex items-center justify-center text-white cursor-pointer shadow-md"
          onClick={() => router.push("/feed/new-post")}
        >
          <Plus size={20} />
        </div>

        <Video size={20} className="text-gray-500" />
        <User size={20} className="text-gray-500" />
      </div>

      {/* Modal */}
      <CreatNewPost
        open={openModal}
        onClose={() => setOpenModal(false)}
      />

    </main>
  )
}