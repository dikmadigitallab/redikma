"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type DurationType = "1h" | "6h" | "12h" | "24h" | "7d" | "30d"

type Props = {
  onRefresh?: () => void
}

export default function CreatePostPage({ onRefresh }: Props) {
  const [text, setText] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [duration, setDuration] = useState<DurationType>("24h")
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user

  function handleImageChange(file: File | null) {
    setImage(file)

    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

async function handleSubmit() {
    if (!user?.id) {
      toast.error("Usuário não identificado")
      return
    }

    if (!text && !image) {
      toast.warning("Adicione texto ou imagem para postar")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()

      formData.append("label", text)
      formData.append("authorId", user.id)
      formData.append("duration", isFixed ? "" : duration)
      formData.append("postador", user.username)

      if (image) {
        formData.append("image", image)
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Erro ao criar postagem")
        return
      }

      toast.success("Post criado com sucesso!")
      router.push("/feed")
    } catch {
      toast.error("Erro ao criar postagem")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>

      {/* Header */}
      <header className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm" style={{ backgroundColor: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => window.history.back()}
          className="text-xs md:text-sm font-medium transition hover:opacity-70"
          style={{ color: 'var(--primary-dark)' }}
        >
          Voltar
        </button>

        <h1 className="text-base md:text-lg font-semibold" style={{ color: 'var(--black)' }}>
          Nova postagem
        </h1>

        <div />
      </header>

      {/* Conteúdo */}
      <section className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">

        {/* Texto */}
        <div className="rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm space-y-3" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)' }}>
          <label className="text-xs md:text-sm font-medium" style={{ color: 'var(--black)' }}>
            Conteúdo
          </label>

          <textarea
            placeholder="Escreva algo..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-24 md:h-32 resize-none outline-none text-sm rounded-lg p-3"
            style={{ backgroundColor: 'var(--background)', border: `1px solid var(--border)`, color: 'var(--black)' }}
          />
        </div>

        {/* Imagem */}
        <div className="rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm space-y-4" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)' }}>
          <label className="text-xs md:text-sm font-medium" style={{ color: 'var(--black)' }}>
            Imagem
          </label>

          {!preview && (
            <div className="rounded-lg p-4 md:p-6 text-center" style={{ border: `2px dashed var(--border)` }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                className="w-full text-xs md:text-sm"
                style={{ color: 'var(--gray)' }}
              />
            </div>
          )}

          {preview && (
            <div className="space-y-3">
              <img
                src={preview}
                className="w-full h-48 md:h-64 object-cover rounded-lg"
                alt="preview"
              />

              <button
                type="button"
                onClick={() => handleImageChange(null)}
                className="text-xs transition hover:underline"
                style={{ color: 'var(--warning)' }}
              >
                Remover imagem
              </button>
            </div>
          )}
        </div>

        {/* Configurações */}
        <div className="rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm space-y-4" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border)' }}>

          <div className="flex items-center justify-between text-xs md:text-sm">
            <span style={{ color: 'var(--black)' }}>Post recorrente</span>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              style={{ accentColor: 'var(--primary-dark)' }}
            />
          </div>

          <div className="flex items-center justify-between text-xs md:text-sm">
            <span style={{ color: 'var(--black)' }}>Post fixo</span>
            <input
              type="checkbox"
              checked={isFixed}
              onChange={(e) => setIsFixed(e.target.checked)}
              style={{ accentColor: 'var(--primary-dark)' }}
            />
          </div>

          {!isFixed && (
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as DurationType)}
              className="w-full rounded-lg p-2 text-xs md:text-sm outline-none"
              style={{ backgroundColor: 'var(--background)', border: `1px solid var(--border)`, color: 'var(--black)' }}
            >
              <option value="1h">1 hora</option>
              <option value="6h">6 horas</option>
              <option value="12h">12 horas</option>
              <option value="24h">24 horas</option>
              <option value="7d">7 dias</option>
              <option value="30d">30 dias</option>
            </select>
          )}

        </div>

      </section>

      {/* Footer fixo */}
      <footer className="w-full p-3 md:p-4 flex justify-end gap-2 md:gap-3 shadow-sm" style={{ backgroundColor: 'var(--white)', borderTop: '1px solid var(--border)' }}>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition hover:opacity-70"
          style={{ backgroundColor: 'var(--background)', color: 'var(--black)', border: `1px solid var(--border)` }}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-white text-xs md:text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--primary-dark)' }}
        >
          {loading ? "Postando..." : "Publicar"}
        </button>
      </footer>

    </main>
  )
}
