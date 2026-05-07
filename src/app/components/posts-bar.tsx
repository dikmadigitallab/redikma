"use client"

import { useEffect, useRef, useState } from "react"
import { RiImageEditFill, RiImageAddLine, RiCloseLine } from "react-icons/ri"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Editor } from "./photo-editor"

type Props = {
  onCreated?: () => void
  onRefresh?: () => void
}

export function PostBar({ onCreated, onRefresh }: Props) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [loading, setLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { data: session } = useSession()
  const user = session?.user

  // Foca no textarea automaticamente ao abrir
  useEffect(() => {
    if (open) textareaRef.current?.focus()
  }, [open])

  function handleImageSelection(file: File | null) {
    if (file) {
      setImage(file)
      setShowEditor(true)
    }
  }

  function handleSaveEditedImage(blob: Blob) {
    setFinalBlob(blob)
    setPreview(URL.createObjectURL(blob))
    setShowEditor(false)
  }

  async function handleSubmit() {
    if (!user?.id) return toast.error("Usuário não identificado")
    if (!text.trim() && !finalBlob) return toast.warning("Escreva algo ou adicione uma imagem")

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("label", text)
      formData.append("authorId", user.id)
      formData.append("postador", user.username)
      formData.append("duration", "")

      if (finalBlob) {
        const file = new File([finalBlob], "post.jpg", { type: "image/jpeg" })
        formData.append("image", file)
      }

      const res = await fetch("/api/posts", { method: "POST", body: formData })
      if (!res.ok) throw new Error()

      toast.success("Post criado com sucesso!")
      resetForm()
      onCreated?.()
      onRefresh?.()
    } catch {
      toast.error("Erro ao criar post")
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setText("")
    setImage(null)
    setFinalBlob(null)
    setPreview(null)
    setOpen(false)
  }

  return (
    <div className="w-full hidden md:block transition-all duration-300">
      {/* Overlay do Editor */}
      {showEditor && image && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-center">Editar Imagem</h3>
            <Editor
              imageFile={image}
              onSave={handleSaveEditedImage}
              onCancel={() => {
                setShowEditor(false)
                setImage(null)
              }}
              aspectRatio="1/1"
            />
          </div>
        </div>
      )}

      <div 
        className="rounded-2xl border transition-all duration-200 overflow-hidden"
        style={{ 
          backgroundColor: "var(--white)", 
          borderColor: open ? "var(--secondary)" : "var(--border)",
          boxShadow: open ? "0 4px 20px rgba(0,0,0,0.05)" : "none"
        }}
      >
        {/* ESTADO FECHADO: Apenas a barra simples */}
        {!open ? (
          <div
            onClick={() => setOpen(true)}
            className="flex items-center gap-3 p-4 cursor-pointer hover:bg-neutral-50/50 transition"
          >
            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
              <RiImageEditFill className="w-5 h-5" style={{ color: "var(--secondary)" }} />
            </div>
            <div className="text-sm font-medium" style={{ color: "var(--gray)" }}>
              No que você está pensando, {user?.nome?.split(' ')[0]}?
            </div>
          </div>
        ) : (
          /* ESTADO ABERTO: Formulário completo expandido no lugar */
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <img 
                src={session?.user?.foto || "/photoProfile/default.jpeg"} 
                className="w-10 h-10 rounded-full object-cover" 
                alt="Me"
              />
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="No que você está pensando?"
                className="w-full min-h-[120px] resize-none outline-none text-base py-2"
                style={{ backgroundColor: "transparent", color: "var(--black)" }}
              />
            </div>

            {/* Preview da Imagem Editada */}
            {preview && (
              <div className="relative ml-13 rounded-xl overflow-hidden border group">
                <img src={preview} className="w-full max-h-[350px] object-cover" alt="preview" />
                <button
                  onClick={() => { setPreview(null); setFinalBlob(null); }}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full transition"
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-neutral-100 transition text-sm font-medium"
                  style={{ color: "var(--secondary)" }}
                >
                  <RiImageAddLine className="w-5 h-5" />
                  <span>Foto</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelection(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-bold rounded-full hover:bg-neutral-100 transition"
                  style={{ color: "var(--gray)" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || (!text.trim() && !finalBlob)}
                  className="px-6 py-2 text-sm font-bold rounded-full text-white transition disabled:opacity-50 shadow-md active:scale-95"
                  style={{ backgroundColor: "var(--secondary)" }}
                >
                  {loading ? "Postando..." : "Publicar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}