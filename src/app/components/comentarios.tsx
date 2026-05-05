"use client"

import { useEffect, useRef, useState } from "react"
import { FaTrash } from "react-icons/fa"
import { Heart, Reply, Send } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

type Comment = {
  id: string
  texto: string
  createdAt: string
  parentId: string | null
  author: {
    id: string
    nome: string
    foto?: string | null
  }
  likes?: { userId: string }[]
  _count?: { likes: number }
}

type Props = {
  postId: string
}

export function CommentsBox({ postId }: Props) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const { data: session } = useSession()
  const user = session?.user

  const boxRef = useRef<HTMLDivElement>(null)
  const isFetching = useRef(false)


  //controla clique fora do box
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      loadComments()
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  //carrega os comentários
  async function loadComments() {
    if (isFetching.current) return
    isFetching.current = true

    try {
      setLoading(true)

      const res = await fetch(`/api/posts/posts-comments?postId=${postId}`, {
        cache: "no-store",
      })

      if (!res.ok) return

      const data = await res.json()
      setComments(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }

  //recarrega os comentários quando o postId mudar
  useEffect(() => {
    const t = setTimeout(() => {
      loadComments()
    }, 0)

    return () => clearTimeout(t)
  }, [postId])

  //deleta comentário
  async function delComents(id: string) {
    try {
      await fetch("/api/posts/posts-comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      await loadComments()
      toast.success("Comentário deletado")
    } catch {
      toast.error("Erro ao deletar comentário")
    }
  }

  //curtir comentário
  async function likeComment(commentId: string) {
    if (!user?.id) return

    setComments(prev =>
      prev.map(c => {
        if (c.id !== commentId) return c

        const alreadyLiked = c.likes?.some(l => l.userId === user.id)

        const updatedLikes = alreadyLiked
          ? (c.likes?.filter(l => l.userId !== user.id) || [])
          : [...(c.likes || []), { userId: user.id }]

        return {
          ...c,
          likes: updatedLikes,
          _count: {
            likes: updatedLikes.length,
          },
        }
      })
    )

    try {
      await fetch("/api/posts/comments-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, userId: user.id }),
      })
    } catch {
      toast.error("Erro ao curtir")
    }
  }

  //descurtir comentário
  async function unlikeComment(commentId: string) {
    if (!user?.id) return

    try {
      await fetch("/api/posts/comments-likes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, userId: user.id }),
      })

      await loadComments()
    } catch {
      toast.error("Erro ao remover curtida")
    }
  }

  //responder comentário
  async function submitReply(commentId: string) {
    if (!user?.id || !replyText.trim()) return

    try {
      await fetch("/api/posts/posts-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: replyText,
          postId,
          authorId: user.id,
          parentId: commentId,
        }),
      })

      setReplyText("")
      setReplyingTo(null)

      await loadComments()
      toast.success("Resposta enviada!")
    } catch {
      toast.error("Erro ao enviar resposta")
    }
  }

  //verifica se o usuário curtiu o comentário
  function hasUserLiked(comment: Comment): boolean {
    return comment.likes?.some(like => like.userId === user?.id) || false
  }


  //pega a contagem de curtidas do comentário
  function getLikesCount(comment: Comment): number {
    return comment._count?.likes || comment.likes?.length || 0
  }

  return (
    <div className="w-full relative" ref={boxRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-xs font-medium opacity-70 hover:opacity-100 transition-all flex items-center gap-1.5"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-green-500" : "bg-gray-400"}`} />
        {open ? "Esconder comentários" : "Ver comentários"}
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-xl border p-4 space-y-4 max-h-80 overflow-y-auto z-50 shadow-2xl"
          style={{
            backgroundColor: "var(--white)",
            borderColor: "var(--border)",
          }}
        >
          {loading && (
            <div className="flex items-center gap-2 py-2">
              <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" />
              <p className="text-[11px] opacity-60">Carregando...</p>
            </div>
          )}

          {!loading && comments.length === 0 && (
            <p className="text-[11px] opacity-60 text-center py-2">
              Nenhum comentário por aqui.
            </p>
          )}

          {comments
            .filter((c) => !c.parentId)
            .map((comment) => (
              <div key={comment.id} className="group space-y-2 border-b pb-3 last:border-none">
                <div className="flex gap-3">
                  <img
                    src={comment.author.foto || "https://i.pravatar.cc/100?img=1"}
                    className="w-8 h-8 rounded-full object-cover"
                    alt={comment.author.nome}
                  />

                  <div className="flex flex-col flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-[11px]">
                        {comment.author.nome}
                      </span>
                      <span className="opacity-40 text-[9px]">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-[12px] mt-1">{comment.texto}</p>

                    <div className="flex items-center gap-3 mt-1">
                      <button
                        onClick={() =>
                          hasUserLiked(comment)
                            ? unlikeComment(comment.id)
                            : likeComment(comment.id)
                        }
                        className="flex items-center gap-1 text-[10px]"
                      >
                        <Heart
                          size={12}
                          fill={hasUserLiked(comment) ? "#E53935" : "none"}
                          color={hasUserLiked(comment) ? "#E53935" : "currentColor"}
                        />
                        <span>{getLikesCount(comment)}</span>
                      </button>

                      <button
                        onClick={() =>
                          setReplyingTo(
                            replyingTo === comment.id ? null : comment.id
                          )
                        }
                        className="flex items-center gap-1 text-[10px]"
                      >
                        <Reply size={12} />
                        <span>Responder</span>
                      </button>

                      <button
                        onClick={() => delComents(comment.id)}
                        className="ml-auto"
                      >
                        <FaTrash size={10} />
                      </button>
                    </div>
                  </div>
                </div>

                {replyingTo === comment.id && (
                  <div className="flex gap-2 pl-8">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && submitReply(comment.id)
                      }
                      className="flex-1 px-2 py-1 text-[11px] border rounded"
                    />
                    <button onClick={() => submitReply(comment.id)}>
                      <Send size={12} />
                    </button>
                  </div>
                )}

                {comments
                  .filter((r) => r.parentId === comment.id)
                  .map((reply) => (
                    <div key={reply.id} className="pl-8 text-[11px]">
                      {reply.texto}
                    </div>
                  ))}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}