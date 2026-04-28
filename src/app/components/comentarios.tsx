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

type Reply = {
  id: string
  texto: string
  createdAt: string
  author: {
    id: string
    nome: string
    foto?: string | null
  }
  parentId: string | null
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
  const commentsCache = useRef<Record<string, Comment[]>>({})

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  async function loadComments() {
    try {
      setLoading(true)

      const cached = commentsCache.current[postId]
      if (cached) {
        setComments(cached)
        setLoading(false)
      }

      const res = await fetch(`/api/posts/posts-comments?postId=${postId}`, {
        cache: 'no-store',
      })
      if (!res.ok) return

      const data = await res.json()
      commentsCache.current[postId] = data || []
      setComments(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const stored = sessionStorage.getItem(`comments-${postId}`)
    if (stored) {
      setComments(JSON.parse(stored))
    }
    loadComments()
  }, [postId])

  useEffect(() => {
    if (comments.length > 0) {
      sessionStorage.setItem(`comments-${postId}`, JSON.stringify(comments))
    }
  }, [comments, postId])

  async function delComents(id: string) {
    toast.promise(
      fetch("/api/posts/posts-comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).then(res => {
        if (!res.ok) throw new Error("Erro ao deletar")
        loadComments()
        return res.json()
      }),
      {
        success: "Comentário deletado",
        error: "Erro ao deletar comentário",
      }
    )
  }

  async function likeComment(commentId: string) {
    if (!user?.id) return

    try {
      await fetch("/api/posts/comments-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: 'no-store',
        body: JSON.stringify({ commentId, userId: user.id }),
      })
      loadComments()
    } catch {
      toast.error("Erro ao curtir")
    }
  }

  async function unlikeComment(commentId: string) {
    if (!user?.id) return

    try {
      await fetch("/api/posts/comments-likes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        cache: 'no-store',
        body: JSON.stringify({ commentId, userId: user.id }),
      })
      loadComments()
    } catch {
      toast.error("Erro ao remover curtida")
    }
  }

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
      loadComments()
      toast.success("Resposta enviada!")
    } catch {
      toast.error("Erro ao enviar resposta")
    }
  }

  function hasUserLiked(comment: Comment): boolean {
    return comment.likes?.some(like => like.userId === user?.id) || false
  }

  function getLikesCount(comment: Comment): number {
    return comment._count?.likes || comment.likes?.length || 0
  }

  return (
    <div className="w-full relative" ref={boxRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-xs font-medium opacity-70 hover:opacity-100 transition-all flex items-center gap-1.5"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${open ? 'bg-green-500' : 'bg-gray-400'}`} />
        {open ? "Esconder comentários" : "Ver comentários"}
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-xl border p-4 space-y-4 max-h-80 overflow-y-auto z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          style={{
            backgroundColor: "var(--white)",
            borderColor: "var(--border)",
          }}
        >
          {loading && (
            <div className="flex items-center gap-2 py-2">
              <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--primary-dark)" }} />
              <p className="text-[11px] opacity-60">Carregando...</p>
            </div>
          )}

          {!loading && comments.length === 0 && (
            <p className="text-[11px] opacity-60 text-center py-2">Nenhum comentário por aqui.</p>
          )}

          {comments.filter(c => !c.parentId).map((comment) => (
            <div key={comment.id} className="group space-y-2 border-b border-gray-100 last:border-none pb-3 last:pb-0">
              <div className="flex gap-3 relative">
                <img
                  src={comment.author.foto || "https://i.pravatar.cc/100?img=1"}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 shadow-sm"
                  alt={comment.author.nome}
                />

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-[11px] truncate">
                      {comment.author.nome}
                    </span>
                    <span className="opacity-40 text-[9px] whitespace-nowrap">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-[12px] opacity-90 leading-relaxed break-words mt-0.5">
                    {comment.texto}
                  </p>

                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => hasUserLiked(comment) ? unlikeComment(comment.id) : likeComment(comment.id)}
                      className="flex items-center gap-1 text-[10px] transition hover:scale-105"
                      style={{ color: hasUserLiked(comment) ? "#E53935" : "var(--gray)" }}
                    >
                      <Heart size={12} fill={hasUserLiked(comment) ? "#E53935" : "none"} />
                      <span>{getLikesCount(comment)}</span>
                    </button>

                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="flex items-center gap-1 text-[10px] opacity-60 hover:opacity-100 transition"
                      style={{ color: "var(--gray)" }}
                    >
                      <Reply size={12} />
                      <span>Responder</span>
                    </button>

                    <button
                      onClick={() => delComents(comment.id)}
                      className="ml-auto p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all duration-200"
                      title="Excluir comentário"
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
                    onKeyDown={(e) => e.key === "Enter" && submitReply(comment.id)}
                    placeholder="Escreva uma resposta..."
                    className="flex-1 px-3 py-1.5 text-[11px] rounded-lg outline-none"
                    style={{ 
                      backgroundColor: "var(--background)", 
                      border: "1px solid var(--border)",
                      color: "var(--black)"
                    }}
                  />
                  <button
                    onClick={() => submitReply(comment.id)}
                    disabled={!replyText.trim()}
                    className="p-1.5 rounded-lg disabled:opacity-50 transition"
                    style={{ backgroundColor: "var(--primary-dark)" }}
                  >
                    <Send size={12} color="white" />
                  </button>
                </div>
              )}

              {comments.filter(r => r.parentId === comment.id).map((reply) => (
                <div key={reply.id} className="flex gap-2 pl-8 pt-2 border-l-2 border-gray-100 ml-3">
                  <img
                    src={reply.author.foto || "https://i.pravatar.cc/100?img=1"}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-gray-200 shadow-sm"
                    alt={reply.author.nome}
                  />

                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-[10px] opacity-80 truncate">
                        {reply.author.nome}
                      </span>
                      <span className="opacity-30 text-[8px] whitespace-nowrap">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-[11px] opacity-70 leading-relaxed break-words mt-0.5">
                      {reply.texto}
                    </p>

                    <div className="flex items-center gap-3 mt-0.5">
                      <button
                        onClick={() => hasUserLiked(reply) ? unlikeComment(reply.id) : likeComment(reply.id)}
                        className="flex items-center gap-1 text-[10px] transition hover:scale-105"
                        style={{ color: hasUserLiked(reply) ? "#E53935" : "var(--gray)" }}
                      >
                        <Heart size={11} fill={hasUserLiked(reply) ? "#E53935" : "none"} />
                        <span className="opacity-70">{getLikesCount(reply)}</span>
                      </button>

                      <button
                        onClick={() => delComents(reply.id)}
                        className="ml-auto p-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all duration-200"
                        title="Excluir resposta"
                      >
                        <FaTrash size={9} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="absolute -top-1 left-4 w-2 h-2 rotate-45"
            style={{ backgroundColor: "var(--white)", borderTop: "1px solid var(--border)", borderLeft: "1px solid var(--border)" }}
          />
        </div>
      )}
    </div>
  )
}