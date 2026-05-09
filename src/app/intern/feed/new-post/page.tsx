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
  const containerRef = useRef<HTMLDivElement>(null)

  function getLimits(img: HTMLImageElement, container: DOMRect, scale: number) {
    const imgRatio = img.width / img.height
    const containerRatio = container.width / container.height

    let baseWidth = container.width
    let baseHeight = container.height

    if (imgRatio > containerRatio) {
      baseHeight = container.height
      baseWidth = baseHeight * imgRatio
    } else {
      baseWidth = container.width
      baseHeight = baseWidth / imgRatio
    }

    const scaledWidth = baseWidth * scale
    const scaledHeight = baseHeight * scale

    const limitX = Math.max(0, (scaledWidth - container.width) / 2)
    const limitY = Math.max(0, (scaledHeight - container.height) / 2)

    return { limitX, limitY }
  }

  function clampPosition(x: number, y: number) {
    const container = containerRef.current
    if (!container || !preview) return { x, y }

    const img = new Image()
    img.src = preview

    const rect = container.getBoundingClientRect()
    const { limitX, limitY } = getLimits(img, rect, zoom)

    return {
      x: Math.min(limitX, Math.max(-limitX, x)),
      y: Math.min(limitY, Math.max(-limitY, y)),
    }
  }

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      if (!dragging) return

      const newPos = {
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      }

      setPosition(clampPosition(newPos.x, newPos.y))
    }

    function handleUp() {
      setDragging(false)
    }

    window.addEventListener("mousemove", handleMove)
    window.addEventListener("mouseup", handleUp)

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
    }
  }, [dragging, zoom, preview])

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

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
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

  function handleZoom(e: React.WheelEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsInteracting(true)

    const newZoom = Math.min(Math.max(zoom + e.deltaY * -0.001, 1), 3)
    setZoom(newZoom)
    setPosition(prev => clampPosition(prev.x, prev.y))
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
      formData.append("postador", user.username)

      if (preview) {
        const img = new Image()
        img.src = preview

        await new Promise(resolve => {
          img.onload = resolve
        })

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!

        const width = 1080
        const height = 1080

        canvas.width = width
        canvas.height = height

        const imgRatio = img.width / img.height
        const containerRatio = width / height

        let baseWidth = width
        let baseHeight = height

        if (imgRatio > containerRatio) {
          baseHeight = height
          baseWidth = baseHeight * imgRatio
        } else {
          baseWidth = width
          baseHeight = baseWidth / imgRatio
        }

        const scaledWidth = baseWidth * zoom
        const scaledHeight = baseHeight * zoom

        const drawX = (width - scaledWidth) / 2 + position.x
        const drawY = (height - scaledHeight) / 2 + position.y

        ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight)

        const blob: Blob = await new Promise(resolve =>
          canvas.toBlob(b => resolve(b as Blob), "image/jpeg", 0.9)
        )

        const finalFile = new File([blob], "post.jpg", { type: "image/jpeg" })
        formData.append("image", finalFile)
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        const data = await res.json()
        return toast.error(data.error || "Erro")
      }

      toast.success("Post criado com sucesso")
      router.push("/intern/feed")
    } catch {
      toast.error("Erro ao publicar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F5F7] text-black flex flex-col">

      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <button className="text-sm text-neutral-500 hover:text-black transition">Voltar</button>
        <h1 className="text-sm font-semibold tracking-wide">Nova postagem</h1>
        <div className="w-10" />
      </header>

      <section className="flex-1 w-full max-w-lg mx-auto px-5 py-8 space-y-8">

        <div className="rounded-3xl bg-white border border-neutral-200 p-5 shadow-sm">
          <textarea
            placeholder="Compartilhe algo..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-transparent outline-none text-sm resize-none h-24"
          />
        </div>

        <div className="rounded-3xl bg-white border border-neutral-200 p-4 shadow-sm space-y-4">

          {!preview && (
            <>
              <div className="rounded-3xl overflow-hidden bg-black border">
                <video ref={videoRef} autoPlay playsInline className="w-full h-72 object-cover" />
              </div>

              <div className="flex gap-3">
                <button onClick={takePhoto} @change=“takePhoto” className="flex-1 py-3 rounded-2xl bg-black text-white text-sm">
                  Tirar foto
                </button>

                <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-3 rounded-2xl border text-sm">
                  Galeria
                </button>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </>
          )}

          {preview && (
            <>
              <div
                ref={containerRef}
                className="relative rounded-3xl overflow-hidden bg-black border select-none"
                style={{ aspectRatio }}
                onWheel={handleZoom}
                onMouseDown={(e) => {
                  e.preventDefault()
                  setDragging(true)
                  setIsInteracting(true)

                  dragStart.current = {
                    x: e.clientX - position.x,
                    y: e.clientY - position.y,
                  }
                }}
              >
                <img
                  src={preview}
                  draggable={false}
                  className="absolute top-0 left-0 w-full h-full object-cover cursor-grab active:cursor-grabbing pointer-events-none"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  }}
                />

                {isInteracting && (
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="border border-white/30" />
                    ))}
                  </div>
                )}
              </div>

              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => {
                  const newZoom = Number(e.target.value)
                  setZoom(newZoom)
                  setPosition(prev => clampPosition(prev.x, prev.y))
                }}
                className="w-full"
              />

              <button onClick={resetPhoto} className="text-xs text-red-500">
                Remover imagem
              </button>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

      </section>

      <footer className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
        <button onClick={() => window.history.back()} className="flex-1 py-3 border rounded-2xl text-sm">
          Cancelar
        </button>

        <button onClick={handleSubmit} disabled={loading} className="flex-1 py-3 bg-black text-white rounded-2xl text-sm">
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </footer>

    </main>
  )
}
