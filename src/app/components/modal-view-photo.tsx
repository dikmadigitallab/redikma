"use client"

import { useEffect } from "react"

type Props = {
  image: string | null
  open: boolean
  onClose: () => void
}

export function ImageModal({ image, open, onClose }: Props) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }

    if (open) {
      document.addEventListener("keydown", handleKey)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = "auto"
    }
  }, [open, onClose])

  if (!open || !image) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image}
          alt="preview"
          className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
        />

        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm"
        >
          fechar
        </button>
      </div>
    </div>
  )
}