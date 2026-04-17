"use client"

import { useState } from "react"
import { Home, Search, Plus, Video, User } from "lucide-react"
import { CreatNewPost } from "../components/modal-postagem"
import { useRouter } from "next/navigation"

export default function Feed() {
  const [openModal, setOpenModal] = useState(false)
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex justify-center px-4 py-6">

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-6">

        {/* Sidebar esquerda */}
        <aside className="hidden lg:flex flex-col gap-6 bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-teal-400" />
            <div>
              <p className="text-sm font-semibold text-gray-800">Seu nome</p>
              <p className="text-xs text-gray-500">@usuario</p>
            </div>
          </div>

          <nav className="flex flex-col gap-4 text-gray-600">
            <div className="flex items-center gap-3 hover:text-black cursor-pointer">
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
        </aside>

        {/* Feed */}
        <section className="space-y-6">

          {/* Header mobile */}
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-teal-400" />

            <div className="flex-1">
              <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm border">
                <Search size={16} className="text-gray-400" />
                <input
                  placeholder="Pesquisar"
                  className="bg-transparent outline-none ml-2 text-sm w-full text-gray-700"
                />
              </div>
            </div>

            <img src="https://i.pravatar.cc/100" className="w-10 h-10 rounded-full" />
          </div>

          {/* Stories */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <h2 className="text-gray-800 font-semibold mb-3">Stories</h2>

            <div className="flex gap-3 overflow-x-auto">
              {[1,2,3,4].map((i) => (
                <div key={i} className="flex flex-col items-center text-xs">
                  <img
                    src={`https://i.pravatar.cc/100?img=${i}`}
                    className="w-14 h-14 rounded-full border-2 border-green-400 p-[2px]"
                  />
                  <span className="mt-1 text-gray-600">User</span>
                </div>
              ))}

              <div className="flex flex-col items-center text-xs">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 to-teal-400 flex items-center justify-center text-white text-xl shadow">
                  +
                </div>
                <span className="mt-1 text-gray-600">Adicionar</span>
              </div>
            </div>
          </div>

          {/* Criar post desktop */}
          <div className="hidden lg:flex items-center gap-3 bg-white rounded-2xl shadow-sm border p-3">
            <img
              src="https://i.pravatar.cc/100"
              className="w-10 h-10 rounded-full"
            />

            <button
              onClick={() => setOpenModal(true)}
              className="flex-1 text-left bg-gray-100 rounded-full px-4 py-2 text-gray-500 hover:bg-gray-200 transition"
            >
              No que você está pensando?
            </button>
          </div>

          {/* Post */}
          <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/100?img=5" className="w-10 h-10 rounded-full"/>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Beatriz</p>
                  <p className="text-xs text-gray-400">2 h</p>
                </div>
              </div>
              <span className="text-gray-400 cursor-pointer">•••</span>
            </div>

            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
              className="w-full h-64 object-cover rounded-xl"
            />

            <div className="flex justify-between text-sm text-gray-600">
              <span>875 reações</span>
              <span>34 comentários</span>
              <span>8 compartilhamentos</span>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
              <img src="https://i.pravatar.cc/100?img=1" className="w-7 h-7 rounded-full"/>
              <input
                placeholder="Escreva um comentário..."
                className="bg-transparent outline-none text-sm w-full text-gray-700"
              />
            </div>
          </div>

        </section>

        {/* Sidebar direita */}
        <aside className="hidden lg:block space-y-6">
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border">
            <h2 className="text-gray-800 font-semibold mb-3">
              Sugestões para você
            </h2>

            <div className="space-y-3">
              {[1,2,3,4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <img
                    src={`https://i.pravatar.cc/100?img=${i+6}`}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">User</p>
                    <p className="text-xs text-gray-400">@user</p>
                  </div>
                  <button className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full transition">
                    Conectar
                  </button>
                </div>
              ))}
            </div>

          </div>

        </aside>

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