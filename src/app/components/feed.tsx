"use client"

import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

type Post = {
  id: string
  label: string
  image?: string | null
  createdAt: string
  authorId: string, 
  postador:string
}

export function FeedNoticias() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch("/api/posts")
        const data = await res.json()
        setPosts(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  return (
    <section className="w-full xl:max-w-4xl mx-auto space-y-6 px-2 sm:px-4">

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

        <img
          src="https://i.pravatar.cc/100"
          className="w-10 h-10 rounded-full"
        />
      </div>

      {/* Criar post */}
      <div className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border p-3">
        <img
          src="https://i.pravatar.cc/100"
          className="w-10 h-10 rounded-full"
        />

        <button
          onClick={() => router.push("/post/novo")}
          className="flex-1 text-left bg-gray-100 rounded-full px-4 py-2 text-gray-500 hover:bg-gray-200 transition"
        >
          No que você está pensando?
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-sm text-gray-500">Carregando posts...</p>
      )}

      {/* Posts dinâmicos */}
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-2xl shadow-sm border p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={`https://i.pravatar.cc/100?u=${post.authorId}`}
                className="w-10 h-10 rounded-full"
              />

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {post.postador}
                </p>

                <p className="text-xs text-gray-400">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-700">{post.label}</p>

          {post.image && (
            <img
              src={post.image}
              className="w-full max-h-[500px] object-cover rounded-xl"
            />
          )}

          <div className="flex justify-between text-sm text-gray-600">
            <span>0 reações</span>
            <span>0 comentários</span>
            <span>0 compartilhamentos</span>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
            <img
              src="https://i.pravatar.cc/100?img=1"
              className="w-7 h-7 rounded-full"
            />

            <input
              placeholder="Escreva um comentário..."
              className="bg-transparent outline-none text-sm w-full text-gray-700"
            />
          </div>
        </div>
      ))}
    </section>
  )
}