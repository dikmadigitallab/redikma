"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";

interface EditorDesktopProps {
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

export function EditorDesktop({
  imageFile,
  onSave,
  onCancel,
  aspectRatio = "1/1",
}: EditorDesktopProps) {


const [preview, setPreview] = useState<string | null>(null);

useEffect(() => {
  if (!imageFile) {
    setPreview(null);
    return;
  }

  const objectUrl = URL.createObjectURL(imageFile);

  setPreview(objectUrl);

  return () => {
    URL.revokeObjectURL(objectUrl);
  };
}, [imageFile]);


  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState<Settings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    temperature: 0,
    sharpness: 0,
  });

  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reseta os controles para os valores padrão sempre que a imagem muda
  useEffect(() => {
    if (!imageFile) return;

    const timeoutId = window.setTimeout(() => {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setSettings({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        temperature: 0,
        sharpness: 0,
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [imageFile]);



  useEffect(() => {
    function handleMove(e: MouseEvent) {
      if (!dragging) return;
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }

    function handleUp() {
      setDragging(false);
    }

    if (dragging) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((prev) => Math.min(Math.max(prev + e.deltaY * -0.001, 1), 3));
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  function getFilterString() {
    return `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;
  }

  async function generateResult() {
    if (!preview) return;
    setLoading(true);

    try {
      const img = new window.Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = preview;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error();

      const size = 1080;
      canvas.width = size;
      canvas.height = size;

      const imgRatio = img.width / img.height;
      let drawWidth = size;
      let drawHeight = size;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > 1) {
        drawWidth = size * imgRatio;
        offsetX = (size - drawWidth) / 2;
      } else {
        drawHeight = size / imgRatio;
        offsetY = (size - drawHeight) / 2;
      }

      const containerWidth = containerRef.current?.clientWidth || size;
      const scaleFactor = size / containerWidth;

      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.translate(position.x * scaleFactor, position.y * scaleFactor);
      ctx.scale(zoom, zoom);
      ctx.translate(-size / 2, -size / 2);

      ctx.filter = getFilterString();
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      ctx.restore();

      canvas.toBlob(
        (blob) => {
          setLoading(false);
          if (blob) onSave(blob);
        },
        "image/jpeg",
        0.9,
      );
    } catch (error) {
      toast.error("Erro ao processar imagem");
      console.error(error);
      setLoading(false);
    }
  }

  if (!imageFile || !preview) return null;

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto bg-white p-4 rounded-3xl shadow-xl">
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden bg-black border select-none touch-none"
        style={{ aspectRatio }}
        onMouseDown={(e) => {
          setDragging(true);
          dragStart.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
          };
        }}
      >
        <Image
          src={preview}
          alt="Preview"
          fill
          unoptimized
          sizes="100px"
          className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            filter: getFilterString(),
          }}
        />
      </div>

      <div className="space-y-4 py-2">
        {[
          { label: "Brilho", key: "brightness" },
          { label: "Contraste", key: "contrast" },
          { label: "Saturação", key: "saturation" },
        ].map((item) => (
          <div key={item.key} className="flex flex-col gap-1">
            <label className="text-xs font-bold text-neutral-600">
              {item.label} ({settings[item.key as keyof Settings]}%)
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={settings[item.key as keyof Settings]}
              onChange={(e) =>
                setSettings({ ...settings, [item.key]: Number(e.target.value) })
              }
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 text-sm font-bold border rounded-2xl hover:bg-neutral-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={generateResult}
          disabled={loading}
          className="flex-1 py-3 text-sm font-bold bg-black text-white rounded-2xl disabled:opacity-50 transition-opacity"
        >
          {loading ? "Processando..." : "Confirmar"}
        </button>
      </div>
    </div>
  );
}
