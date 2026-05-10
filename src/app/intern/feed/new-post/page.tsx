"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Editor } from "@/app/components/photo-editor"

type DurationType = "1h" | "6h" | "12h" | "24h" | "7d" | "30d"

type Props = {
  onRefresh?: () => void
}

export default function CreatePostPage({ onRefresh }: Props) {
  const [text, setText] = useState("")
  const [image, setImage] = useState<File | null>(null) // Arquivo original
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null) // Resultado do Editor
  const [showEditor, setShowEditor] = useState(false)
  
  const [isFixed, setIsFixed] = useState(false)
  const [duration, setDuration] = useState<DurationType>("24h")
  const [loading, setLoading] = useState(false)

  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Gerenciamento da Câmera
  useEffect(() => {
    if (!finalBlob && !showEditor) startCamera()
    return () => stopCamera()
  }, [finalBlob, showEditor])

  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      })
      setStream(s)
      if (videoRef.current) videoRef.current.srcObject = s
    } catch {
      toast.error("Erro ao acessar câmera")
    }
  }

  function stopCamera() {
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
  }

  // Handlers de imagem
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setShowEditor(true)
    stopCamera()
  }

  function takePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0)

    canvas.toBlob(blob => {
      if (!blob) return
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" })
      setImage(file)
      setShowEditor(true)
      stopCamera()
    }, "image/jpeg")
  }

  function resetPhoto() {
    setImage(null)
    setFinalBlob(null)
    setShowEditor(false)
  }

  async function handleSubmit() {
    if (!user?.id) return toast.error("Usuário não identificado")
    if (!text && !finalBlob) return toast.warning("Adicione conteúdo")

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("label", text)
      formData.append("authorId", user.id)
      formData.append("duration", isFixed ? "" : duration)
      formData.append("postador", user?.nome || user?.email || "anonimo")

      if (finalBlob) {
        const finalFile = new File([finalBlob], "post.jpg", { type: "image/jpeg" })
        formData.append("image", finalFile)
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData
      })

      if (!res.ok) throw new Error()

      toast.success("Post criado com sucesso")
      if (onRefresh) onRefresh()
      router.push("/intern/feed")
    } catch {
      toast.error("Erro ao publicar")
    } finally {
      setLoading(false)
    }
  }

  return (
  
<main className="h-screen overflow-y-auto bg-[#F5F5F7] text-black flex flex-col">
  <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-neutral-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between safe-top flex-shrink-0">
    <button
      onClick={() => window.history.back()}
      className="text-sm text-neutral-500 hover:text-black transition min-w-[56px] text-left"
    >
      Voltar
    </button>

    <h1 className="text-sm sm:text-base font-semibold tracking-wide text-center flex-1">
      Nova postagem
    </h1>

    <div className="min-w-[56px]" />
  </header>

  <section className="flex-1 w-full max-w-lg mx-auto px-3 sm:px-5 py-4 sm:py-8 space-y-4 sm:space-y-8 pb-6">
    {/* Texto do Post */}
    <div className="rounded-2xl sm:rounded-3xl bg-white border border-neutral-200 p-4 sm:p-5 shadow-sm">
      <textarea
        placeholder="Compartilhe algo..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full bg-transparent outline-none text-sm sm:text-base resize-none h-24 sm:h-28 leading-relaxed"
      />
    </div>

    {/* Área de Imagem / Editor */}
    <div className="rounded-2xl sm:rounded-3xl bg-white border border-neutral-200 p-3 sm:p-4 shadow-sm space-y-4">
      {/* 1. Modo Editor Aberto */}
      {showEditor && image && (
        <div className="w-full overflow-hidden rounded-2xl">
          <Editor
            imageFile={image}
            onSave={(blob) => {
              setFinalBlob(blob)
              setShowEditor(false)
            }}
            onCancel={() => {
              setShowEditor(false)
              setImage(null)
            }}
          />
        </div>
      )}

      {/* 2. Modo Câmera (Nada selecionado) */}
      {!showEditor && !finalBlob && (
        <>
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-neutral-200">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-[3/4] max-h-[60vh] object-cover"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={takePhoto}
              className="w-full py-3.5 rounded-2xl bg-black text-white text-sm font-medium active:scale-[0.98] transition"
            >
              Tirar foto
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3.5 rounded-2xl border border-neutral-300 bg-white text-sm font-medium active:scale-[0.98] transition"
            >
              Galeria
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </>
      )}

      {/* 3. Modo Preview (Imagem já editada) */}
      {!showEditor && finalBlob && (
        <div className="space-y-4">
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-200 bg-neutral-100">
            <img
              src={URL.createObjectURL(finalBlob)}
              alt="Final"
              className="w-full aspect-square object-cover"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
            <button
              onClick={() => setShowEditor(true)}
              className="text-sm font-medium text-blue-600 text-left"
            >
              Editar novamente
            </button>

            <button
              onClick={resetPhoto}
              className="text-sm font-medium text-red-500 text-left sm:text-right"
            >
              Remover imagem
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  </section>

  <footer className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-xl border-t border-neutral-200 p-3 sm:p-4 safe-bottom flex-shrink-0">
    <div className="w-full max-w-lg mx-auto flex flex-col sm:flex-row gap-3">
      <button
        onClick={() => window.history.back()}
        className="w-full py-3.5 border border-neutral-300 rounded-2xl text-sm font-medium bg-white active:scale-[0.98] transition"
      >
        Cancelar
      </button>

      <button
        onClick={handleSubmit}
        disabled={loading || (!text && !finalBlob)}
        className="w-full py-3.5 bg-black text-white rounded-2xl text-sm font-medium active:scale-[0.98] transition disabled:opacity-30 disabled:active:scale-100"
      >
        {loading ? "Publicando..." : "Publicar"}
      </button>
    </div>
  </footer>
</main>
    
  )
}
