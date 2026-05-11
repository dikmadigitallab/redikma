"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { toast } from "sonner"

interface EditorDesktopProps {
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
}

export function EditorDesktop({
  imageFile,
  onSave,
  onCancel,
  aspectRatio = "1/1",
}: EditorDesktopProps) {
  const preview = useMemo(() => {
    if (!imageFile) return ""
    return URL.createObjectURL(imageFile)
  }, [imageFile])

  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)
  const [loading, setLoading] = useState(false)

  const [settings, setSettings] = useState<Settings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    temperature: 0,
    sharpness: 0,
  })

  const dragStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  useEffect(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
    setSettings({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      temperature: 0,
      sharpness: 0,
    })
  }, [imageFile])

  function getLimits(
    imgWidth: number,
    imgHeight: number,
    container: DOMRect,
    scale: number
  ) {
    const imgRatio = imgWidth / imgHeight
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

    if (!container || !imageFile) {
      return { x, y }
    }

    const rect = container.getBoundingClientRect()

    if (rect.width === 0 || rect.height === 0) {
      return { x, y }
    }

    const imgWidth = imageFile.size > 0 ? 1000 : 1000
    const imgHeight = 1000

    const { limitX, limitY } = getLimits(
      imgWidth,
      imgHeight,
      rect,
      zoom
    )

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
      setTimeout(() => setIsInteracting(false), 300)
    }

    if (dragging) {
      window.addEventListener("mousemove", handleMove)
      window.addEventListener("mouseup", handleUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleUp)
    }
  }, [dragging, zoom, imageFile])

  function handleZoom(e: React.WheelEvent) {
    e.preventDefault()

    setIsInteracting(true)

    const newZoom = Math.min(
      Math.max(zoom + e.deltaY * -0.001, 1),
      3
    )

    setZoom(newZoom)

    setPosition((prev) =>
      clampPosition(prev.x, prev.y)
    )
  }

  function getFilterString() {
    return `
      brightness(${settings.brightness}%)
      contrast(${settings.contrast}%)
      saturate(${settings.saturation}%)
      blur(${
        settings.sharpness < 0
          ? Math.abs(settings.sharpness) / 10
          : 0
      }px)
    `.trim()
  }

async function generateResult() {
  if (!preview || !containerRef.current) return

  setLoading(true)

  try {
    const img = new Image()

    // Importante para garantir que o object URL seja carregado corretamente
    img.crossOrigin = "anonymous"

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => {
        reject(new Error(`Erro ao carregar imagem: ${preview}`))
      }

      // Define o src somente depois de configurar onload/onerror
      img.src = preview

      // Caso a imagem já esteja em cache
      if (img.complete && img.naturalWidth > 0) {
        resolve()
      }
    })

    if (img.naturalWidth === 0 || img.naturalHeight === 0) {
      throw new Error("Imagem inválida")
    }

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Não foi possível criar o canvas")
    }

    const size = 1080
    canvas.width = size
    canvas.height = size

    // Limpa o canvas
    ctx.clearRect(0, 0, size, size)

    // Aplica filtros
    ctx.filter = getFilterString()

    const imgRatio = img.naturalWidth / img.naturalHeight

    let baseWidth = size
    let baseHeight = size

    if (imgRatio > 1) {
      baseHeight = size
      baseWidth = baseHeight * imgRatio
    } else {
      baseWidth = size
      baseHeight = baseWidth / imgRatio
    }

    const scaledWidth = baseWidth * zoom
    const scaledHeight = baseHeight * zoom

    const containerWidth = containerRef.current.offsetWidth || 1
    const containerHeight = containerRef.current.offsetHeight || 1

    const drawX =
      (size - scaledWidth) / 2 +
      position.x * (size / containerWidth)

    const drawY =
      (size - scaledHeight) / 2 +
      position.y * (size / containerHeight)

    // Desenha a imagem
    ctx.drawImage(
      img,
      drawX,
      drawY,
      scaledWidth,
      scaledHeight
    )

    // Aplica temperatura
    if (settings.temperature !== 0) {
      ctx.filter = "none"
      ctx.globalCompositeOperation =
        settings.temperature > 0
          ? "overlay"
          : "soft-light"

      ctx.fillStyle =
        settings.temperature > 0
          ? `rgba(255, 150, 0, ${
              Math.abs(settings.temperature) / 200
            })`
          : `rgba(0, 150, 255, ${
              Math.abs(settings.temperature) / 200
            })`

      ctx.fillRect(0, 0, size, size)
      ctx.globalCompositeOperation = "source-over"
    }

    // Gera o blob final
    canvas.toBlob(
      (blob) => {
        setLoading(false)

        if (!blob) {
          toast.error("Erro ao gerar imagem")
          return
        }

        onSave(blob)
      },
      "image/jpeg",
      0.9
    )
  } catch (error) {
    console.error("Erro ao processar imagem:", error)
    toast.error("Erro ao processar imagem")
    setLoading(false)
  }
}

  const controls = [
    {
      label: "Brilho",
      key: "brightness",
      min: 50,
      max: 150,
    },
    {
      label: "Contraste",
      key: "contrast",
      min: 50,
      max: 150,
    },
    {
      label: "Saturação",
      key: "saturation",
      min: 0,
      max: 200,
    },
    {
      label: "Temperatura",
      key: "temperature",
      min: -50,
      max: 50,
    },
  ] as const

  if (!imageFile || !preview) return null

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto bg-white p-4 rounded-3xl shadow-xl">
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden bg-black border select-none"
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
        <div
          style={{
            width: "100%",
            height: "100%",
            filter: getFilterString(),
            position: "relative",
          }}
        >
          <img
            src={preview}
            alt="Preview"
            draggable={false}
            className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transition: dragging
                ? "none"
                : "transform 0.1s ease-out",
            }}
          />

          {settings.temperature !== 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundColor:
                  settings.temperature > 0
                    ? `rgba(255, 165, 0, ${
                        Math.abs(settings.temperature) / 200
                      })`
                    : `rgba(0, 150, 255, ${
                        Math.abs(settings.temperature) / 200
                      })`,
                mixBlendMode:
                  settings.temperature > 0
                    ? "overlay"
                    : "soft-light",
              }}
            />
          )}
        </div>

        {isInteracting && (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="border border-white/20"
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[300px] px-2">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-bold uppercase text-neutral-400">
            <span>Zoom</span>
            <span>{zoom.toFixed(1)}x</span>
          </div>

          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => {
              setZoom(Number(e.target.value))
            }}
            className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-black"
          />
        </div>

        {controls.map((ctrl) => (
          <div
            key={ctrl.key}
            className="flex flex-col gap-1"
          >
            <div className="flex justify-between text-[10px] font-bold uppercase text-neutral-400">
              <span>{ctrl.label}</span>
              <span>{settings[ctrl.key]}</span>
            </div>

            <input
              type="range"
              min={ctrl.min}
              max={ctrl.max}
              value={settings[ctrl.key]}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  [ctrl.key]: Number(e.target.value),
                }))
              }
              className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 text-sm font-bold border rounded-2xl hover:bg-neutral-50 transition"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={generateResult}
          disabled={loading}
          className="flex-1 py-3 text-sm font-bold bg-black text-white rounded-2xl disabled:opacity-50 transition"
        >
          {loading ? "Salvando..." : "Confirmar"}
        </button>
      </div>
    </div>
  )
}