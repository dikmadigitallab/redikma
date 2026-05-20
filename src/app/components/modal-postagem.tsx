"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

type DurationType = "1h" | "6h" | "12h" | "24h" | "7d" | "30d"

type Props = {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  onRefresh?: () => void
}

export function CreatNewPost({ open, onClose, onSuccess, onRefresh }: Props) {
  const [text, setText] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [duration, setDuration] = useState<DurationType>("24h")
  const [loading, setLoading] = useState(false)
  const { data: session } = useSession()
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
const trimmedText = text.trim()

// Permite:
// - somente texto
// - somente imagem
// - texto + imagem
// Impede:
// - texto vazio e sem imagem
if (!trimmedText && !image) {
  toast.warning("Adicione um texto ou uma imagem para postar")
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
      setText("")
      setImage(null)
      setPreview(null)
      setIsRecurring(false)
      setIsFixed(false)
      setDuration("24h")

      onClose()
      onSuccess?.()
      onRefresh?.()
    } catch {
      toast.error("Erro ao criar postagem")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--white)' }}>
        
        {/* Header com cor primária */}
        <div className="p-6 border-b-2" style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--accent)' }}>
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Red Hat Display', sans-serif" }}>
            Criar postagem
          </h2>
        </div>

        <div className="p-6 space-y-5">

        <textarea
          placeholder="Escreva algo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-xl p-4 resize-none h-28 outline-none text-sm font-medium transition focus:shadow-lg"
          style={{ backgroundColor: 'var(--background)', border: `2px solid var(--primary)`, color: 'var(--black)', fontFamily: "'Red Hat Text', sans-serif" }}
        />

        <div className="rounded-xl p-4 text-center space-y-3 transition hover:bg-[var(--primary-10)]" style={{ border: `3px dashed var(--primary)` }}>

          {!preview && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImageChange(e.target.files?.[0] || null)
                }
                className="w-full text-sm"
                style={{ color: 'var(--gray)' }}
              />
              <p className="text-xs" style={{ color: 'var(--gray)' }}>
                Adicione uma imagem opcional
              </p>
            </>
          )}

          {preview && (
            <div className="space-y-2">
              <img
                src={preview}
                alt="preview"
                className="w-full h-56 object-cover rounded-xl"
              />

              <button
                type="button"
                onClick={() => handleImageChange(null)}
                className="text-xs hover:underline transition"
                style={{ color: 'var(--accent)' }}
              >
                Remover imagem
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4" style={{ borderTop: `1px solid var(--border)` }}>

          <label className="flex justify-between items-center text-sm">
            <span style={{ color: 'var(--black)' }}>Post recorrente</span>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              style={{ accentColor: 'var(--primary)' }}
            />
          </label>

          <label className="flex justify-between items-center text-sm">
            <span style={{ color: 'var(--black)' }}>Post fixo</span>
            <input
              type="checkbox"
              checked={isFixed}
              onChange={(e) => setIsFixed(e.target.checked)}
              style={{ accentColor: 'var(--primary)' }}
            />
          </label>

          {!isFixed && (
            <div>
              <p className="text-sm mb-2" style={{ color: 'var(--black)' }}>Duração</p>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value as DurationType)}
                className="w-full rounded-xl p-2 text-sm outline-none font-medium"
                style={{ backgroundColor: 'var(--background)', border: `2px solid var(--primary)`, color: 'var(--black)' }}
              >
                <option value="1h">1 hora</option>
                <option value="6h">6 horas</option>
                <option value="12h">12 horas</option>
                <option value="24h">24 horas</option>
                <option value="7d">7 dias</option>
                <option value="30d">30 dias</option>
              </select>
            </div>
          )}

        </div>

        <div className="flex justify-end gap-2 p-6 pt-4 border-t-2" style={{ borderColor: 'var(--primary-10)' }}>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition hover:shadow-md"
            style={{ backgroundColor: 'var(--background)', color: 'var(--primary)', border: `2px solid var(--primary)` }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-bold transition hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:scale-100"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {loading ? "Postando..." : "Postar"}
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
