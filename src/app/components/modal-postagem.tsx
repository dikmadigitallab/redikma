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
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-xl">

        <h2 className="text-xl font-semibold text-gray-800">
          Criar postagem
        </h2>

        <textarea
          placeholder="Escreva algo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl p-3 resize-none h-28 outline-none text-sm"
        />

        <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center space-y-3">

          {!preview && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImageChange(e.target.files?.[0] || null)
                }
                className="w-full text-sm text-gray-500"
              />
              <p className="text-xs text-gray-400">
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
                className="text-xs text-red-500 hover:underline"
              >
                Remover imagem
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4 pt-2 border-t">

          <label className="flex justify-between items-center text-sm text-gray-700">
            <span>Post recorrente</span>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="accent-blue-600"
            />
          </label>

          <label className="flex justify-between items-center text-sm text-gray-700">
            <span>Post fixo</span>
            <input
              type="checkbox"
              checked={isFixed}
              onChange={(e) => setIsFixed(e.target.checked)}
              className="accent-blue-600"
            />
          </label>

          {!isFixed && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Duração</p>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value as DurationType)}
                className="w-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl p-2 text-sm outline-none"
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
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-teal-400 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Postando..." : "Postar"}
          </button>
        </div>

      </div>
    </div>
  )
}