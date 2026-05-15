"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"

type EditPostModalProps = {
  postId: string
  currentText: string
  onClose: () => void
  onSaved: () => void
}

export function EditPostModal({ postId, currentText, onClose, onSaved }: EditPostModalProps) {
  const [text, setText] = useState(currentText)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const trimmed = text.trim()
    if (!trimmed) {
      toast.error("O texto não pode ficar vazio")
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: trimmed }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erro ao editar post")
      }

      toast.success("Post atualizado com sucesso!")
      onSaved()
      onClose()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao editar post")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = "auto"
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: "var(--white)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--black)" }}>Editar post</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-100 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[120px] p-3 rounded-xl border outline-none resize-y text-sm leading-relaxed"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
              color: "var(--black)",
            }}
            placeholder="Digite o texto do post..."
          />
        </div>

        <div className="flex justify-end gap-3 p-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-80"
            style={{ backgroundColor: "var(--background)", color: "var(--gray)" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--primary-dark)" }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  )
}
