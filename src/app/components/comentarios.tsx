"use client"

import { useEffect, useRef, useState } from "react"

type Comment = {
  id: string
  texto: string
  createdAt: string
  author: {
    id: string
    nome: string
    foto?: string | null
  }
}

type Props = {
  postId: string
}

export function CommentsBox({ postId }: Props) {
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)

  const boxRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    async function loadComments() {
      alert(postId)
      try {
        setLoading(true)

        const res = await fetch(`/api/posts/posts-comments?postId=${postId}`)
        if (!res.ok) return

        const data = await res.json()
        setComments(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      loadComments()
    }
  }, [open, postId])

  return (
    <div className="w-full relative" ref={boxRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-xs opacity-70 hover:opacity-100 transition"
      >
        {open ? "esconder comentários" : "ver comentários"}
      </button>

      {open && (
        <div
          className="absolute left-0 mt-2 w-full rounded-lg border p-3 space-y-3 max-h-60 overflow-y-auto z-50 shadow-lg"
          style={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
          }}
        >
          {loading && (
            <p className="text-xs opacity-60">carregando...</p>
          )}

          {!loading && comments.length === 0 && (
            <p className="text-xs opacity-60">nenhum comentário</p>
          )}

          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <img
                src={comment.author.foto || "https://i.pravatar.cc/100?img=1"}
                className="w-6 h-6 rounded-full object-cover object-center"
                alt="autor"
              />

              <div className="flex flex-col text-xs">
                <span className="font-semibold">
                  {comment.author.nome}
                </span>

                <span className="opacity-80 break-words">
                  {comment.texto}
                </span>

                <span className="opacity-50 text-[10px]">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}