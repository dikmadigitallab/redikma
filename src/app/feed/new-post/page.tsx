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
    <main className="min-h-screen bg-gray-50 flex flex-col">
  
      {/* Header */}
      <header className="w-full bg-white border-b px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="text-sm text-gray-600"
        >
          Voltar
        </button>
  
        <h1 className="text-lg font-semibold text-gray-800">
          Nova postagem
        </h1>
  
        <div />
      </header>
  
      {/* Conteúdo */}
      <section className="flex-1 w-full max-w-3xl mx-auto px-6 py-6 space-y-6">
  
        {/* Texto */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border space-y-3">
          <label className="text-sm text-gray-600">
            Conteúdo
          </label>
  
          <textarea
            placeholder="Escreva algo..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 resize-none outline-none text-sm"
          />
        </div>
  
        {/* Imagem */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border space-y-4">
          <label className="text-sm text-gray-600">
            Imagem
          </label>
  
          {!preview && (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
            </div>
          )}
  
          {preview && (
            <div className="space-y-3">
              <img
                src={preview}
                className="w-full h-64 object-cover rounded-xl"
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
  
        {/* Configurações */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border space-y-4">
  
          <div className="flex items-center justify-between text-sm">
            <span>Post recorrente</span>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
          </div>
  
          <div className="flex items-center justify-between text-sm">
            <span>Post fixo</span>
            <input
              type="checkbox"
              checked={isFixed}
              onChange={(e) => setIsFixed(e.target.checked)}
            />
          </div>
  
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
  
        </div>
  
        {/* Erro */}
        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}
  
      </section>
  
      {/* Footer fixo */}
      <footer className="w-full bg-white border-t p-4 flex justify-end gap-3">
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
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-teal-400 text-white text-sm disabled:opacity-50"
        >
          {loading ? "Postando..." : "Publicar"}
        </button>
      </footer>
  
    </main>
  )
}