"use client"

import { useState } from "react"
import { ArrowLeft, Image as ImageIcon, X } from "lucide-react"
import { useRouter } from "next/navigation"

type DurationType = "1h" | "6h" | "12h" | "24h" | "7d" | "30d"

export default function CreatePostPage() {
  const router = useRouter()

  const [text, setText] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [isRecurring, setIsRecurring] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [duration, setDuration] = useState<DurationType>("24h")

  const [error, setError] = useState("")

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImage(null)
    setPreview(null)
  }

  async function handleSubmit() {
    if (!text && !image) {
      setError("Adicione texto ou imagem para postar")
      return
    }

    let imageBase64: string | null = null

    if (image) {
      imageBase64 = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(image)
      })
    }

    const newPost = {
      id: crypto.randomUUID(),
      text,
      image: imageBase64,
      createdAt: Date.now(),
      isRecurring,
      isFixed,
      duration: isFixed ? null : duration,
    }

    const existing = JSON.parse(localStorage.getItem("posts") || "[]")
    localStorage.setItem("posts", JSON.stringify([newPost, ...existing]))

    router.push("/feed")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <button onClick={() => router.back()}>
          <ArrowLeft />
        </button>

        <h1 className="font-semibold text-gray-800">Nova postagem</h1>

        <button
          onClick={handleSubmit}
          className="text-sm font-semibold text-white bg-gradient-to-r from-yellow-400 to-teal-400 px-4 py-1.5 rounded-full"
        >
          Postar
        </button>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-4 space-y-5">

        {/* Texto */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <textarea
            placeholder="O que você quer compartilhar?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 resize-none outline-none text-gray-700"
          />
        </div>

        {/* Upload + preview */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 to-teal-400 flex items-center justify-center text-white">
              <ImageIcon size={18} />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">
                Adicionar imagem
              </p>
              <p className="text-xs text-gray-400">
                Opcional
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImage}
            />
          </label>

          {preview && (
            <div className="relative">
              <img
                src={preview}
                className="w-full max-h-72 object-cover rounded-xl"
              />

              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Configurações */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">

          <p className="text-sm font-semibold text-gray-700">
            Configurações
          </p>

          <label className="flex justify-between items-center">
            <span className="text-gray-600">Post recorrente</span>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
          </label>

          <label className="flex justify-between items-center">
            <span className="text-gray-600">Post fixo</span>
            <input
              type="checkbox"
              checked={isFixed}
              onChange={(e) => setIsFixed(e.target.checked)}
            />
          </label>

          {!isFixed && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Duração</p>
              <select
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value as DurationType)
                }
                className="w-full border border-gray-200 rounded-xl p-2 text-gray-700"
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

        {/* Erro */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

      </div>

    </main>
  )
}