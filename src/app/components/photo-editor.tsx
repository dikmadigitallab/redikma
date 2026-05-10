"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { GrPowerReset } from "react-icons/gr";

interface EditorProps {
  imageFile: File | null;
  onSave: (blob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: string;
}

type Settings = {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  sharpness: number;
};

export function Editor({ imageFile, onSave, onCancel, aspectRatio = "1/1" }: EditorProps) {




  const preview = useMemo(() => {
    if (!imageFile) return ''
    return URL.createObjectURL(imageFile)
  }, [imageFile])
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)
  const [loading, setLoading] = useState(false)

  // Novos estados para ajustes de imagem
  const [settings, setSettings] = useState<Settings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    temperature: 0,
    sharpness: 0,
  })

  const dragStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)




  // Adicione este estado junto com os demais useState
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment")

  // Adicione esta função dentro do componente
  const toggleCamera = () => {
    setCameraFacing((prev) =>
      prev === "environment" ? "user" : "environment"
    )
  }

  // Adicione este useEffect para reiniciar a câmera quando o modo mudar
  useEffect(() => {
    let stream: MediaStream | null = null

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: cameraFacing },
          },
          audio: false,
        })

        const video = document.querySelector("video") as HTMLVideoElement | null
        if (video) {
          video.srcObject = stream
          await video.play()
        }
      } catch (error) {
        console.error("Erro ao acessar câmera:", error)
        toast.error("Não foi possível acessar a câmera")
      }
    }

    startCamera()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [cameraFacing])
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  // Lógica de limites e movimento (mantida do seu código original)
  function getLimits(img: HTMLImageElement, container: DOMRect, scale: number) {
    const imgRatio = img.width / img.height
    const containerRatio = container.width / container.height
    let baseWidth = container.width, baseHeight = container.height
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
      const newPos = { x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y }
      setPosition(clampPosition(newPos.x, newPos.y))
    }
    function handleUp() { setDragging(false); setTimeout(() => setIsInteracting(false), 1000) }
    if (dragging) {
      window.addEventListener("mousemove", handleMove)
      window.addEventListener("mouseup", handleUp)
    }
    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
    }
  }, [dragging, zoom, preview])

  const handleZoom = (e: React.WheelEvent) => {
    e.preventDefault()
    setIsInteracting(true)
    const newZoom = Math.min(Math.max(zoom + e.deltaY * -0.001, 1), 3)
    setZoom(newZoom)
    setPosition(prev => clampPosition(prev.x, prev.y))
  }

  // Gera a string de filtro CSS baseada nos estados
  const getFilterString = () => {
    return `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%) blur(${settings.sharpness < 0 ? Math.abs(settings.sharpness) / 10 : 0}px)`
  }

  const generateResult = async () => {
    if (!preview) return
    setLoading(true)

    try {
      const img = new Image()
      img.src = preview
      await new Promise(resolve => (img.onload = resolve))

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const size = 1080
      canvas.width = size
      canvas.height = size

      // Aplica os filtros ao contexto do Canvas
      ctx.filter = getFilterString();

      const imgRatio = img.width / img.height
      let baseWidth = size, baseHeight = size
      if (imgRatio > 1) {
        baseHeight = size
        baseWidth = baseHeight * imgRatio
      } else {
        baseWidth = size
        baseHeight = baseWidth / imgRatio
      }

      const scaledWidth = baseWidth * zoom
      const scaledHeight = baseHeight * zoom
      const drawX = (size - scaledWidth) / 2 + (position.x * (size / containerRef.current!.offsetWidth))
      const drawY = (size - scaledHeight) / 2 + (position.y * (size / containerRef.current!.offsetHeight))

      // Desenha a imagem com filtros
      ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight)

      // Overlay de Temperatura (Warm/Cold)
      if (settings.temperature !== 0) {
        ctx.filter = 'none'; // Desativa filtros para o overlay
        ctx.globalCompositeOperation = settings.temperature > 0 ? 'overlay' : 'soft-light';
        ctx.fillStyle = settings.temperature > 0 ? `rgba(255, 150, 0, ${Math.abs(settings.temperature) / 200})` : `rgba(0, 150, 255, ${Math.abs(settings.temperature) / 200})`;
        ctx.fillRect(0, 0, size, size);
      }

      canvas.toBlob((blob) => {
        if (blob) onSave(blob)
        setLoading(false)
      }, "image/jpeg", 0.9)
    } catch (err) {
      toast.error("Erro ao processar imagem")
      setLoading(false)
    }
  }

  const controls = [
    { label: 'Brilho', key: 'brightness', min: 50, max: 150 },
    { label: 'Contraste', key: 'contrast', min: 50, max: 150 },
    { label: 'Saturação', key: 'saturation', min: 0, max: 200 },
    { label: 'Temperatura', key: 'temperature', min: -50, max: 50 },
  ]

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto bg-white p-4 rounded-3xl shadow-xl">
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden bg-black border select-none touch-none"
        style={{ aspectRatio }}
        onWheel={handleZoom}
        onMouseDown={(e) => {
          e.preventDefault(); setDragging(true); setIsInteracting(true);
          dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
        }}
      >

  



        <div style={{
          width: '100%', height: '100%',
          filter: getFilterString(),
          position: 'relative'
        }}>
          <img
            src={preview || ""}
            className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transition: dragging ? "none" : "transform 0.1s ease-out"
            }}
          />
          {/* Overlay de temperatura visual */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundColor: settings.temperature > 0 ? `rgba(255, 165, 0, ${Math.abs(settings.temperature) / 200})` : `rgba(0, 150, 255, ${Math.abs(settings.temperature) / 200})`,
            mixBlendMode: settings.temperature > 0 ? 'overlay' : 'soft-light'
          }} />
        </div>

        {isInteracting && (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
            {Array.from({ length: 9 }).map((_, i) => <div key={i} className="border border-white/20" />)}
          </div>
        )}
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[300px] px-2">
        {/* Zoom Control */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-bold uppercase text-neutral-400">
            <span>Zoom</span>
            <span>{zoom.toFixed(1)}x</span>
          </div>
          <input type="range" min={1} max={3} step={0.01} value={zoom}
            onChange={(e) => { setZoom(Number(e.target.value)); setPosition(prev => clampPosition(prev.x, prev.y)) }}
            className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-black"
          />
        </div>

        {/* Dynamic Controls */}
        {controls.map((ctrl) => (
          <div key={ctrl.key} className="flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-bold uppercase text-neutral-400">
              <span>{ctrl.label}</span>
              <span>{settings[ctrl.key as keyof Settings]}</span>
            </div>
            <input
              type="range"
              min={ctrl.min}
              max={ctrl.max}
              value={settings[ctrl.key as keyof Settings]}
              onChange={(e) => setSettings(prev => ({ ...prev, [ctrl.key]: Number(e.target.value) }))}
              className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>
        ))}
      </div>

{/*       
         <button
          type="button"
          onClick={toggleCamera}
          className="w-full py-3 text-sm font-bold border rounded-2xl hover:bg-neutral-50 transition"
        >
          {cameraFacing === "environment"
            ? "Usar câmera frontal"
            : "Usar câmera traseira"}
        </button>


 */}
      <div className="flex gap-2 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 text-sm font-bold border rounded-2xl hover:bg-neutral-50 transition">
          Cancelar
        </button>
        <button onClick={generateResult} disabled={loading} className="flex-1 py-3 text-sm font-bold bg-black text-white rounded-2xl disabled:opacity-50 transition">
          {loading ? "Salvando..." : "Confirmar"}
        </button>

       
      </div>
    </div>
  )
}