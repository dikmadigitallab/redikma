"use client"

import { useEffect, useRef, useState } from "react"
import {
  RiImageEditFill,
  RiImageAddLine,
  RiVideoAddLine,
  RiCloseLine,
} from "react-icons/ri"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { EditorDesktop } from "./photo-editor-desktop"
import Image from "next/image"
import { MAX_POST_LENGTH } from "@/lib/constantes"

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

  const [video, setVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const limitWarned = useRef(false)

  const { data: session } = useSession()
  const user = session?.user

  useEffect(() => {
    if (open) {
      textareaRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
      if (videoPreview) URL.revokeObjectURL(videoPreview)
    }
  }, [preview, videoPreview])

  function handleImageSelection(file: File | null) {
    if (!file) return

    // Libera preview anterior
    if (preview) {
      URL.revokeObjectURL(preview)
    }

    // Guarda o arquivo original selecionado pelo usuário
    setImage(file)

    // Enquanto a imagem ainda não foi editada,
    // já usamos o próprio arquivo como conteúdo final
    setFinalBlob(file)

    // Cria uma URL temporária apenas para exibição no navegador.
    // O formato será algo como:
    // blob:http://localhost:3000/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    //
    // Isso é normal. Essa URL não representa o caminho real do arquivo
    // na máquina do usuário e não é enviada ao servidor.
    // Ela serve somente para o <img src="..."> mostrar a imagem.
    const objectUrl = URL.createObjectURL(file)

    setPreview(objectUrl)

    // Abre o editor desktop
    setShowEditor(true)
  }

  function handleVideoSelection(file: File | null) {
    if (!file) return

    if (videoPreview) URL.revokeObjectURL(videoPreview)

    const video = document.createElement("video")
    video.preload = "metadata"

    video.onloadedmetadata = () => {
      const duration = video.duration
      if (duration < 3 || duration > 10) {
        toast.error("O vídeo deve ter entre 3 e 10 segundos")
        URL.revokeObjectURL(video.src)
        return
      }
      setVideo(file)
      setVideoPreview(video.src)
    }

    video.onerror = () => {
      toast.error("Não foi possível ler o vídeo")
      URL.revokeObjectURL(video.src)
    }

    video.src = URL.createObjectURL(file)
  }

  function handleSaveEditedImage(blob: Blob) {
    // Remove preview anterior
    if (preview) {
      URL.revokeObjectURL(preview)
    }

    // Salva o blob final que será enviado ao servidor
    setFinalBlob(blob)

    // Mantém uma referência em File para reutilização futura
    const editedFile = new File([blob], "post.jpg", {
      type: "image/jpeg",
    })
    setImage(editedFile)

    // Cria uma URL temporária apenas para visualização no navegador
    // Exemplo: blob:http://localhost:3000/...
    // Essa URL não é enviada ao servidor, serve somente para o <img src="">
    const objectUrl = URL.createObjectURL(blob)
    setPreview(objectUrl)

    // Fecha o editor
    setShowEditor(false)
  }


  async function handleSubmit() {
    if (!user?.id) {
      return toast.error("Usuário não identificado")
    }

    const trimmedText = text.trim()

    if (!trimmedText && !finalBlob && !video) {
      return toast.warning("Adicione um texto, imagem ou vídeo para postar")
    }

    setLoading(true)

    try {
      const formData = new FormData()

      formData.append("label", trimmedText)
      formData.append("authorId", user.id)
      formData.append("postador", user.username || "")
      formData.append("duration", "")

      if (finalBlob) {
        const file = new File([finalBlob], "post.jpg", {
          type: "image/jpeg",
        })

        formData.append("image", file)
      }

      if (video) {
        formData.append("video", video)
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error()
      }

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
    if (preview) URL.revokeObjectURL(preview)
    if (videoPreview) URL.revokeObjectURL(videoPreview)

    setText("")
    setImage(null)
    setFinalBlob(null)
    setPreview(null)
    setVideo(null)
    setVideoPreview(null)
    setShowEditor(false)
    setOpen(false)
  }

  function handleCancelEditor() {
    if (preview) {
      URL.revokeObjectURL(preview)
    }

    setShowEditor(false)
    setImage(null)
    setFinalBlob(null)
    setPreview(null)
  }

  return (
    <div className="w-full hidden md:block transition-all duration-300">
      {/* Overlay do Editor */}
      {showEditor && image && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(39, 38, 98, 0.55)" }}
        >
          <EditorDesktop
            imageFile={image}
            onSave={handleSaveEditedImage}
            onCancel={handleCancelEditor}
            aspectRatio="1/1"
          />
        </div>
      )}

      {/* Card principal */}
      <div
        className="rounded-2xl border-2 shadow-md overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: "var(--white)",
          borderColor: open ? "var(--accent)" : "var(--primary)",
          boxShadow: open
            ? "0 12px 32px rgba(241, 90, 36, 0.15)"
            : "0 2px 12px rgba(39, 38, 98, 0.1)",
        }}
      >
        {/* Barra decorativa superior */}
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 70%, var(--accent) 100%)",
          }}
        />

        {!open ? (
          /* Estado fechado */
          <div
            onClick={() => setOpen(true)}
            className="flex items-center gap-4 p-5 cursor-pointer transition-opacity hover:opacity-90"
          >
            {/* Avatar do usuário */}
            <div className="relative shrink-0">
              <div
                className="absolute -inset-1 rounded-full opacity-20"
                style={{ backgroundColor: "var(--secondary)" }}
              />
              <Image
                src={
                  session?.user?.foto ||
                  "/photoProfile/userDefault.png"
                }
                alt="Usuário"
                width={44}
                height={44}
                className="relative w-11 h-11 rounded-full object-cover border-2"
                style={{ borderColor: "var(--white)" }}
              />
            </div>

            {/* Campo fake */}
            <div
              className="flex-1 rounded-full px-5 py-3 border-2 text-sm font-semibold transition hover:border-accent hover:bg-(--primary-10)"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--primary)",
                color: "var(--primary)",
              }}
            >
              No que você está pensando,{" "}
              {user?.nome?.split(" ")[0]}?
            </div>

            {/* Ícone */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition hover:bg-accent hover:text-white"
              style={{
                backgroundColor: "var(--primary-15)",
                color: "var(--primary)",
              }}
            >
              <RiImageEditFill className="w-5 h-5" />
            </div>
          </div>
        ) : (
          /* Estado aberto */
          <div className="p-5 space-y-5">
            {/* Cabeçalho */}
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <div
                  className="absolute -inset-1 rounded-full opacity-20"
                  style={{ backgroundColor: "var(--secondary)" }}
                />

                <Image
                  src={
                    session?.user?.foto ||
                    "/photoProfile/userDefault.png"
                  }
                  alt="Me"
                  width={44}
                  height={44}
                  className="relative w-11 h-11 rounded-full object-cover border-2"
                  style={{ borderColor: "var(--white)" }}
                />
              </div>

              <div className="flex-1 flex flex-col">
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => {
                    const val = e.target.value
                    setText(val)
                    if (val.length >= MAX_POST_LENGTH && !limitWarned.current) {
                      limitWarned.current = true
                      toast.warning(`Limite de ${MAX_POST_LENGTH} caracteres atingido`)
                    }
                    if (val.length < MAX_POST_LENGTH) {
                      limitWarned.current = false
                    }
                  }}
                  placeholder="Compartilhe uma novidade com sua equipe..."
                  maxLength={MAX_POST_LENGTH}
                  className="w-full min-h-35 resize-none outline-none text-sm leading-7"
                  style={{
                    backgroundColor: "transparent",
                    color: "var(--black)",
                  }}
                />
                <div className="text-right text-xs mt-1" style={{ color: text.length >= MAX_POST_LENGTH ? "var(--accent)" : "var(--gray)" }}>
                  {text.length}/{MAX_POST_LENGTH}
                </div>
              </div>
            </div>

            {/* Preview da imagem */}
            {preview && (
              <div
                className="relative rounded-2xl overflow-hidden border"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                }}
              >
                <Image
                  src={preview}
                  alt="preview"
                  width={1200}
                  height={1200}
                  unoptimized
                  className="w-full max-h-105 object-cover"
                />

                <button
                  type="button"
                  onClick={() => {
                    if (preview) {
                      URL.revokeObjectURL(preview);
                    }

                    setPreview(null);
                    setImage(null);
                    setFinalBlob(null);
                  }}
                  className="absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "rgba(26, 26, 26, 0.65)",
                    color: "var(--white)",
                  }}
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Preview do vídeo */}
            {videoPreview && (
              <div
                className="relative rounded-2xl overflow-hidden border"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                }}
              >
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-h-105"
                  style={{ maxHeight: "420px" }}
                />

                <button
                  type="button"
                  onClick={() => {
                    if (videoPreview) URL.revokeObjectURL(videoPreview)
                    setVideo(null)
                    setVideoPreview(null)
                  }}
                  className="absolute top-3 right-3 w-10 h-10 rounded-xl flex items-center justify-center transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "rgba(26, 26, 26, 0.65)",
                    color: "var(--white)",
                  }}
                >
                  <RiCloseLine className="w-5 h-5" />
                </button>

                <div
                  className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--white)",
                  }}
                >
                  Frash
                </div>
              </div>
            )}

            {/* Rodapé */}
            <div
              className="flex items-center justify-between pt-4 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              {/* Botões de mídia */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition hover:shadow-md hover:border-accent"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--primary)",
                    color: "var(--primary)",
                  }}
                >
                  <RiImageAddLine className="w-5 h-5" />
                  <span>Adicionar Foto</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageSelection(
                      e.target.files?.[0] || null
                    )
                  }
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() =>
                    videoInputRef.current?.click()
                  }
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition hover:shadow-md hover:border-accent"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--primary)",
                    color: "var(--primary)",
                  }}
                >
                  <RiVideoAddLine className="w-5 h-5" />
                  <span>Adicionar Frash</span>
                </button>

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) =>
                    handleVideoSelection(
                      e.target.files?.[0] || null
                    )
                  }
                  className="hidden"
                />
              </div>

              {/* Botões de ação */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: "var(--background)",
                    color: "var(--gray)",
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    (!text.trim() && !finalBlob && !video)
                  }
                  className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--white)",
                  }}
                >
                  {loading ? "Publicando..." : "Publicar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
