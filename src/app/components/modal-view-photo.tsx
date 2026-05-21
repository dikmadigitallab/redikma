"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { Heart } from "lucide-react"

type Props = {
  image: string | null
  open: boolean
  onClose: () => void
  postId?: string | null
  authorId?: string | null
}

export function ImageModal({ image, open, onClose, postId, authorId }: Props) {
  const { data: session } = useSession()
  const user = session?.user
  const lastTouchEnd = useRef(0)
  const [heartBurst, setHeartBurst] = useState(false)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }

    if (open) {
      document.addEventListener("keydown", handleKey)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = "auto"
    }
  }, [open, onClose])

  async function curtir() {
    if (!user?.id || !postId || !authorId) return

    try {
      const res = await fetch("/api/posts/posts-likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: user.id }),
      })
      if (!res.ok) return

      setHeartBurst(true)
      setTimeout(() => setHeartBurst(false), 500)
    } catch {}
  }

  if (!open || !image) return null

  return (
<div
  className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6"
  onClick={onClose}
>
  <div
    className="relative w-full max-w-6xl animate-in fade-in zoom-in-95 duration-300"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Container da imagem */}
    <div className="relative overflow-hidden rounded-3xl border shadow-2xl">
      {/* Barra decorativa superior */}
      <div
        className="h-1 w-full"
        style={{
          background:
            "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 70%, var(--accent) 100%)",
        }}
      />

      {/* Imagem */}
      <div
        className="flex items-center justify-center p-2 sm:p-4 relative"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.02)",
          borderColor: "rgba(255, 255, 255, 0.08)",
        }}
      >
        <img
          src={image}
          alt="Visualização da imagem"
          onDoubleClick={() => curtir()}
          onTouchEnd={(e) => {
            if (!postId || !authorId) return
            const now = Date.now()
            if (now - lastTouchEnd.current < 300) {
              e.preventDefault()
              curtir()
              lastTouchEnd.current = 0
            } else {
              lastTouchEnd.current = now
            }
          }}
          className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
        />
        {heartBurst && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="animate-heart-burst">
              <Heart
                size={80}
                className="opacity-90 text-[#EF5C28]"
                fill="#EF5C28"
              />
            </div>
          </div>
        )}
      </div>

      {/* Botão fechar */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.65)",
          color: "var(--white)",
          backdropFilter: "blur(8px)",
        }}
      >
        ✕
      </button>
    </div>

    {/* Legenda inferior */}
    <div className="mt-4 flex justify-center">
      <div
        className="px-4 py-2 rounded-full text-xs sm:text-sm font-medium"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          color: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(8px)",
        }}
      >
        Clique fora da imagem para fechar
      </div>
    </div>
  </div>
</div>
  )
}
