"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { RiImageEditFill } from "react-icons/ri"
import Image from "next/image"
import { CommentsBox } from "./comentarios"
import { PostBar } from "./posts-bar"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

type Post = {
  id: string
  label: string
  createdAt: string
  authorId: string
  image: string
  author: {
    id: string
    nome: string
    foto: string
  }
  postador: string
  comentarios: []
}

export function FeedNoticias({ onRefresh }: { onRefresh?: () => void }) {
  const router = useRouter()
  const { data: session } = useSession()
  const user = session?.user

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState<string>("nova postagem...")
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [commentsCount, setCommentsCount] = useState<Record<string, number>>({})
  const [likesCount, setLikesCount] = useState<Record<string, number>>({})
  const [isActive, setIsActive] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    loadPosts()
  }, [pathname, refreshKey])

  async function loadPosts() {
    setLoading(true)
    try {
      const res = await fetch("/api/posts", { cache: 'no-store' })
      const data = await res.json()
      setPosts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleRefresh() {
    setRefreshKey(k => k + 1)
    onRefresh?.()
  }

  //conta os liker
  useEffect(() => {
    async function loadLikesCount() {
      try {
        const counts: Record<string, number> = {}

        await Promise.all(
          posts.map(async (post) => {
            const res = await fetch(`/api/posts/posts-likes?postId=${post.id}`, { cache: 'no-store' })

            if (!res.ok) return

            const data = await res.json()
            counts[post.id] = data.total || 0
          })
        )

        setLikesCount(counts)
      } catch (error) {
        console.error(error)
      }
    }

    if (posts.length > 0) {
      loadLikesCount()
    }
  }, [posts])

  //puxar o status do curtir do banco:
  useEffect(() => {
    async function loadLikes() {
      try {
        const updatedLikes: Record<string, boolean> = {}

        await Promise.all(
          posts.map(async (post) => {
            const res = await fetch(`/api/posts/posts-likes?postId=${post.id}`)

            if (!res.ok) return

            const data = await res.json()

            const userLiked = data.likes.some(
              (like: any) => like.userId === user?.id
            )

            if (userLiked) {
              updatedLikes[post.id] = true
            }
          })
        )

        setLikedPosts(updatedLikes)
      } catch (error) {
        console.error(error)
      }
    }

    if (posts.length > 0 && user) {
      loadLikes()
    }
  }, [posts, user])

  //realiza o curtir
  async function curtir(postId: string) {
    if (!user) return

    const isLiked = likedPosts[postId]

    try {
      const res = await fetch("/api/posts/posts-likes", {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          userId: user.id,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        console.error(err)
        throw new Error("Erro ao curtir")
      }

      // atualiza status do like
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: !isLiked,
      }))

      // atualiza contagem sem precisar refetch
      setLikesCount((prev) => ({
        ...prev,
        [postId]: isLiked
          ? Math.max((prev[postId] || 1) - 1, 0)
          : (prev[postId] || 0) + 1,
      }))
    } catch (error) {
      console.error(error)
    }
  }


  //comentar
 // 1. Mova a lógica de carregar contagem para uma função fora do useEffect para que possa ser reutilizada
async function loadCommentsCount() {
  try {
    const counts: Record<string, number> = {}
    await Promise.all(
      posts.map(async (post) => {
        const res = await fetch(`/api/posts/posts-comments?postId=${post.id}`)
        if (!res.ok) return
        const data = await res.json()
        counts[post.id] = data.length || 0
      })
    )
    setCommentsCount(counts)
  } catch (error) {
    console.error(error)
  }
}

// 2. Chame a função dentro do seu método de comentar
  async function comentar(postId: string) {
    if (!user) return
    const texto = comments[postId]?.trim()
    if (!texto) return

    try {
      const res = await fetch("/api/posts/posts-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, postId, authorId: user.id }),
      })

      if (!res.ok) throw new Error("Erro ao comentar")

      setComments((prev) => ({ ...prev, [postId]: "" }))
      toast.success("Comentário postado!")
      
      loadCommentsCount() 
      
    } catch {
      toast.error("Erro ao postar comentário")
    }
  }

