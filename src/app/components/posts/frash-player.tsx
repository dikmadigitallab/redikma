"use client"

import { useEffect, useRef } from "react"

export function FrashPlayer({ src, muted, onToggleMute }: { src: string; muted: boolean; onToggleMute: () => void }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="relative">
      <video
        ref={ref}
        src={src}
        muted={muted}
        playsInline
        loop
        className="w-full max-h-520px"
        style={{ maxHeight: "520px" }}
      />
      <button
        type="button"
        onClick={onToggleMute}
        className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center bg-black/50 hover:bg-black/70 transition-colors"
        aria-label={muted ? "Ativar som" : "Silenciar"}
      >
        {muted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
        )}
      </button>
    </div>
  )
}
