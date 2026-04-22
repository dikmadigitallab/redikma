"use client"

import { useState, useEffect } from "react"

type DurationType = "1h" | "6h" | "12h" | "24h" | "7d" | "30d"

type User = {
  nome: string
  username: string
  foto?: string | null
  id: string
}

export default function CreatePostPage() {
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

        if (!res.ok) return

        const data = await res.json()
        setUser(data)
      } catch (err) {
        console.error(err)
      }
    }

    loadUser()
  }, [])

  async function handleSubmit() {
    if (!user?.id) {
      setError("Usuário não carregado")
      return
    }

    if (!text && !image) {
      setError("Adicione texto ou imagem para postar")
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

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar postagem")
      }

      setText("")
      setImage(null)
      setPreview(null)
      setIsRecurring(false)
      setIsFixed(false)
      setDuration("24h")

      alert("Post criado")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black/60 p-4">

      <div className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-xl">

        <h2 className="text-xl font-semibold text-gray-800">
          Criar postagem
        </h2>

        <textarea
          placeholder="Escreva algo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-gray-200 rounded-xl p-3 resize-none h-28 outline-none text-sm"
        />

        <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center">

          {!preview && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
          )}

          {preview && (
            <div className="space-y-2">
              <img
                src={preview}
                className="w-full h-56 object-cover rounded-xl"
              />

              <button
                type="button"
                onClick={() => handleImageChange(null)}
                className="text-xs text-red-500"
              >
                Remover imagem
              </button>
            </div>
          )}
        </div>

        <label className="flex justify-between text-sm">
          <span>Post recorrente</span>
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          />
        </label>

        <label className="flex justify-between text-sm">
          <span>Post fixo</span>
          <input
            type="checkbox"
            checked={isFixed}
            onChange={(e) => setIsFixed(e.target.checked)}
          />
        </label>

        {!isFixed && (
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value as DurationType)}
            className="w-full border rounded-xl p-2 text-sm"
          >
            <option value="1h">1 hora</option>
            <option value="6h">6 horas</option>
            <option value="12h">12 horas</option>
            <option value="24h">24 horas</option>
            <option value="7d">7 dias</option>
            <option value="30d">30 dias</option>
          </select>
        )}

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex justify-end gap-2">

          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2 rounded-xl border text-gray-600"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-teal-400 text-white text-sm disabled:opacity-50"
          >
            {loading ? "Postando..." : "Postar"}
          </button>

        </div>

      </div>
    </main>
  )
}