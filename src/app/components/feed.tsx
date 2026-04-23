"use client"

import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { RiImageEditFill } from "react-icons/ri"
import Image from "next/image"

type Post = {
  id: string
  label: string
  image?: string | null
  createdAt: string
  authorId: string
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
  const [liked,setLiked] = useState<boolean>(false)

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
<section className="w-full mx-auto space-y-6 max-w-3xl">

      {/* Criar post */}
      <div className="flex items-center gap-3 rounded-xl shadow-sm p-4" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)' }}>
        <RiImageEditFill className="w-6 h-6" style={{ color: 'var(--secondary)' }} />

        <textarea
          placeholder="No que você está pensando?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-full px-4 py-2 resize-none outline-none text-sm"
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
          className="rounded-xl shadow-sm p-4 space-y-3"
          style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)' }}
        >

          {/* Header post */}
          <div className="flex items-center gap-3" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <Image
              src="/userdefaut.png"
              alt="user"
              width={40}
              height={40}
              className="rounded-full"
            />

            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--black)' }}>
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
              className="w-full max-h-[500px] object-cover rounded-xl"
            />
          )}

          {/* Ações */}
          <div className="flex justify-between text-sm" style={{ color: 'var(--gray)', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>

            <button
              type="button"
              onClick={() => setLiked(!liked)}
              className="flex items-center gap-2 transition hover:opacity-70"
            >
              <Image
                src="/icons/like.png"
                alt="reação"
                width={20}
                height={20}
                className={`transition-all duration-300 ${liked ? "opacity-100 scale-110" : "opacity-50"
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
              className="flex items-center gap-2 transition hover:opacity-70"
            >
              <Image
                src="/icons/coments.png"
                alt="comentários"
                width={20}
                height={20}
              />
              <span>0 comentários</span>
            </button>

          </div>


          {/* Comentário */}
          <div className="flex items-center gap-2 rounded-full px-3 py-2" style={{ backgroundColor: 'var(--background)', border: `1px solid var(--border)` }}>
            <img
              src="https://i.pravatar.cc/100?img=1"
              className="w-7 h-7 rounded-full"
            />

            <input
              placeholder="Escreva um comentário..."
              className="bg-transparent outline-none text-sm w-full"
              style={{ color: 'var(--black)' }}
            />
          </div>

        </div>
      ))}

    </section>
  )
}
