"use client"

import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { RiImageEditFill } from "react-icons/ri"
import Image from "next/image"

type Post = {
  id: string
  label: string
  createdAt: string
  authorId: string
  image:string
  author: {
    id: string
    nome: string
    foto: string
  }
  postador: string
}

type User = {
  nome: string
  username: string
  foto?: string | null
}

export function FeedNoticias() {
  const router = useRouter()

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState<string>("nova postagem...")
  const [user, setUser] = useState<User | null>(null)
  const [liked, setLiked] = useState<boolean>(false)

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch("/api/posts")
        const data = await res.json()
        setPosts(data)
        console.log(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

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
    <section className="w-full space-y-4 md:space-y-6 max-w-3xl">

      {/* Criar post */}
      <div className="flex items-center gap-2 md:gap-3 rounded-lg md:rounded-xl shadow-sm p-3 md:p-4" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)' }}>
        <RiImageEditFill className="w-5 md:w-6 h-5 md:h-6 flex-shrink-0" style={{ color: 'var(--secondary)' }} />

        <textarea
          placeholder="No que você está pensando?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-lg md:rounded-full px-3 md:px-4 py-2 resize-none outline-none text-sm min-h-10"
          style={{ backgroundColor: 'var(--background)', color: 'var(--gray)' }}
        />
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-sm" style={{ color: 'var(--gray)' }}>Carregando posts...</p>
      )}

      {/* Posts */}
      {posts.map((post) => (
        <div
          key={post.id}
          className="rounded-lg md:rounded-xl shadow-sm p-3 md:p-4 space-y-3"
          style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)' }}
        >

          {/* Header post */}
          <div className="flex items-center gap-2 md:gap-3" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <img
              src={post.author.foto}
              alt="user"
              className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover object-center flex-shrink-0 border border-gray-200"
            />

            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--black)' }}>
                {post.postador}
              </p>

              <p className="text-xs" style={{ color: 'var(--gray)' }}>
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Texto */}
          <p className="text-sm" style={{ color: 'var(--black)' }}>
            {post.label}
          </p>

          {/* Imagem */}
          {post.image && (
            <img
              src={post.image}
              className="w-full max-h-[300px] md:max-h-[500px] object-cover rounded-lg md:rounded-xl"
              alt="Post image"
            />
          )}

          {/* Ações */}
          <div className="flex justify-between text-xs md:text-sm gap-2" style={{ color: 'var(--gray)', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>

            <button
              type="button"
              onClick={() => setLiked(!liked)}
              className="flex items-center gap-1 md:gap-2 transition hover:opacity-70 min-w-fit"
            >
              <Image
                src="/icons/like.png"
                alt="reação"
                width={16}
                height={16}
                className={`transition-all duration-300 w-4 h-4 md:w-5 md:h-5 ${liked ? "opacity-100 scale-110" : "opacity-50"
                  }`}
              />
              <span className={`transition-all duration-300 ${liked ? "font-semibold" : ""
                }`} style={{ color: liked ? 'var(--warning)' : 'var(--gray)' }}>
                {liked ? "curtido" : "reações"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => alert("clicou no ícone")}
              className="flex items-center gap-1 md:gap-2 transition hover:opacity-70 min-w-fit"
            >
              <Image
                src="/icons/coments.png"
                alt="comentários"
                width={16}
                height={16}
                className="w-4 h-4 md:w-5 md:h-5"
              />
              <span className="hidden sm:inline">0 comentários</span>
              <span className="sm:hidden">0</span>
            </button>

          </div>


          {/* Comentário */}
          <div className="flex items-center gap-2 rounded-lg md:rounded-full px-3 py-2" style={{ backgroundColor: 'var(--background)', border: `1px solid var(--border)` }}>
            <img
              src="https://i.pravatar.cc/100?img=1"
              className="w-6 h-6 md:w-7 md:h-7 rounded-full flex-shrink-0"
              alt="comentador"
            />

            <input
              placeholder="Comentar..."
              className="bg-transparent outline-none text-xs md:text-sm w-full"
              style={{ color: 'var(--black)' }}
            />
          </div>

        </div>
      ))}

    </section>
  )
}
