"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type DurationType = "1h" | "6h" | "12h" | "24h" | "7d" | "30d"

type Props = {
  onRefresh?: () => void
}

export default function CreatePostPage({ onRefresh }: Props) {
  const [text, setText] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isRecurring, setIsRecurring] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [duration, setDuration] = useState<DurationType>("24h")
  const [loading, setLoading] = useState(false)

  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)
  const [aspectRatio, setAspectRatio] = useState("1/1")

  const dragStart = useRef({ x: 0, y: 0 })

  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    if (!preview) startCamera()
    return () => stopCamera()
  }, [preview])

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

  function handleFile(e: any) {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
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
      setPreview(URL.createObjectURL(blob))
      stopCamera()
    }, "image/jpeg")
  }

  function resetPhoto() {
    setImage(null)
    setPreview(null)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  function handleZoom(e: any) {
    e.preventDefault()
    setIsInteracting(true)
    setZoom(prev => Math.min(Math.max(prev + e.deltaY * -0.001, 1), 3))
  }

  function startDrag(e: any) {
    setDragging(true)
    setIsInteracting(true)
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    }
  }

  function onDrag(e: any) {
    if (!dragging) return
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    })
  }

  function endDrag() {
    setDragging(false)
    setTimeout(() => setIsInteracting(false), 300)
  }

  async function handleSubmit() {
    if (!user?.id) return toast.error("Usuário não identificado")
    if (!text && !image) return toast.warning("Adicione conteúdo")

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("label", text)
      formData.append("authorId", user.id)
      formData.append("duration", isFixed ? "" : duration)
      // @ts-ignore
      formData.append("postador", user.username)

      if (image) formData.append("image", image)

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        const data = await res.json()
        return toast.error(data.error || "Erro")
      }

      toast.success("Post criado com sucesso!")
      router.push("/intern/feed")
    } catch {
      toast.error("Erro ao publicar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      
      {/* HEADER */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-neutral-950/70 border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <button onClick={() => window.history.back()} className="text-sm text-neutral-400 hover:text-white transition">
          Voltar
        </button>
        <h1 className="text-sm font-medium tracking-wide">Nova postagem</h1>
        <div className="w-10" />
      </header>

      <section className="flex-1 w-full max-w-xl mx-auto px-4 py-6 space-y-6">

        {/* INPUT TEXTO */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 focus-within:border-neutral-600 transition">
          <textarea
            placeholder="Compartilhe algo..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-transparent outline-none text-sm placeholder:text-neutral-500 resize-none h-24"
          />
        </div>

        {/* MIDIA */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-4">

          {!preview && (
            <>
              <div className="rounded-2xl overflow-hidden bg-black border border-neutral-800">
                <video ref={videoRef} autoPlay playsInline className="w-full h-72 object-cover" />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={takePhoto}
                  className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium hover:opacity-90 active:scale-[0.98] transition"
                >
                  Tirar foto
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 rounded-xl border border-neutral-700 text-sm font-medium hover:bg-neutral-800 transition"
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

          {preview && (
            <>
              <div className="relative rounded-2xl overflow-hidden bg-black border border-neutral-800" style={{ aspectRatio }}>
                <img
                  src={preview}
                  onWheel={handleZoom}
                  onMouseDown={startDrag}
                  onMouseMove={onDrag}
                  onMouseUp={endDrag}
                  onMouseLeave={endDrag}
                  className="absolute w-full h-full object-cover cursor-grab active:cursor-grabbing"
                  style={{
                    transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`
                  }}
                />

                {isInteracting && (
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-white/20" />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {["1/1", "4/5", "16/9"].map(r => (
                  <button
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    className={`flex-1 py-2 rounded-lg text-xs transition ${
                      aspectRatio === r
                        ? "bg-white text-black"
                        : "bg-neutral-800 text-neutral-400"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-white"
              />

              <button onClick={resetPhoto} className="text-xs text-red-400">
                Remover imagem
              </button>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* CONFIG */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-400">Post recorrente</span>
            <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
          </div>

          <div className="flex justify-between">
            <span className="text-neutral-400">Post fixo</span>
            <input type="checkbox" checked={isFixed} onChange={(e) => setIsFixed(e.target.checked)} />
          </div>

          {!isFixed && (
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as DurationType)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm"
            >
              <option value="1h">1 hora</option>
              <option value="24h">24 horas</option>
              <option value="7d">7 dias</option>
            </select>
          )}
        </div>

      </section>

      {/* FOOTER */}
      <footer className="sticky bottom-0 backdrop-blur-xl bg-neutral-950/80 border-t border-neutral-800 p-4 flex gap-3">
        <button
          onClick={() => window.history.back()}
          className="flex-1 py-3 rounded-xl border border-neutral-700 text-sm hover:bg-neutral-800 transition"
        >
          Cancelar
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-white text-black text-sm font-medium disabled:opacity-50 active:scale-[0.98] transition"
        >
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </footer>

    </main>
  )
}