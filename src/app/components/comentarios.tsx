"use client"

import { useEffect, useRef, useState } from "react"
import { FaTrash } from "react-icons/fa";

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
  const [isComment, setCommnet] = useState(false)


  const boxRef = useRef<HTMLDivElement>(null)

  //controla abertura e fechamento da caixa de comentarios
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
  //carrega os comentarios

  useEffect(() => {

    if (open) {
      loadComments()
    }
  }, [open, postId])

  //deleta comentario
  async function delComents(id: string) {

    const confirm = window.confirm('Certeza que deseja apagar esse comentario?')

    if (confirm) {


      try {
        const response = await fetch("/api/posts/posts-comments", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });
      
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao deletar comentário");
        }
        loadComments()
        return await response.json();
      } catch (error) {
        console.error("Erro na requisição delete:", error);
        throw error;
      }
      if (!confirm) {
        return
      }
    }
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
            backgroundColor: "var(--background)",
            borderColor: "var(--border)",
          }}
        >
          {loading && (
            <div className="flex items-center gap-2 py-2">
              <div className="w-3 h-3 border-2 border-t-transparent border-primary rounded-full animate-spin" />
              <p className="text-[11px] opacity-60">Carregando...</p>
            </div>
          )}

          {!loading && comments.length === 0 && (
            <p className="text-[11px] opacity-60 text-center py-2">Nenhum comentário por aqui.</p>
          )}

          {comments.map((comment) => (
            <div key={comment.id} className="group flex gap-3 relative border-b border-white/5 last:border-none pb-3 last:pb-0">
              <img
                src={comment.author.foto || "https://i.pravatar.cc/100?img=1"}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-border shadow-sm"
                alt={comment.author.nome}
              />

              <div className="flex flex-col flex-1 min-w-0 pr-6">
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

                <button
                  onClick={() => delComents(comment.id)}
                  className="absolute right-0 top-0 p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-red-500 transition-all duration-200"
                  title="Excluir comentário"
                >
                  <FaTrash size={10}
                    title={'deletar'}
                  />
                </button>
              </div>
            </div>
          ))}

          <div className="absolute -top-1 left-4 w-2 h-2 rotate-45 border-t border-l"
            style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
          />
        </div>
      )}
    </div>
  )
}