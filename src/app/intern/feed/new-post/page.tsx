"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Editor } from "@/app/components/photo-editor"
// Importe um ícone de troca se tiver (ex: lucide-react) ou use texto
import { RefreshCw } from "lucide-react" 

type DurationType = "1h" | "6h" | "12h" | "24h" | "7d" | "30d"

type Props = {
  onRefresh?: () => void
}

export default function CreatePostPage({ onRefresh }: Props) {
  const [text, setText] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  
  const [isFixed, setIsFixed] = useState(false)
  const [duration, setDuration] = useState<DurationType>("24h")
  const [loading, setLoading] = useState(false)
  
  // NOVO: Estado para controlar qual câmera usar
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")

  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Gerenciamento da Câmera - Adicionado facingMode como dependência
  useEffect(() => {
    if (!finalBlob && !showEditor) {
      startCamera()
    }
    return () => stopCamera()
  }, [finalBlob, showEditor, facingMode])

  async function startCamera() {
    // Para o stream anterior antes de iniciar um novo
    stopCamera() 
    
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
        audio: false
      })
      setStream(s)
      if (videoRef.current) videoRef.current.srcObject = s
    } catch (err) {
      console.error(err)
      toast.error("Erro ao acessar câmera")
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop())
      setStream(null)
    }
  }

  // NOVO: Função para alternar a câmera
  function toggleCamera() {
    setFacingMode(prev => prev === "environment" ? "user" : "environment")
  }

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
    <main className="h-[100dvh] bg-[#F5F5F7] text-black flex flex-col overflow-hidden">
      <header className="flex-shrink-0 sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-neutral-200 px-4 py-3 safe-top flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="text-sm text-neutral-500 hover:text-black transition min-w-14 text-left"
        >
          Voltar
        </button>
        <h1 className="text-sm sm:text-base font-semibold tracking-wide text-center flex-1">
          Nova postagem
        </h1>
        <div className="min-w-14" />
      </header>

      <section className="flex-1 overflow-y-auto overscroll-contain bg-inherit">
        <div className="w-full max-w-lg mx-auto px-3 sm:px-5 py-4 space-y-4">
          
          <div className="rounded-2xl bg-white border border-neutral-200 p-4 shadow-sm">
            <textarea
              placeholder="Compartilhe algo..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-transparent outline-none text-sm sm:text-base resize-none h-20 leading-relaxed"
            />
          </div>

          <div className="rounded-2xl bg-white border border-neutral-200 p-3 shadow-sm space-y-4">
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

            {!showEditor && !finalBlob && (
              <>
                <div className="relative rounded-2xl overflow-hidden bg-black border border-neutral-200">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-[3/4] max-h-[40vh] sm:max-h-[60vh] object-cover"
                  />
                  
                  {/* BOTÃO PARA VIRAR CÂMERA */}
                  <button 
                    onClick={toggleCamera}
                    className="absolute bottom-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-full text-white active:scale-90 transition"
                    title="Alternar Câmera"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={takePhoto}
                    className="py-3 rounded-2xl bg-black text-white text-sm font-medium active:scale-[0.98] transition"
                  >
                    Tirar foto
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-3 rounded-2xl border border-neutral-300 bg-white text-sm font-medium active:scale-[0.98] transition"
                  >
                    Galeria
                  </button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </>
            )}

            {!showEditor && finalBlob && (
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100">
                  <img
                    src={URL.createObjectURL(finalBlob)}
                    alt="Final"
                    className="w-full aspect-square max-h-[40vh] object-cover"
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <button onClick={() => setShowEditor(true)} className="text-sm font-medium text-blue-600">
                    Editar
                  </button>
                  <button onClick={resetPhoto} className="text-sm font-medium text-red-500">
                    Remover
                  </button>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        <div className="w-full max-w-lg mx-auto flex gap-3 px-3 sm:px-5 pb-8">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 py-3.5 border border-neutral-300 rounded-2xl text-sm font-medium bg-white active:scale-[0.98]"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || (!text && !finalBlob)}
            className="flex-1 py-3.5 bg-black text-white rounded-2xl text-sm font-medium active:scale-[0.98] disabled:opacity-30"
          >
            {loading ? "..." : "Publicar"}
          </button>
        </div>
      </section>
    </main>
  )
}