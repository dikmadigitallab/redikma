"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Editor } from "@/app/components/posts/photo-editor-mobile"
import { ImagePlus, Camera, RefreshCw, Video } from "lucide-react"
import Image from "next/image"
import { MAX_POST_LENGTH } from "@/lib/constantes"

type DurationType = "1h" | "6h" | "12h" | "24h" | "7d" | "30d"

type Props = {
  onRefresh?: () => void
}

export default function CreatePostPage({ onRefresh }: Props) {
  const [text, setText] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null)
  const [showEditor, setShowEditor] = useState(false)

  const [video, setVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [videoDuration, setVideoDuration] = useState(0)

  const [isFixed,] = useState(false)
  const [duration,] = useState<DurationType>("24h")
  const [loading, setLoading] = useState(false)

  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")

  const { data: session } = useSession()
  const router = useRouter()
  const user = session?.user

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const limitWarned = useRef(false)
  
  // Variáveis de controle de câmera e gravação
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  
  const recorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordingRef = useRef(false)
  const canvasRecRef = useRef<{ animFrameId: number } | null>(null)
  
  // NOVO: Trava para evitar conflitos ao abrir a câmera rapidamente
  const isStartingCamera = useRef(false)

  const MAX_RECORDING_SECONDS = 10

  const stopCamera = useCallback(() => {
    if (canvasRecRef.current) {
      cancelAnimationFrame(canvasRecRef.current.animFrameId)
      canvasRecRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop()
    }
    recorderRef.current = null
    setIsRecording(false)
    
    if (videoRef.current && videoRef.current.srcObject) {
      const currentStream = videoRef.current.srcObject as MediaStream
      currentStream.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setStream(null)
  }, [])

  const startCamera = useCallback(async () => {
    // Impede múltiplas execuções simultâneas
    if (isStartingCamera.current) return
    isStartingCamera.current = true

    stopCamera()
    
    try {
      // Aumentado levemente para o hardware liberar a câmera antes de pedir de novo
      await new Promise(resolve => setTimeout(resolve, 300))

      // Tenta pedir áudio e vídeo de uma só vez
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
        audio: true
      })
      setStream(s)
      if (videoRef.current) videoRef.current.srcObject = s
    } catch (err) {
      // Se falhar (ex: usuário recusou microfone), tenta apenas o vídeo
      try {
        const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } }
        })
        setStream(videoOnlyStream)
        if (videoRef.current) videoRef.current.srcObject = videoOnlyStream
      } catch (fallbackErr) {
        toast.error("Erro ao acessar câmera. Verifique as permissões.")
        setShowCamera(false)
      }
    } finally {
      isStartingCamera.current = false
    }
  }, [facingMode, stopCamera])

  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  useEffect(() => {
    if (isRecording) return
    if (showCamera && !finalBlob && !showEditor && !video) {
      if (recorderRef.current && recorderRef.current.state !== "inactive") return
      startCamera()
    }
  }, [showCamera, finalBlob, showEditor, facingMode, isRecording, video, startCamera, stopCamera])

  async function startRecording() {
    if (!stream || recordingRef.current) return

    let recordingStream = stream

    // Se o áudio não estiver presente no stream atual, tenta reconectar
    if (!stream.getAudioTracks().length) {
      stream.getTracks().forEach(t => t.stop())
      setStream(null)
      if (videoRef.current) videoRef.current.srcObject = null

      await new Promise(resolve => setTimeout(resolve, 300))

      try {
        const fullStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: true
        })
        setStream(fullStream)
        if (videoRef.current) videoRef.current.srcObject = fullStream
        recordingStream = fullStream
      } catch {
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: facingMode } }
          })
          setStream(videoStream)
          if (videoRef.current) videoRef.current.srcObject = videoStream
        } catch {
          toast.error("Erro ao acessar câmera para gravação.")
          return
        }
      }
    }

    const chunks: Blob[] = []
    const startTime = Date.now()

    try {
      const recorder = new MediaRecorder(recordingStream)
      recorderRef.current = recorder
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data)
      }
      
      recorder.onerror = () => {
        toast.error("Erro durante a gravação")
        recordingRef.current = false
        stopCamera()
      }
      
      recorder.onstop = () => {
        if (chunks.length === 0) {
          toast.error("Gravação falhou - tente novamente")
          recordingRef.current = false
          stopCamera()
          return
        }

        const rawMime = recorder.mimeType || "video/webm"
        const recordedMime = rawMime.split(";")[0].trim()
        const ext = recordedMime.includes("mp4") ? "mp4" : "webm"
        
        const blob = new Blob(chunks, { type: recordedMime })
        const file = new File([blob], `frash_camera.${ext}`, { type: recordedMime })
        const tempUrl = URL.createObjectURL(file)
        
        const recordedSeconds = (Date.now() - startTime) / 1000
        
        setVideoDuration(recordedSeconds)
        setVideo(file)
        setVideoPreview(tempUrl)
        recordingRef.current = false
        stopCamera()
      }
      
      recorder.start(200)
      recordingRef.current = true
      setIsRecording(true)
      setRecordingTime(0)
      let elapsed = 0
      
      timerRef.current = setInterval(() => {
        elapsed++
        setRecordingTime(elapsed)
        if (elapsed >= MAX_RECORDING_SECONDS) {
          stopRecording()
        }
      }, 1000)
    } catch (e) {
      toast.error("Erro ao iniciar gravação. Verifique as permissões de áudio.")
    }
  }

  function stopRecording() {
    if (canvasRecRef.current) {
      cancelAnimationFrame(canvasRecRef.current.animFrameId)
      canvasRecRef.current = null
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    const r = recorderRef.current
    if (r && r.state !== "inactive") {
      r.stop()
    }
    recorderRef.current = null
    recordingRef.current = false
    setIsRecording(false)
  }

  function toggleCamera() {
    setFacingMode(prev => prev === "environment" ? "user" : "environment")
  }

  async function handleStartRecording() {
    if (recordingRef.current) return
    await startRecording()
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setShowEditor(true)
    stopCamera()
  }

  function handleVideoSelection(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const tempUrl = URL.createObjectURL(file)
    const tempVideo = document.createElement("video")
    tempVideo.preload = "metadata"

    tempVideo.onloadedmetadata = () => {
      const dur = tempVideo.duration
      if (dur > 10) {
        toast.error("O vídeo deve ter no máximo 10 segundos")
        URL.revokeObjectURL(tempUrl)
        return
      }
      setVideo(file)
      setVideoPreview(tempUrl)
      setVideoDuration(dur)
      stopCamera()
    }

    tempVideo.onerror = () => {
      toast.error("Não foi possível ler o vídeo")
      URL.revokeObjectURL(tempUrl)
    }

    tempVideo.src = tempUrl
  }

  function takePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
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

  function resetVideo() {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideo(null)
    setVideoPreview(null)
    setVideoDuration(0)
  }

  async function handleSubmit() {
    if (!user?.id) return toast.error("Usuário não identificado")
    if (!text && !finalBlob && !video) return toast.warning("Adicione conteúdo")
    if (video && videoDuration > 0 && videoDuration < 3) {
      return toast.error("O vídeo precisa ter no mínimo 3 segundos")
    }

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

      if (video) {
        formData.append("video", video)
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro ao publicar" }))
        throw new Error(err.error)
      }

      toast.success("Post criado com sucesso")
      if (onRefresh) onRefresh()
      router.push("/intern/feed")
    } catch (e: any) {
      toast.error(e.message || "Erro ao publicar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="h-dvh bg-[#F5F5F7] text-black flex flex-col overflow-hidden">
      <section className="flex-1 overflow-y-auto overscroll-contain bg-inherit pb-24">
        <div className="w-full max-w-lg mx-auto px-3 sm:px-5 py-4 space-y-4">

          <div className="rounded-2xl bg-white border border-primary p-4 shadow-sm">
            <div className="relative">
            <textarea
              placeholder="Compartilhe algo..."
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
              maxLength={MAX_POST_LENGTH}
              className="w-full bg-transparent outline-none text-sm sm:text-base resize-none h-20 leading-relaxed"
            />
            <div className="absolute bottom-2 right-3 text-xs" style={{ color: text.length >= MAX_POST_LENGTH ? "var(--accent)" : "var(--gray)" }}>
              {text.length}/{MAX_POST_LENGTH}
            </div>
          </div>
          </div>

          <div className="rounded-2xl bg-white border border-primary p-3 shadow-sm space-y-4">

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

            {!showEditor && !finalBlob && !video && (
              <>
                {showCamera ? (
                  <>
                    <div className="relative rounded-2xl overflow-hidden bg-black border border-primary">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted // Na gravação AO VIVO deve ser mutado para não dar eco.
                        className="w-full aspect-3/4 max-h-[40vh] sm:max-h-[60vh] object-cover"
                        style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
                      />
                      {isRecording && (
                        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-white text-xs font-bold tabular-nums">
                            {recordingTime}s / {MAX_RECORDING_SECONDS}s
                          </span>
                        </div>
                      )}
                      <button
                        type="button" 
                        onClick={toggleCamera}
                        className="absolute bottom-4 right-4 p-3 bg-white/20 backdrop-blur-md rounded-full text-white active:scale-90 transition z-10"
                        title="Alternar Câmera"
                      >
                        <RefreshCw size={20} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {!isRecording ? (
                        <>
                          <button
                            type="button"
                            onClick={takePhoto}
                            className="py-3 rounded-2xl bg-black text-white text-sm font-medium active:scale-[0.98] transition"
                          >
                            Tirar foto
                          </button>
                          <button
                            type="button"
                            onClick={handleStartRecording}
                            className="py-3 rounded-2xl border-2 border-red-500 text-red-500 bg-white text-sm font-bold active:scale-[0.98] transition flex items-center justify-center gap-2"
                          >
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            Gravar Frash
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="py-3 rounded-2xl bg-red-600 text-white text-sm font-bold active:scale-[0.98] transition flex items-center justify-center gap-2"
                          >
                            <span className="w-3 h-3 rounded-sm bg-white" />
                            Parar
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCamera(false)}
                            className="py-3 rounded-2xl border border-neutral-300 bg-white text-sm font-medium active:scale-[0.98] transition"
                          >
                            Voltar
                          </button>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center">
                      <ImagePlus size={32} className="text-neutral-400" />
                    </div>
                    <p className="text-sm text-primary text-center max-w-50">
                      Adicione mídia ao seu post
                    </p>
                    <div className="flex flex-col w-full gap-2.5 max-w-65">

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 rounded-2xl bg-black text-white text-sm font-medium active:scale-[0.98] transition flex items-center justify-center gap-2"
                      >
                        <ImagePlus size={18} />
                        Abrir galeria
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowCamera(true)}
                        className="w-full py-3 rounded-2xl border border-neutral-300 bg-white text-sm font-medium active:scale-[0.98] transition flex items-center justify-center gap-2"
                      >
                        <Camera size={18} />
                        Usar câmera
                      </button>

                      <p className="text-xs text-center" style={{ color: "var(--gray)" }}>
                        Vídeos Frash limitados a {MAX_RECORDING_SECONDS}s
                      </p>
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="w-full py-3 rounded-2xl border-2 border-black/20 bg-white text-sm font-medium active:scale-[0.98] transition flex items-center justify-center gap-2"
                      >
                        <Video size={18} />
                        Adicionar Frash
                      </button>
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelection} className="hidden" />
              </>
            )}

            {!showEditor && finalBlob && (
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-primary bg-neutral-100">
                  <Image
                    src={URL.createObjectURL(finalBlob)}
                    alt="Final"
                    width={1000}
                    height={1000}
                    unoptimized
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

            {!showEditor && video && videoPreview && (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-primary bg-black">
                  <video
                    src={videoPreview}
                    controls
                    // O atributo `muted` foi removido daqui para que você possa escutar o áudio do vídeo gravado.
                    className="w-full max-h-[40vh]"
                  />
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
                <div className="flex justify-end items-center px-1">
                  <button onClick={resetVideo} className="text-sm font-medium text-red-500">
                    Remover
                  </button>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="w-full flex gap-3 pt-4 mb-10">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 py-3.5 border border-neutral-300 rounded-2xl text-sm font-medium bg-white active:scale-[0.98] transition"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || (!text && !finalBlob && !video)}
              className="flex-1 py-3.5 bg-black text-white rounded-2xl text-sm font-medium active:scale-[0.98] disabled:opacity-30 transition"
            >
              {loading ? "Publicando..." : "Publicar"}
            </button>
          </div>

        </div>
      </section>
    </main>
  );
}