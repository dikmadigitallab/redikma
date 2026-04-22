"use client"

import { useEffect, useState } from "react"
import {
  Home,
  Search,
  Plus,
  Video,
  User,
  Heart,
  MessageCircle,
  Send
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const data = localStorage.getItem("posts")
    if (data) {
      const parsed = JSON.parse(data).map((p: any) => ({
        ...p,
        likes: p.likes || 0,
        comments: p.comments || []
      }))
      setPosts(parsed)
    }
  }, [])

  function handleLike(id: string) {
    const updated = posts.map((p) =>
      p.id === id ? { ...p, likes: p.likes + 1 } : p
    )
    setPosts(updated)
    localStorage.setItem("posts", JSON.stringify(updated))
  }

  function handleComment(id: string, text: string) {
    if (!text) return
    const updated = posts.map((p) =>
      p.id === id
        ? { ...p, comments: [...p.comments, text] }
        : p
    )
    setPosts(updated)
    localStorage.setItem("posts", JSON.stringify(updated))
  }

  return (
    <main className="min-h-screen bg-gray-100 flex justify-center px-4 py-6">

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-6 bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-teal-400" />
            <div>
              <p className="text-sm font-semibold">Seu nome</p>
              <p className="text-xs text-gray-500">@usuario</p>
            </div>
          </div>

          <nav className="flex flex-col gap-4 text-gray-600">
            <div className="flex items-center gap-3 cursor-pointer"><Home size={18}/> Início</div>
            <div className="flex items-center gap-3 cursor-pointer"><Search size={18}/> Buscar</div>
            <div className="flex items-center gap-3 cursor-pointer"><Video size={18}/> Vídeos</div>
            <div className="flex items-center gap-3 cursor-pointer"><User size={18}/> Perfil</div>
          </nav>
        </aside>

        {/* Feed */}
        <section className="space-y-6">

          {/* Criar post */}
          <div className="flex items-center gap-3 bg-white rounded-2xl border p-3">
            <div className="w-10 h-10 rounded-full bg-gray-300" />

            <button
              onClick={() => router.push("/feed/new-post")}
              className="flex-1 text-left bg-gray-100 rounded-full px-4 py-2 text-gray-500"
            >
              No que você está pensando?
            </button>
          </div>

          {/* Posts */}
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border shadow-sm"
            >

              {/* Header */}
              <div className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 rounded-full bg-gray-300" />
                <div>
                  <p className="text-sm font-semibold">Usuário</p>
                  <p className="text-xs text-gray-400">Agora</p>
                </div>
              </div>

              {/* Texto */}
              {post.text && (
                <p className="px-3 text-sm text-gray-800">{post.text}</p>
              )}

              {/* Imagem (somente se existir) */}
              {post.image && (
                <img
                  src={post.image}
                  className="w-full max-h-[500px] object-cover mt-2"
                />
              )}

              {/* Ações */}
              <div className="p-3 space-y-2">

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="transition active:scale-125"
                  >
                    <Heart
                      size={22}
                      className="text-red-500 fill-red-500"
                    />
                  </button>

                  <MessageCircle size={22} />
                  <Send size={22} />
                </div>

                {/* Curtidas visíveis */}
                <p className="text-sm font-semibold">
                  {post.likes} curtidas
                </p>

                {/* Comentários visíveis */}
                <div className="space-y-1 text-sm">
                  {post.comments.map((c: string, i: number) => (
                    <p key={i}>
                      <span className="font-semibold">user</span> {c}
                    </p>
                  ))}
                </div>

                {/* Input comentário */}
                <div className="flex items-center gap-2 border-t pt-2">
                  <input
                    placeholder="Adicione um comentário..."
                    className="w-full outline-none text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleComment(
                          post.id,
                          (e.target as HTMLInputElement).value
                        )
                        ;(e.target as HTMLInputElement).value = ""
                      }
                    }}
                  />
                </div>

              </div>

            </motion.div>
          ))}

        </section>

      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-sm bg-white rounded-full px-6 py-3 shadow-lg flex justify-between items-center lg:hidden border">
        <Home size={20} />
        <Search size={20} />

        <div
          onClick={() => router.push("/feed/new-post")}
          className="w-14 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-teal-400 flex items-center justify-center text-white"
        >
          <Plus size={20} />
        </div>

        <Video size={20} />
        <User size={20} />
      </div>

    </main>
  )
}