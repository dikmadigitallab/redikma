"use client"

import { useEffect, useRef, useState } from "react"
import { RiImageEditFill } from "react-icons/ri"

type User = {
  nome: string
  username: string
  foto?: string | null
  id: string
}

type Props = {
  onCreated?: () => void
}

export function PostBar({ onCreated }: Props) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const boxRef = useRef<HTMLDivElement | null>(null)

  function handleImage(file: File | null) {
    setImage(file)

    if (file) {
      setPreview(URL.createObjectURL(file))
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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!boxRef.current) return

      if (!boxRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  async function handleSubmit() {
    if (!user?.id) {
      setError("Usuário não carregado")
      return
    }

    if (!text.trim() && !image) {
      setError("Escreva algo ou adicione imagem")
      return
    }

    setError("")
    setLoading(true)

    try {
      const formData = new FormData()

      formData.append("label", text)
      formData.append("authorId", user.id)
      formData.append("postador", user.username)
      formData.append("duration", "")

      if (image) {
        formData.append("image", image)
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar post")
      }

      setText("")
      setImage(null)
      setPreview(null)
      setOpen(false)

      onCreated?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <div
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 md:gap-3 rounded-lg md:rounded-xl shadow-sm p-3 md:p-4 cursor-pointer"
        style={{
          backgroundColor: "var(--white)",
          border: "1px solid var(--border)",
        }}
      >
        <RiImageEditFill
          className="w-5 md:w-6 h-5 md:h-6 flex-shrink-0"
          style={{ color: "var(--secondary)" }}
        />

        <div className="text-sm" style={{ color: "var(--gray)" }}>
          No que você está pensando?
        </div>
      </div>

      {open && (
        <div
          ref={boxRef}
          className="absolute z-50 mt-2 w-full rounded-xl shadow-lg p-4 space-y-3"
          style={{
            backgroundColor: "var(--white)",
            border: "1px solid var(--border)",
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva seu post..."
            className="w-full min-h-24 resize-none outline-none text-sm p-2 rounded-lg"
            style={{
              backgroundColor: "var(--background)",
              color: "var(--gray)",
            }}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImage(e.target.files?.[0] || null)}
          />

          {preview && (
            <img
              src={preview}
              className="w-full max-h-56 object-cover rounded-lg"
              alt="preview"
            />
          )}

          {error && (
            <div className="text-xs" style={{ color: "var(--warning)" }}>
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1 text-sm rounded-lg"
              style={{ background: "var(--background)" }}
            >
              cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-3 py-1 text-sm rounded-lg text-white"
              style={{
                backgroundColor: "#2563eb",
                color: "#fff",
              }}
            >
              {loading ? "enviando..." : "publicar"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}