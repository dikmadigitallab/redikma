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

type CommentWithDelete = Comment & {
  deletable: boolean
}

type Props = {
  postId: string
  postAuthorId: string
}

export function CommentsBox({ postId, postAuthorId }: Props) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<CommentWithDelete[]>([])
  const [loading, setLoading] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const { data: session } = useSession()
  const user = session?.user
  const boxRef = useRef<HTMLDivElement>(null)
  const isFetching = useRef(false)

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

      const canDelete: CommentWithDelete[] = (data || []).map((comment: Comment) => {
        const isOwner = comment.author.id === user?.id
        const isPostAuthor = postAuthorId === user?.id
        const isAdmin =
          user?.role === "ADMIN" || user?.role === "SYSTEM_ADM"

        return {
          ...comment,
          deletable: isOwner || isPostAuthor || isAdmin,
        }
      })

      setComments(canDelete)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }

  async function delComents(id: string) {
    try {
      const res = await fetch("/api/posts/posts-comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data?.error || "Erro ao deletar comentário")
        return
      }

      await loadComments()
      toast.success("Comentário deletado")
    } catch (err) {
      console.error(err)
      toast.error("Erro de conexão")
    }
  }

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

  async function unlikeComment(commentId: string) {
    if (!user?.id) return

    setComments(prev =>
      prev.map(c => {
        if (c.id !== commentId) return c
        return {
          ...c,
          likes: c.likes?.filter(l => l.userId !== user.id) || [],
          _count: { likes: Math.max((c._count?.likes || 0) - 1, 0) },
        }
      })
    )

    try {
      await fetch("/api/posts/comments-likes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, userId: user.id }),
      })
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

      await loadComments()
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
      {/* Botão para abrir/fechar comentários */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 text-xs font-semibold transition-opacity hover:opacity-80"
        style={{ color: "var(--gray)" }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: open
              ? "var(--success)"
              : "var(--gray)",
          }}
        />
        {open ? "Esconder comentários" : "Ver comentários"}
      </button>

      {/* Dropdown de comentários */}
      {open && (
        <div
          className="absolute left-0 top-full mt-3 w-80 max-w-[90vw] rounded-2xl border shadow-2xl overflow-hidden z-50"
          style={{
            backgroundColor: "var(--white)",
            borderColor: "var(--border)",
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

          {/* Cabeçalho */}
          <div
            className="px-4 py-3 border-b"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--primary-dark)" }}
            >
              Comentários
            </p>
          </div>

          {/* Conteúdo */}
          <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
            {/* Loading */}
            {loading && (
              <div className="flex items-center gap-3 py-3">
                <div
                  className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: "var(--secondary)" }}
                />
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--gray)" }}
                >
                  Carregando comentários...
                </p>
              </div>
            )}

            {/* Sem comentários */}
            {!loading && comments.length === 0 && (
              <div
                className="rounded-xl px-4 py-6 text-center"
                style={{ backgroundColor: "var(--background)" }}
              >
                <p
                  className="text-xs"
                  style={{ color: "var(--gray)" }}
                >
                  Nenhum comentário por aqui.
                </p>
              </div>
            )}

            {/* Comentários */}
            {comments
              .filter((c) => !c.parentId)
              .map((comment) => (
                <div
                  key={comment.id}
                  className="space-y-3 pb-4 border-b last:border-none"
                  style={{ borderColor: "var(--border)" }}
                >
                  {/* Comentário principal */}
                  <div className="flex gap-3">
                    <img
                      src={
                        comment.author.foto ||
                        "../photoProfile/userDefault.png"
                      }
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      alt={comment.author.nome}
                    />

                    <div className="flex-1 min-w-0">
                      <div
                        className="rounded-2xl px-3 py-2"
                        style={{
                          backgroundColor: "var(--background)",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-[11px] font-semibold truncate"
                            style={{ color: "var(--black)" }}
                          >
                            {comment.author.nome}
                          </span>

                          <span
                            className="text-[9px]"
                            style={{ color: "var(--gray)" }}
                          >
                            {new Date(
                              comment.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </div>

                        <p
                          className="text-xs leading-5 break-words"
                          style={{ color: "var(--black)" }}
                        >
                          {comment.texto}
                        </p>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-4 mt-2 pl-2">
                        <button
                          onClick={() =>
                            hasUserLiked(comment)
                              ? unlikeComment(comment.id)
                              : likeComment(comment.id)
                          }
                          className="flex items-center gap-1 text-[10px] font-medium transition-opacity hover:opacity-80"
                          style={{ color: "var(--gray)" }}
                        >
                          <Heart
                            size={12}
                            fill={
                              hasUserLiked(comment)
                                ? "#E53935"
                                : "none"
                            }
                            color={
                              hasUserLiked(comment)
                                ? "#E53935"
                                : "currentColor"
                            }
                          />
                          <span>{getLikesCount(comment)}</span>
                        </button>

                        <button
                          onClick={() =>
                            setReplyingTo(
                              replyingTo === comment.id
                                ? null
                                : comment.id
                            )
                          }
                          className="flex items-center gap-1 text-[10px] font-medium transition-opacity hover:opacity-80"
                          style={{ color: "var(--gray)" }}
                        >
                          <Reply size={12} />
                          <span>Responder</span>
                        </button>

                        {comment.deletable && (
                          <button
                            onClick={() =>
                              delComents(comment.id)
                            }
                            className="ml-auto transition-opacity hover:opacity-80"
                            style={{ color: "var(--warning)" }}
                          >
                            <FaTrash size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Campo de resposta */}
                  {replyingTo === comment.id && (
                    <div className="flex gap-2 pl-11">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) =>
                          setReplyText(e.target.value)
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          submitReply(comment.id)
                        }
                        placeholder="Escreva uma resposta..."
                        className="flex-1 px-3 py-2 text-xs rounded-xl border outline-none"
                        style={{
                          backgroundColor: "var(--background)",
                          borderColor: "var(--border)",
                          color: "var(--black)",
                        }}
                      />

                      <button
                        onClick={() =>
                          submitReply(comment.id)
                        }
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor:
                            "var(--primary-dark)",
                          color: "var(--white)",
                        }}
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  )}

                  {/* Respostas */}
                  {comments
                    .filter(
                      (reply) =>
                        reply.parentId === comment.id
                    )
                    .map((reply) => (
                      <div
                        key={reply.id}
                        className="pl-11"
                      >
                        <div
                          className="rounded-2xl px-3 py-2"
                          style={{
                            backgroundColor:
                              "rgba(79, 195, 217, 0.06)",
                          }}
                        >
                          <p
                            className="text-[11px] font-semibold mb-1 flex items-center gap-1"
                            style={{
                              color: "var(--primary-dark)",
                            }}
                          >
                            <span className="flex-shrink-0">
                              <img
                                src={reply.author?.foto || "../photoProfile/userDefault.png"}
                                alt={reply.author?.nome || "Usuário"}
                                className="w-4 h-4 rounded-full object-cover border border-neutral-200"
                              />
                            </span>

                            <span className="truncate">
                              {reply.author?.nome || "Usuário"}
                            </span>
                          </p>

                          <p
                            className="text-xs leading-5"
                            style={{
                              color: "var(--black)",
                            }}
                          >
                            {reply.texto}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}