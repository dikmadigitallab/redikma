"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { CommentsBox } from "./comentarios"
import { PostBar } from "./posts-bar"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { ImageModal } from "./modal-view-photo"
import { PostOptions } from "./postDelete"
import { LikeView } from "./likes-view"
import { containsBadWords } from "@/lib/ofensivas"

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
  const { data: session } = useSession()
  const user = session?.user
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [commentsCount, setCommentsCount] = useState<Record<string, number>>({})
  const [likesCount, setLikesCount] = useState<Record<string, number>>({})
  const [refreshKey, setRefreshKey] = useState(0)
  const pathname = usePathname()
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);


  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState(false)


  type Liker = {
    id: string
    nome: string
    foto: string
  }

  const [listOfLikes, setListOfLikes] = useState<Record<string, Liker[]>>({})

  useEffect(() => {
    async function loadLikers() {
      try {
        const likersMap: Record<string, Liker[]> = {}

        await Promise.all(
          posts.map(async (post) => {
            const res = await fetch(
              `/api/posts/list-likes?postId=${post.id}`,
              { cache: "no-store" }
            )

            if (!res.ok) return

            const data = await res.json()

            // A API retorna { total, likers }
            likersMap[post.id] = data.likers || []
          })
        )

        setListOfLikes(likersMap)
      } catch (error) {
        console.error("Erro ao carregar lista de curtidas:", error)
      }
    }

    if (posts.length > 0) {
      loadLikers()
    }
  }, [posts])

  function handleOpenImage(image: string) {
    setSelectedImage(image)
    setOpenModal(true)
  }

  function handleCloseImage() {
    setOpenModal(false)
    setSelectedImage(null)
  }

  useEffect(() => {
    async function loadPosts() {
      setLoading(true)
      try {
        const res = await fetch("/api/posts", { cache: "no-store" })
        const data = await res.json()

        setPosts(Array.isArray(data) ? data : data?.posts ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadPosts()

  }, [pathname, refreshKey])

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
            const res = await fetch(`/api/posts/posts-likes?postId=${post.id}`, { cache: 'no-store' })

            if (!res.ok) return

            const data = await res.json()

            const userLiked = data.likes.some(
              (like: { userId: string }) => like.userId === user?.id
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
  async function curtir(postId: string, autorPostId: string) {
    if (!user) return;

    const isLiked = likedPosts[postId];

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
      });

      if (!res.ok) {
        const err = await res.json();
        console.error(err);
        throw new Error("Erro ao curtir");
      }

      // atualiza UI
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: !isLiked,
      }));

      setLikesCount((prev) => ({
        ...prev,
        [postId]: isLiked
          ? Math.max((prev[postId] || 1) - 1, 0)
          : (prev[postId] || 0) + 1,
      }));


    } catch (error) {
      console.error(error);
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

    if (containsBadWords(texto)) {
      setComments((prev) => ({
        ...prev,
        [postId]: "",
      }))

      toast.error("Comentário ofensivo não pode ser enviado")
      return
    }

    try {
      const res = await fetch("/api/posts/posts-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto,
          postId,
          authorId: user.id,
        }),
      })

      if (!res.ok) throw new Error("Erro ao comentar")

      setComments((prev) => ({
        ...prev,
        [postId]: "",
      }))

      toast.success("Comentário postado!")

      loadCommentsCount()
    } catch {
      toast.error("Erro ao postar comentário")
    }
  }

  // 3. Mantenha o useEffect apenas para o carregamento inicial e o intervalo
  useEffect(() => {
    if (!posts.length) return

    const run = () => {
      loadCommentsCount()
    }

    const timeout = setTimeout(run, 0)
    const interval = setInterval(run, 30000)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [posts])


  //deletar post
  async function handleDeletePost(postId: string) {
    // Verifica se o usuário está logado antes de tentar deletar
    if (!session?.user?.id) {
      return toast.error("Você precisa estar logado para excluir um post");
    }

    // Confirmação simples para evitar exclusões acidentais
    if (!confirm("Tem certeza que deseja excluir esta postagem?")) return;

    try {
      // Ajuste da URL para usar Query Params conforme esperado pelo seu DELETE:
      // /api/posts?postId=XXX&userId=YYY
      const res = await fetch(`/api/posts?postId=${postId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        // Usa a mensagem de erro vinda do servidor (ex: "Sem permissão")
        throw new Error(data.error || "Erro ao deletar post");
      }

      toast.success("Postagem excluída com sucesso!");
      await handleRefresh();


      // Atualiza o feed após a exclusão

      // ou handleRefresh(), dependendo de como está nomeado no seu componente

    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro de conexão ao excluir post";

      toast.error(message);
    }
  }
  //editar post
  async function handleEditPost(postId: string) {
    toast.info('Em desenvolvimento')
  }

  function renderTextWithLinks(text: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all hover:text-blue-800"
          >
            {part}
          </a>
        )
      }

      return <span key={index}>{part}</span>
    })
  }


  function toggleComments(id: string): void {
    const commentInput = document.getElementById(`comment-input-${id}`)
    if (commentInput instanceof HTMLInputElement) {
      if (document.activeElement === commentInput) {
        commentInput.blur()
      } else {
        commentInput.focus()
        commentInput.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  return (
<section className="w-full max-w-3xl space-y-4 md:space-y-1">
<PostBar onCreated={handleRefresh} onRefresh={handleRefresh} />

{loading && (
  <p
    className="text-sm px-2"
    style={{ color: "var(--gray)" }}
  >
    Carregando posts...
  </p>
)}

{posts.map((post) => {
  const liked = likedPosts[post.id] || false
  const postLikesCount = likesCount[post.id] || 0
  const isTooltipOpen = activeTooltip === post.id

  return (
    <div
      id={`post-${post.id}`}
      key={post.id}
      className="relative rounded-2xl border shadow-sm overflow-visible transition-all duration-500"
      style={{
        backgroundColor: "var(--white)",
        borderColor: "var(--border)",
        boxShadow: "0 4px 16px rgba(10, 69, 84, 0.04)",
      }}
    >
      {/* Barra decorativa superior */}
      <div
        className="h-1 w-full"
        style={{
          background:
            "linear-gradient(90deg, var(--primary-dark) 0%, var(--secondary) 70%, var(--accent) 100%)",
        }}
      />

      {/* Menu de opções */}
      <div className="absolute top-4 right-4 z-20">
        <PostOptions
          postId={post.id}
          onDelete={handleDeletePost}
          onEdit={handleEditPost}
        />
      </div>

      <div className="p-4 md:p-5 space-y-4 overflow-visible">
        {/* Cabeçalho */}
        <div
          className="flex items-start gap-3 pb-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="relative flex-shrink-0">
            <div
              className="absolute -inset-1 rounded-full opacity-15"
              style={{ backgroundColor: "var(--secondary)" }}
            />

            <img
              src={
                post.author.foto ||
                "/photoProfile/userDefault.png"
              }
              alt={post.author.nome}
              className="relative w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2"
              style={{ borderColor: "var(--white)" }}
            />
          </div>

          <div className="flex-1 min-w-0 pr-8">
            <p
              className="text-sm md:text-base font-semibold truncate"
              style={{ color: "var(--black)" }}
            >
              {post.author.nome}
            </p>

            <p
              className="text-xs truncate mt-0.5"
              style={{ color: "var(--gray)" }}
            >
              {post.postador}
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: "var(--success)",
                }}
              />

              <p
                className="text-[11px] font-medium"
                style={{ color: "var(--gray)" }}
              >
                {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Texto */}
        <div className="px-1">
          <div
            className="text-sm leading-7 whitespace-pre-wrap break-words"
            style={{ color: "var(--black)" }}
          >
            {renderTextWithLinks(post.label)}
          </div>
        </div>

        {/* Imagem */}
        {post.image && (
          <div
            className="rounded-2xl overflow-hidden border"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
            }}
          >
            <img
              src={post.image}
              onClick={() =>
                handleOpenImage(post.image)
              }
              className="w-full max-h-[300px] md:max-h-[520px] object-cover cursor-pointer transition-opacity hover:opacity-95"
              alt="Imagem da postagem"
            />
          </div>
        )}

        {/* Área interação */}
        <div
          className="pt-4 border-t space-y-4 overflow-visible"
          style={{ borderColor: "var(--border)" }}
        >
          {/* Botões */}
          <div className="flex items-center gap-6 relative overflow-visible">

            {/* Likes */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  curtir(post.id, post.authorId)

                  setActiveTooltip(
                    isTooltipOpen
                      ? null
                      : post.id
                  )
                }}
                className="flex items-center gap-2 transition-all hover:opacity-80"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    liked ? "scale-105" : ""
                  }`}
                  style={{
                    backgroundColor: liked
                      ? "rgba(255, 0, 85, 0.12)"
                      : "rgba(79, 195, 217, 0.08)",
                  }}
                >
                  <Image
                    src="/icons/like.png"
                    alt="Curtir"
                    width={18}
                    height={18}
                    className={`transition-all duration-300 ${
                      liked
                        ? "opacity-100 scale-110"
                        : "opacity-60"
                    }`}
                  />
                </div>

                <span
                  className="text-sm font-semibold"
                  style={{
                    color: liked
                      ? "var(--warning)"
                      : "var(--gray)",
                  }}
                >
                  {postLikesCount}
                </span>
              </button>

              {/* Tooltip */}
              {isTooltipOpen &&
                postLikesCount > 0 && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() =>
                        setActiveTooltip(null)
                      }
                    />

                    <div className="absolute bottom-full left-0 mb-3 z-20 animate-in fade-in zoom-in-95 duration-200">
                      <div
                        className="relative rounded-2xl border shadow-2xl p-2 min-w-[200px]"
                        style={{
                          backgroundColor:
                            "var(--white)",
                          borderColor:
                            "var(--border)",
                        }}
                      >
                        <LikeView
                          totalLikes={
                            (
                              listOfLikes[
                                post.id
                              ] || []
                            ).length
                          }
                          likers={
                            listOfLikes[
                              post.id
                            ] || []
                          }
                        />

                        <div
                          className="absolute top-full left-4 w-4 h-4 rotate-45 -translate-y-2 border-r border-b"
                          style={{
                            backgroundColor:
                              "var(--white)",
                            borderColor:
                              "var(--border)",
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}
            </div>

            {/* Comentários */}
            <button
              type="button"
              onClick={() =>
                toggleComments(post.id)
              }
              className="flex items-center gap-2 transition-all hover:opacity-80"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor:
                    "rgba(79, 195, 217, 0.08)",
                }}
              >
                <Image
                  src="/icons/coments.png"
                  alt="Comentários"
                  width={18}
                  height={18}
                  className="opacity-70"
                />
              </div>

              <span
                className="text-sm font-semibold"
                style={{
                  color: "var(--gray)",
                }}
              >
                {commentsCount[post.id] || 0}
              </span>
            </button>
          </div>

          {/* Campo comentário */}
          <div
            className="flex items-center gap-3 rounded-full px-3 py-2 border relative"
            style={{
              backgroundColor:
                "var(--background)",
              borderColor: "var(--border)",
            }}
          >
            <img
              src={
                user?.foto ||
                "/photoProfile/userDefault.png"
              }
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              alt="Comentador"
            />

            <input
              id={`comment-input-${post.id}`}
              value={comments[post.id] || ""}
              maxLength={50}
              onChange={(e) =>
                setComments((prev) => ({
                  ...prev,
                  [post.id]:
                    e.target.value,
                }))
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  (
                    comments[
                      post.id
                    ] || ""
                  ).trim() !== ""
                ) {
                  comentar(post.id)
                }
              }}
              placeholder="Escreva um comentário..."
              className="flex-1 bg-transparent outline-none text-sm pr-12"
              style={{
                color: "var(--black)",
              }}
            />

            {(comments[post.id] || "")
              .trim() !== "" && (
                <button
                  type="button"
                  onClick={() =>
                    comentar(post.id)
                  }
                  className="absolute right-2 w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-85"
                  style={{
                    backgroundColor:
                      "var(--primary-dark)",
                  }}
                >
                  <img
                    src="/icons/enviar.png"
                    alt="Enviar"
                    className="w-4 h-4"
                  />
                </button>
              )}
          </div>

          {/* Comentários */}
          <div className="overflow-visible">
            <CommentsBox
              postId={post.id}
              postAuthorId={
                post.author.id
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
})}

<ImageModal
  image={selectedImage}
  open={openModal}
  onClose={handleCloseImage}
/>
</section>
) }
