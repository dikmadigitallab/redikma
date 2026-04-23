"use client"

import { useState, useEffect } from "react"

type DurationType = "1h" | "6h" | "12h" | "24h" | "7d" | "30d"

type User = {
  nome: string
  username: string
  foto?: string | null
  id: string
}

type Props = {
  open: boolean
  onClose: () => void
}

export function CreatNewPost({ open, onClose }: Props) {
  const [text, setText] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [isRecurring, setIsRecurring] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [duration, setDuration] = useState<DurationType>("24h")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  function handleImageChange(file: File | null) {
    setImage(file)

    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/autenticar")

        if (!res.ok) {
          console.log("auth falhou:", res.status)
          return
        }

        const data = await res.json()
        console.log("user carregado:", data)
        setUser(data)
      } catch (err) {
        console.error("erro auth:", err)
      }
    }

    loadUser()
  }, [])

  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()

    alert("clicou em postar")

    console.log("USER ATUAL:", user)

    if (!user?.id) {
      setError("Usuário não carregado")
      alert("❌ usuário não carregado")
      return
    }

    if (!text && !image) {
      setError("Adicione texto ou imagem para postar")
      alert("❌ sem texto e sem imagem")
      return
    }

    setError("")
    setLoading(true)

    try {
      let imageUrl: string | undefined = undefined

      if (image) {
        imageUrl = preview || ""
      }

      const payload = {
        label: text,
        authorId: user.id,
        duration: isFixed ? "" : duration,
        image: imageUrl,
        video: null,
        postador:user.username
      }

      console.log("PAYLOAD:", payload)

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      console.log("STATUS:", res.status)

      const data = await res.json()
      console.log("RESPONSE:", data)

      if (!res.ok) {
        alert("❌ erro da API: " + data.error)
        throw new Error(data.error || "Erro ao criar postagem")
      }

      alert("✅ post criado")

      setText("")
      setImage(null)
      setPreview(null)
      setIsRecurring(false)
      setIsFixed(false)
      setDuration("24h")

      onClose()
    } catch (err: any) {
      console.error("ERRO:", err)
      setError(err.message)
      alert("🔥 erro: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl p-6 space-y-5 shadow-xl" style={{ backgroundColor: 'var(--white)' }}>

        <h2 className="text-xl font-semibold" style={{ color: 'var(--black)' }}>
          Criar postagem
        </h2>

        <textarea
          placeholder="Escreva algo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-xl p-3 resize-none h-28 outline-none text-sm"
          style={{ backgroundColor: 'var(--background)', border: `1px solid var(--border)`, color: 'var(--black)' }}
        />

        <div className="rounded-xl p-4 text-center space-y-3" style={{ border: `2px dashed var(--border)` }}>

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
                style={{ color: 'var(--warning)' }}
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
              style={{ accentColor: 'var(--primary-dark)' }}
            />
          </label>

          <label className="flex justify-between items-center text-sm">
            <span style={{ color: 'var(--black)' }}>Post fixo</span>
            <input
              type="checkbox"
              checked={isFixed}
              onChange={(e) => setIsFixed(e.target.checked)}
              style={{ accentColor: 'var(--primary-dark)' }}
            />
          </label>

          {!isFixed && (
            <div>
              <p className="text-sm mb-2" style={{ color: 'var(--black)' }}>Duração</p>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value as DurationType)}
                className="w-full rounded-xl p-2 text-sm outline-none"
                style={{ backgroundColor: 'var(--background)', border: `1px solid var(--border)`, color: 'var(--black)' }}
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

        {error && (
          <div className="text-sm rounded-xl px-3 py-2" style={{ backgroundColor: '#FFE5E5', border: `1px solid var(--border)`, color: 'var(--black)' }}>
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4" style={{ borderTop: `1px solid var(--border)` }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-70"
            style={{ backgroundColor: 'var(--background)', color: 'var(--black)', border: `1px solid var(--border)` }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-white text-sm font-medium transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary-dark)' }}
          >
            {loading ? "Postando..." : "Postar"}
          </button>
        </div>

      </div>
    </div>
  )
}
