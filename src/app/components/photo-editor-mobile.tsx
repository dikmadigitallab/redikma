"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { toast } from "sonner"
import { FaCamera, FaImages } from "react-icons/fa"
import { RxReset, RxRotateCounterClockwise } from "react-icons/rx"
import { TbFlipHorizontal, TbFlipVertical } from "react-icons/tb"
import { VscEye, VscEyeClosed } from "react-icons/vsc"
import { Undo2, Redo2, X, SlidersHorizontal, Image as ImageIcon, Crop, ZoomIn } from "lucide-react"

interface EditorProps {
  imageFile: File | null
  onSave: (blob: Blob) => void
  onCancel: () => void
  aspectRatio?: string
}

type Settings = {
  brightness: number
  contrast: number
  saturation: number
  temperature: number
  sharpness: number
  exposure: number
  vibrance: number
}

type FilterPreset = {
  name: string
  label: string
  settings: Partial<Settings>
}

type ActiveTool = "adjust" | "filters" | "crop"

type AspectRatioOption = {
  label: string
  value: string
}

const ASPECT_RATIOS: AspectRatioOption[] = [
  { label: "Livre", value: "free" },
  { label: "1:1", value: "1/1" },
  { label: "4:3", value: "4/3" },
  { label: "3:4", value: "3/4" },
  { label: "16:9", value: "16/9" },
  { label: "9:16", value: "9/16" },
]

const FILTER_PRESETS: FilterPreset[] = [
  { name: "original", label: "Original", settings: {} },
  { name: "clarity", label: "Clarity", settings: { contrast: 130, sharpness: 3, brightness: 105 } },
  { name: "warm", label: "Warm", settings: { temperature: 25, saturation: 120, brightness: 105 } },
  { name: "cool", label: "Cool", settings: { temperature: -25, contrast: 120, brightness: 95 } },
  { name: "vintage", label: "Vintage", settings: { saturation: 60, contrast: 115, temperature: 15 } },
  { name: "noir", label: "Noir", settings: { saturation: 0, contrast: 140, brightness: 105 } },
  { name: "fade", label: "Fade", settings: { contrast: 80, saturation: 70, brightness: 110 } },
  { name: "vibrant", label: "Vibrant", settings: { saturation: 150, contrast: 110, vibrance: 30 } },
]

const DEFAULT_SETTINGS: Settings = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  temperature: 0,
  sharpness: 0,
  exposure: 0,
  vibrance: 0,
}

const MAX_HISTORY = 20