// 3. Mantenha o useEffect apenas para o carregamento inicial e o intervalo
useEffect(() => {
  if (!posts.length) return

  loadCommentsCount()
  const interval = setInterval(loadCommentsCount, 30000)

  return () => clearInterval(interval)
}, [posts])
  
  





  return (
    <section className="w-full space-y-4 md:space-y-6 max-w-3xl">

    
      <PostBar onCreated={handleRefresh} onRefresh={handleRefresh} />


      {loading && (
        <p className="text-sm" style={{ color: "var(--gray)" }}>
          Carregando posts...
        </p>
      )}

      {posts.map((post) => {
        const liked = likedPosts[post.id] || false

        return (
          <div
            key={post.id}
            className="rounded-lg md:rounded-xl shadow-sm p-3 md:p-4 space-y-3"
            style={{ backgroundColor: "var(--white)", border: "1px solid var(--border)" }}
          >
            <div
              className="flex items-center gap-2 md:gap-3"
              style={{ paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}
            >
              <img
                src={post.author.foto}
                alt="user"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover object-center flex-shrink-0 border border-gray-200"
              />

              <div className="min-w-0 flex flex-col leading-tight">
                <p
                  className="text-sm md:text-base font-semibold truncate"
                  style={{ color: "var(--black)" }}
                >
                  {post.author.nome}
                </p>

                <p
                  className="text-xs truncate opacity-50"
                  style={{ color: "var(--gray)" }}
                >
                  {post.postador}
                </p>

                <p
                  className="text-[10px] md:text-xs opacity-70"
                  style={{ color: "var(--gray)" }}
                >
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <p className="text-sm" style={{ color: "var(--black)" }}>
              {post.label}
            </p>

              {post.image && (
            <div className="p-4 bg-gray-200 rounded-lg border border-[#6bc28c3f]">
                <img
                  src={post.image}
                  className="w-full max-h-[300px] md:max-h-[500px] object-center rounded-lg md:rounded-xl"
                  alt="Post image"
                />
            </div>
              )}
            <div
              className="flex items-center justify-between text-xs md:text-sm gap-3"
              style={{
                color: "var(--gray)",
                paddingTop: "0.75rem",
                borderTop: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-2">
                <Image
                  src="/icons/like.png"
                  alt="likes"
                  width={16}
                  height={16}
                  className="opacity-60"
                />
                <span className="font-medium" style={{ color: "var(--black)" }}>
                  {likesCount[post.id] || 0}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => curtir(post.id)}
                  className="flex items-center gap-1 md:gap-2 transition hover:opacity-70"
                >
                  <Image
                    src="/icons/like.png"
                    alt="reação"
                    width={20}
                    height={20}
                    className={`transition-all duration-300 w-4 h-4 md:w-5 md:h-5 ${liked ? "opacity-100 scale-110" : "opacity-50"
                      }`}
                  />
                  <span
                    className={`transition-all duration-300 ${liked ? "font-semibold" : ""
                      }`}
                    style={{ color: liked ? "var(--warning)" : "var(--gray)" }}
                  >
                    {liked ? "curtido" : "curtir"}
                  </span>
                </button>

                <button
                  type="button"
                  className="flex items-center gap-1 md:gap-2 transition hover:opacity-70"
                >
                  <Image
                    src="/icons/coments.png"
                    alt="comentários"
                    width={20}
                    height={20}
                    className="w-5 h-5 md:w-6 md:h-6 opacity-70"
                  />
                  <span className="hidden sm:inline">{commentsCount[post.id || 0]} comentários</span>
                  <span className="inline-flex items-center justify-center bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full sm:hidden">
                    {commentsCount[post.id] || 0}
                  </span>
                </button>
              </div>
            </div>
            <div
              className="flex items-center gap-2 rounded-lg md:rounded-full px-3 py-2 relative"
              style={{
                backgroundColor: "var(--background)",
                border: `1px solid var(--border)`,
              }}
            >
              <img
                src={user?.foto || "https://i.pravatar.cc/100?img=1"}
                className="w-6 h-6 md:w-7 md:h-7 rounded-full object-cover object-center flex-shrink-0"
                alt={user?.username || "comentador"}
              />

              <input
                value={comments[post.id] || ""}
                maxLength={50}
                onChange={(e) =>
                  setComments((prev) => ({
                    ...prev,
                    [post.id]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  const value = comments[post.id] || ""
                  if (e.key === "Enter" && !e.shiftKey && value.trim() !== "") {
                    comentar(post.id)
                  }
                }}
                placeholder="Comentar..."
                className="bg-transparent outline-none text-xs md:text-sm w-full pr-10"
                style={{ color: "var(--black)" }}
              />

              {(comments[post.id] || "").trim() !== "" && (
                <button
                  className="absolute right-2 p-2 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--primary)" }}
                  onClick={() => comentar(post.id)}
                >
                  <img src="/icons/enviar.png" alt="enviar" className="w-5 h-5" />
                </button>
              )}

            </div>

            <CommentsBox
              postId={post.id}
            />
          </div>
        )
      })}
    </section>
  )
}