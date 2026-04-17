"use client"

import { useState } from "react"

type DurationType = "1h" | "6h" | "12h" | "24h" | "7d" | "30d"

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

  function handleImageChange(file: File | null) {
    setImage(file)

    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

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

    setText("")
    setImage(null)
    setPreview(null)
    setIsRecurring(false)
    setIsFixed(false)
    setDuration("24h")
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-xl">

        <h2 className="text-xl font-semibold text-gray-800">
          Criar postagem
        </h2>

        {/* Texto */}
        <textarea
          placeholder="Escreva algo..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl p-3 resize-none h-28 outline-none text-sm"
        />

        {/* Upload + Preview */}
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
                onClick={() => handleImageChange(null)}
                className="text-xs text-red-500 hover:underline"
              >
                Remover imagem
              </button>
            </div>
          )}
        </div>

        {/* Configurações */}
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

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        {/* Ações */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-teal-400 text-white text-sm font-medium hover:opacity-90"
          >
            Postar
          </button>
        </div>

      </div>
    </div>
  )
}