export function Editor({
  imageFile,
  onSave,
  onCancel,
  aspectRatio = "4/3",
}: EditorProps) {
  const preview = useMemo(() => {
    if (!imageFile) return ""
    return URL.createObjectURL(imageFile)
  }, [imageFile])

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [history, setHistory] = useState<Settings[]>([DEFAULT_SETTINGS])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [selectedFilter, setSelectedFilter] = useState("original")
  const [cropAspect, setCropAspect] = useState(aspectRatio)
  const [rotation, setRotation] = useState(0)
  const [flipX, setFlipX] = useState(false)
  const [flipY, setFlipY] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [showSourceOptions, setShowSourceOptions] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("environment")
  const [showOverlay, setShowOverlay] = useState(false)
  const [overlayTool, setOverlayTool] = useState<ActiveTool>("adjust")

  const dragStart = useRef({ x: 0, y: 0 })
  const pinchStart = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const currentSettings = settings

  const pushHistory = useCallback((newSettings: Settings) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1)
      const next = [...trimmed, newSettings]
      if (next.length > MAX_HISTORY) next.shift()
      return next
    })
    setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1))
  }, [historyIndex])

  const updateSetting = useCallback((key: keyof Settings, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  const commitSettings = useCallback(() => {
    setSettings((prev) => {
      pushHistory(prev)
      return prev
    })
  }, [pushHistory])

  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    setSettings(history[newIndex])
    setSelectedFilter("original")
  }, [historyIndex, history])

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    setSettings(history[newIndex])
    setSelectedFilter("original")
  }, [historyIndex, history])

  const resetAll = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
    setRotation(0)
    setFlipX(false)
    setFlipY(false)
    setSelectedFilter("original")
    setCropAspect(aspectRatio)
    setHistory([DEFAULT_SETTINGS])
    setHistoryIndex(0)
  }, [aspectRatio])

  const applyFilter = useCallback((preset: FilterPreset) => {
    setSelectedFilter(preset.name)
    const merged = { ...DEFAULT_SETTINGS, ...preset.settings }
    setSettings(merged)
    pushHistory(merged)
  }, [pushHistory])

  const handleZoom = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setIsInteracting(true)
    setZoom((prev) => Math.min(Math.max(prev + e.deltaY * -0.001, 1), 3))
  }, [])

  const getLimits = useCallback((img: HTMLImageElement, container: DOMRect, scale: number) => {
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
  }, [])

  const clampPosition = useCallback((x: number, y: number) => {
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
  }, [zoom, preview, getLimits])

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      if (!dragging) return
      setPosition(clampPosition(e.clientX - dragStart.current.x, e.clientY - dragStart.current.y))
    }
    function handleUp() {
      setDragging(false)
      setTimeout(() => setIsInteracting(false), 1000)
    }
    if (dragging) {
      window.addEventListener("mousemove", handleMove)
      window.addEventListener("mouseup", handleUp)
    }
    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
    }
  }, [dragging, clampPosition])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchStart.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
    } else if (e.touches.length === 1) {
      setDragging(true)
      setIsInteracting(true)
      dragStart.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      }
    }
  }, [position])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      setZoom((prev) => Math.min(Math.max(prev + (dist - pinchStart.current) * 0.008, 1), 3))
      pinchStart.current = dist
    } else if (e.touches.length === 1 && dragging) {
      setPosition(clampPosition(e.touches[0].clientX - dragStart.current.x, e.touches[0].clientY - dragStart.current.y))
    }
  }, [dragging, clampPosition])

  const handleTouchEnd = useCallback(() => {
    setDragging(false)
    setTimeout(() => setIsInteracting(false), 1000)
  }, [])

  const handleSelectImage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const imageUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      canvas.width = img.width
      canvas.height = img.height
      const isFrontCamera = event.target.capture === "user" || cameraFacing === "user"
      if (isFrontCamera) {
        ctx.translate(canvas.width, 0)
        ctx.scale(-1, 1)
      }
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((blob) => { if (blob) onSave(blob) }, "image/jpeg", 0.95)
      URL.revokeObjectURL(imageUrl)
    }
    img.src = imageUrl
    setShowSourceOptions(false)
    event.target.value = ""
  }, [cameraFacing, onSave])

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview) }
  }, [preview])

  const getFilterString = useCallback((s?: Settings) => {
    const st = s || currentSettings
    return `brightness(${st.brightness}%) contrast(${st.contrast}%) saturate(${st.saturation}%) blur(${
      st.sharpness < 0 ? Math.abs(st.sharpness) / 10 : 0
    }px)`
  }, [currentSettings])

  const generateResult = async () => {
    if (!preview) return
    setLoading(true)
    try {
      const img = new Image()
      img.src = preview
      await new Promise((resolve) => { img.onload = resolve })

      const outSize = 1080
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      canvas.width = outSize
      canvas.height = outSize

      ctx.filter = getFilterString()

      const imgRatio = img.width / img.height
      let baseWidth = outSize, baseHeight = outSize
      if (imgRatio > 1) {
        baseHeight = outSize
        baseWidth = baseHeight * imgRatio
      } else {
        baseWidth = outSize
        baseHeight = baseWidth / imgRatio
      }

      const scaledWidth = baseWidth * zoom
      const scaledHeight = baseHeight * zoom
      const scaleX = outSize / (containerRef.current?.offsetWidth || outSize)
      const scaleY = outSize / (containerRef.current?.offsetHeight || outSize)
      const centerX = (outSize - scaledWidth) / 2 + position.x * scaleX
      const centerY = (outSize - scaledHeight) / 2 + position.y * scaleY

      ctx.save()
      ctx.translate(outSize / 2, outSize / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1)
      ctx.translate(-outSize / 2, -outSize / 2)
      ctx.drawImage(img, centerX, centerY, scaledWidth, scaledHeight)
      ctx.restore()

      if (currentSettings.temperature !== 0) {
        ctx.filter = "none"
        ctx.globalCompositeOperation = currentSettings.temperature > 0 ? "overlay" : "soft-light"
        ctx.fillStyle = currentSettings.temperature > 0
          ? `rgba(255, 150, 0, ${Math.abs(currentSettings.temperature) / 200})`
          : `rgba(0, 150, 255, ${Math.abs(currentSettings.temperature) / 200})`
        ctx.fillRect(0, 0, outSize, outSize)
      }

      const outputCanvas = document.createElement("canvas")
      const outCtx = outputCanvas.getContext("2d")!
      const [aw, ah] = cropAspect === "free" ? [outSize, outSize] : cropAspect.split("/").map(Number)
      const cropSize = outSize
      const cropW = aw >= ah ? cropSize : cropSize * (aw / ah)
      const cropH = aw >= ah ? cropSize * (ah / aw) : cropSize
      outputCanvas.width = cropW
      outputCanvas.height = cropH
      outCtx.drawImage(canvas, (outSize - cropW) / 2, (outSize - cropH) / 2, cropW, cropH, 0, 0, cropW, cropH)

      outputCanvas.toBlob((blob) => { if (blob) onSave(blob); setLoading(false) }, "image/jpeg", 0.9)
    } catch {
      toast.error("Erro ao processar imagem")
      setLoading(false)
    }
  }

  const adjustmentControls = [
    { label: "Brilho", key: "brightness" as const, min: 50, max: 150 },
    { label: "Contraste", key: "contrast" as const, min: 50, max: 150 },
    { label: "Saturação", key: "saturation" as const, min: 0, max: 200 },
    { label: "Temperatura", key: "temperature" as const, min: -50, max: 50 },
    { label: "Nitidez", key: "sharpness" as const, min: -10, max: 10 },
    { label: "Exposição", key: "exposure" as const, min: -50, max: 50 },
    { label: "Vibração", key: "vibrance" as const, min: 0, max: 100 },
  ]

  const previewFilter = showOriginal ? "none" : getFilterString()

  function openTool(tool: ActiveTool) {
    setOverlayTool(tool)
    setShowOverlay(true)
  }

  return (
    <div className="flex flex-col gap-2 w-full bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="px-4 pt-3 pb-0 flex items-center justify-between">
        <h2 className="text-xs font-bold tracking-wide">Editor</h2>
        <div className="flex items-center gap-1">
          <button type="button" onClick={undo} disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg hover:bg-[var(--primary-10)] disabled:opacity-30 transition" title="Desfazer">
            <Undo2 size={14} />
          </button>
          <button type="button" onClick={redo} disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg hover:bg-[var(--primary-10)] disabled:opacity-30 transition" title="Refazer">
            <Redo2 size={14} />
          </button>
          <button type="button" onClick={() => setShowOriginal((prev) => !prev)}
            onMouseDown={() => setShowOriginal(true)}
            onMouseUp={() => setShowOriginal(false)}
            onMouseLeave={() => setShowOriginal(false)}
            onTouchStart={() => setShowOriginal(true)}
            onTouchEnd={() => setShowOriginal(false)}
            className={`p-1.5 rounded-lg hover:bg-[var(--primary-10)] transition ${showOriginal ? "bg-neutral-200" : ""}`}
            title="Comparar original">
            {showOriginal ? <VscEyeClosed size={14} /> : <VscEye size={14} />}
          </button>
          <button type="button" onClick={resetAll} className="p-1.5 rounded-lg hover:bg-[var(--primary-10)] transition" title="Resetar tudo">
            <RxReset size={14} />
          </button>
        </div>
      </div>

      <div className="px-3">
        <div
          ref={containerRef}
          className="relative rounded-2xl overflow-hidden bg-black border select-none touch-none"
          style={{ aspectRatio }}
          onWheel={handleZoom}
          onMouseDown={(e) => {
            if (showOverlay) return
            e.preventDefault()
            setDragging(true)
            setIsInteracting(true)
            dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y }
          }}
          onTouchStart={(e) => { if (!showOverlay) handleTouchStart(e) }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            style={{
              width: "100%", height: "100%",
              filter: previewFilter,
              position: "relative",
              transform: `rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
            }}
          >
            <img src={preview || ""}
              className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transition: dragging ? "none" : "transform 0.1s ease-out",
              }}
              alt="preview" />
            <div className="absolute inset-0 pointer-events-none"
              style={{
                backgroundColor: currentSettings.temperature > 0
                  ? `rgba(255, 165, 0, ${Math.abs(currentSettings.temperature) / 200})`
                  : `rgba(0, 150, 255, ${Math.abs(currentSettings.temperature) / 200})`,
                mixBlendMode: currentSettings.temperature > 0 ? "overlay" : "soft-light",
              }}
            />
          </div>

          {showOverlay && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-8 pb-3 px-3 z-10 rounded-b-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-[10px] font-bold uppercase tracking-wider">
                  {overlayTool === "adjust" ? "Ajustes" : overlayTool === "filters" ? "Filtros" : "Cortar"}
                </span>
                <button onClick={() => setShowOverlay(false)}
                  className="p-1 rounded-full bg-white/20 text-white hover:bg-white/30 transition">
                  <X size={14} />
                </button>
              </div>

              {overlayTool === "adjust" && (
                <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                  {adjustmentControls.map((ctrl) => (
                    <div key={ctrl.key} className="flex flex-col gap-0.5">
                      <div className="flex justify-between text-[9px] font-bold uppercase text-white/60">
                        <span>{ctrl.label}</span>
                        <span>{currentSettings[ctrl.key]}</span>
                      </div>
                      <input type="range" min={ctrl.min} max={ctrl.max}
                        value={currentSettings[ctrl.key]}
                        onChange={(e) => updateSetting(ctrl.key, Number(e.target.value))}
                        onMouseUp={commitSettings}
                        onTouchEnd={commitSettings}
                        className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              {overlayTool === "filters" && (
                <div className="grid grid-cols-4 gap-1.5 max-h-[180px] overflow-y-auto">
                  {FILTER_PRESETS.map((preset) => (
                    <button key={preset.name} type="button"
                      onClick={() => { applyFilter(preset); setShowOverlay(false) }}
                      className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition ${
                        selectedFilter === preset.name ? "ring-2 ring-white bg-white/20" : ""
                      }`}
                    >
                      <div className="w-full aspect-square rounded-md border border-white/10 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${preview || ""})`,
                          filter: `brightness(${(preset.settings.brightness ?? 100)}%) contrast(${(preset.settings.contrast ?? 100)}%) saturate(${(preset.settings.saturation ?? 100)}%)`,
                        }}
                      />
                      <span className="text-[9px] font-semibold text-white/80 truncate w-full text-center">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {overlayTool === "crop" && (
                <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                  <div>
                    <label className="text-[9px] font-bold uppercase text-white/60 mb-1 block">Proporção</label>
                    <div className="flex flex-wrap gap-1">
                      {ASPECT_RATIOS.map((ar) => (
                        <button key={ar.value} type="button" onClick={() => setCropAspect(ar.value)}
                          className={`px-2.5 py-1 text-[10px] font-semibold rounded-md border transition ${
                            cropAspect === ar.value
                              ? "bg-white text-black border-white"
                              : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20"
                          }`}>
                          {ar.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => setRotation((prev) => (prev + 90) % 360)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-md border border-white/20 bg-white/10 text-white/80 hover:bg-white/20 transition">
                      <RxRotateCounterClockwise size={12} />
                      Rotacionar
                    </button>
                    <button type="button" onClick={() => setFlipX((prev) => !prev)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-md border transition ${
                        flipX ? "bg-white text-black border-white" : "border-white/20 bg-white/10 text-white/80 hover:bg-white/20"
                      }`}>
                      <TbFlipHorizontal size={12} />
                      H
                    </button>
                    <button type="button" onClick={() => setFlipY((prev) => !prev)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-semibold rounded-md border transition ${
                        flipY ? "bg-white text-black border-white" : "border-white/20 bg-white/10 text-white/80 hover:bg-white/20"
                      }`}>
                      <TbFlipVertical size={12} />
                      V
                    </button>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[9px] font-bold uppercase text-white/60">
                      <span>Zoom</span>
                      <span>{zoom.toFixed(1)}x</span>
                    </div>
                    <input type="range" min={1} max={3} step={0.01} value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {showOverlay && overlayTool === "crop" && (
            <div className="absolute inset-[12%] border-2 border-white/70 rounded-lg pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
          )}

          {isInteracting && !showOverlay && (
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          )}

          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none">
            {zoom.toFixed(1)}x
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 px-3">
        <button type="button" onClick={() => openTool("adjust")}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border transition ${
            showOverlay && overlayTool === "adjust"
              ? "bg-black text-white border-black"
              : "bg-white text-[var(--primary)] border-[var(--primary)] hover:border-neutral-400"
          }`}>
          <SlidersHorizontal size={16} />
          <span className="text-[9px] font-bold">Ajustes</span>
        </button>
        <button type="button" onClick={() => openTool("filters")}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border transition ${
            showOverlay && overlayTool === "filters"
              ? "bg-black text-white border-black"
              : "bg-white text-[var(--primary)] border-[var(--primary)] hover:border-neutral-400"
          }`}>
          <ImageIcon size={16} />
          <span className="text-[9px] font-bold">Filtros</span>
        </button>
        <button type="button" onClick={() => openTool("crop")}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border transition ${
            showOverlay && overlayTool === "crop"
              ? "bg-black text-white border-black"
              : "bg-white text-[var(--primary)] border-[var(--primary)] hover:border-neutral-400"
          }`}>
          <Crop size={16} />
          <span className="text-[9px] font-bold">Cortar</span>
        </button>
        <button type="button" onClick={() => openTool("crop")}
          className="flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border border-[var(--primary)] bg-white text-[var(--primary)] hover:border-neutral-400 transition">
          <ZoomIn size={16} />
          <span className="text-[9px] font-bold">{zoom.toFixed(1)}x</span>
        </button>
      </div>

      <div className="px-3 pb-3 space-y-2">
        <div className="relative">
          <button type="button" onClick={() => setShowSourceOptions((prev) => !prev)}
            className="w-full py-2.5 text-xs font-bold border rounded-2xl hover:bg-neutral-50 transition">
            Escolher foto
          </button>
          {showSourceOptions && (
            <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-[var(--primary)] rounded-2xl shadow-xl p-2 z-50">
              <button type="button" onClick={() => { setShowSourceOptions(false); cameraInputRef.current?.click() }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-50 transition text-sm font-semibold">
                <FaCamera className="text-[var(--primary)]" />
                Câmera
              </button>
              <button type="button" onClick={() => { setShowSourceOptions(false); galleryInputRef.current?.click() }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-50 transition text-sm font-semibold">
                <FaImages className="text-[var(--primary)]" />
                Galeria
              </button>
            </div>
          )}
          <input ref={cameraInputRef} type="file" accept="image/*" capture={cameraFacing} onChange={handleSelectImage} className="hidden" />
          <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleSelectImage} className="hidden" />
        </div>

        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 py-3 text-sm font-bold border rounded-2xl hover:bg-neutral-50 transition">
            Cancelar
          </button>
          <button onClick={generateResult} disabled={loading}
            className="flex-1 py-3 text-sm font-bold bg-black text-white rounded-2xl disabled:opacity-50 transition">
            {loading ? "Salvando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  )
}
