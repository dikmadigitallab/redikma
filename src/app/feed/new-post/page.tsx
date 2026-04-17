"use client"

import { useState } from "react"
import { ArrowLeft, Image as ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"

type DurationType = "1h" | "6h" | "12h" | "24h" | "7d" | "30d"

export default function CreatePostPage() {
  const router = useRouter()

  const [text, setText] = useState("")
  const [image, setImage] = useState<File | null>(null)

  const [isRecurring, setIsRecurring] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [duration, setDuration] = useState<DurationType>("24h")

  const [error, setError] = useState("")

  function handleSubmit() {
    if (!text && !image) {
      setError("Adicione texto ou imagem para postar")
      return
    }

    setError("")

    const payload = {
      text,
      image,
      isRecurring,
      isFixed,
      duration: isFixed ? null : duration,
    }

    console.log(payload)

    router.back()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
        <button onClick={() => router.back()} className="text-gray-600">
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

        {/* Caixa de texto */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <textarea
            placeholder="O que você quer compartilhar?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 resize-none outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Upload */}
        <label className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 to-teal-400 flex items-center justify-center text-white">
            <ImageIcon size={18} />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">
              Adicionar imagem
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG ou JPEG
            </p>
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </label>

        {/* Configurações */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">

          <p className="text-sm font-semibold text-gray-700">
            Configurações da postagem
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