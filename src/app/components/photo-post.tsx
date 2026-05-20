'use client'

import Image from 'next/image'
import { MoreHorizontal, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LikeView } from './likes-view'
import { CommentsBox } from './comentarios'

type Liker = {
  id: string
  nome: string
  foto: string
}

type PhotoPostProps = {
  post: {
    id: string
    label: string
    createdAt: string
    authorId: string
    image: string
    author: {
      id: string
      nome: string
      foto: string
      cargo: string
    }
  }
  liked: boolean
  likesCount: number
  commentsCount: number
  currentComment: string
  likers: Liker[]
  onLike: () => void
  onComment: (postId: string) => void
  onCommentChange: (postId: string, text: string) => void
  onOpenImage: (image: string, postId: string, authorId: string) => void
  onShowOptions: (postId: string) => void
}

export function PhotoPost({
  post,
  liked,
  likesCount,
  commentsCount,
  currentComment,
  likers,
  onLike,
  onComment,
  onCommentChange,
  onOpenImage,
  onShowOptions,
}: PhotoPostProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  const handleImageLoad = (e: any) => {
    setImageLoaded(true)
    const img = e.target
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
  }

  const isPortrait = imageDimensions && imageDimensions.height / imageDimensions.width > 1.5

  return (
    <>
      {/* Mobile: story-like fullscreen */}
      <div className="min-h-screen w-full flex flex-col relative overflow-hidden snap-center md:hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(39, 38, 98, 0.08) 0%, rgba(241, 90, 36, 0.06) 100%)',
          }}
        />
        <div className="flex-1 flex items-center justify-center px-4 py-8 relative">
          <div
            className="relative w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(39, 38, 98, 0.3)',
            }}
          >
            <Image
              src={post.image}
              alt="Post de foto"
              fill
              className="object-cover"
              priority
              onLoad={handleImageLoad}
              onClick={() => onOpenImage(post.image, post.id, post.authorId)}
              style={{ cursor: 'pointer' }}
            />

            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 bg-white/10 flex items-center justify-center">
                    {post.author.foto && (post.author.foto.startsWith('http') || post.author.foto.startsWith('/')) ? (
                      <Image
                        src={post.author.foto}
                        alt={post.author.nome}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                        <span className="text-white font-bold text-xs">{post.author.nome.charAt(0).toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-white font-bold text-sm">{post.author.nome}</p>
                    <p className="text-white/70 text-xs">{post.author.cargo}</p>
                  </div>
                </div>
                <button
                  onClick={() => onShowOptions(post.id)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition text-white"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 z-10">
              <div className="space-y-3">
                {post.label && (
                  <p className="text-white text-sm font-medium line-clamp-3">{post.label}</p>
                )}
                <div className="flex gap-4 text-xs text-white/80">
                  <span className="font-semibold">{likesCount} curtidas</span>
                  <span className="font-semibold">{commentsCount} comentários</span>
                </div>
                <button
                  onClick={onLike}
                  className={`w-full py-2.5 rounded-xl font-bold transition transform hover:scale-105 flex items-center justify-center gap-2 ${
                    liked
                      ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/50'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <Image
                    src="/icons/like.png"
                    alt="Curtir"
                    width={18}
                    height={18}
                    className={liked ? 'brightness-0 invert' : 'opacity-80'}
                  />
                  Curtir
                </button>
                <div className="flex gap-2 bg-white/20 rounded-xl p-1.5 backdrop-blur-sm">
                  <input
                    type="text"
                    placeholder="Comentar..."
                    value={currentComment}
                    onChange={(e) => onCommentChange(post.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onComment(post.id)
                    }}
                    className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-sm font-medium"
                  />
                  <button
                    onClick={() => onComment(post.id)}
                    className="p-2 rounded-lg bg-[var(--accent)] text-white hover:shadow-lg transition"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: card layout */}
      <div
        className="hidden md:block relative rounded-2xl border-2 shadow-md overflow-visible transition-all duration-500 hover:shadow-lg hover:border-[var(--accent)]"
        style={{
          backgroundColor: "var(--white)",
          borderColor: "var(--primary)",
          boxShadow: "0 4px 16px rgba(39, 38, 98, 0.08)",
        }}
      >
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 70%, var(--accent) 100%)",
          }}
        />
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => onShowOptions(post.id)}
            className="p-1 rounded-full hover:bg-[var(--primary-10)] transition-colors"
          >
            <MoreHorizontal size={20} />
          </button>
        </div>
        <div className="p-4 md:p-5 space-y-4">
          <div className="flex items-start gap-3 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1 rounded-full opacity-15" style={{ backgroundColor: "var(--secondary)" }} />
              <img
                src={post.author.foto || "/photoProfile/userDefault.png"}
                alt={post.author.nome}
                className="relative w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2"
                style={{ borderColor: "var(--white)" }}
              />
            </div>
            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="text-sm md:text-base font-bold text-[var(--primary)] truncate">
                  {post.author.nome}
                </h3>
                {post.author.cargo && (
                  <span className="text-[10px] md:text-xs font-normal text-[var(--gray)] truncate">
                    • {post.author.cargo}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] md:text-xs font-medium text-[var(--gray)]">
                <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
                <time dateTime={post.createdAt}>
                  {new Date(post.createdAt).toLocaleDateString(undefined, {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </time>
              </div>
            </div>
          </div>

          {post.label && (
            <div className="px-1">
              <p className="text-sm leading-7 whitespace-pre-wrap break-words" style={{ color: "var(--black)" }}>
                {post.label}
              </p>
            </div>
          )}

          <div
            className="rounded-2xl overflow-hidden border"
            style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
          >
            <img
              src={post.image}
              onClick={() => onOpenImage(post.image, post.id, post.authorId)}
              onDoubleClick={onLike}
              className="w-full max-h-[520px] object-cover cursor-pointer transition-opacity hover:opacity-95"
              alt="Imagem da postagem"
            />
          </div>

          <div className="pt-4 border-t space-y-4" style={{ borderColor: "var(--border)" }}>
            <div
              className="flex items-center gap-3 rounded-full px-3 py-2 border-2 relative transition focus-within:border-[var(--accent)]"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--primary)",
              }}
            >
              <img
                src="/photoProfile/userDefault.png"
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                alt="Comentador"
              />
              <input
                id={`comment-input-desk-${post.id}`}
                value={currentComment}
                maxLength={50}
                onChange={(e) => onCommentChange(post.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && currentComment.trim() !== "") {
                    onComment(post.id)
                  }
                }}
                placeholder="Escreva um comentário..."
                className="flex-1 bg-transparent outline-none text-sm pr-12"
                style={{ color: "var(--black)" }}
              />
              {currentComment.trim() !== "" && (
                <button
                  type="button"
                  onClick={() => onComment(post.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-[var(--accent)] transition-all duration-200 hover:shadow-md hover:scale-110 active:scale-95 focus:outline-none"
                >
                  <Send size={16} color="white" className="translate-x-[1px] -translate-y-[0.5px]" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-6 relative overflow-visible">
              <div
                className="relative"
                onMouseEnter={() => {
                  if (!isTouchDevice && likesCount > 0) setTooltipOpen(true)
                }}
                onMouseLeave={() => {
                  if (!isTouchDevice) setTooltipOpen(false)
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onLike()
                    if (isTouchDevice) setTooltipOpen(prev => !prev)
                  }}
                  className="flex items-center gap-2 transition-all hover:opacity-80"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 font-bold ${liked ? "scale-110 bg-[var(--accent)]" : "bg-[var(--primary-10)]"}`}
                  >
                    <Image
                      src="/icons/like.png"
                      alt="Curtir"
                      width={18}
                      height={18}
                      className={`transition-all duration-300 ${liked ? "opacity-100 scale-110" : "opacity-60"}`}
                    />
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: liked ? "var(--accent)" : "var(--gray)" }}
                  >
                    {likesCount}
                  </span>
                </button>

                {tooltipOpen && likesCount > 0 && (
                  <div className="absolute bottom-full left-0 mb-3 z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div
                      className="relative rounded-2xl border shadow-2xl p-2 min-w-[200px]"
                      style={{
                        backgroundColor: "var(--white)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <LikeView totalLikes={likers.length} likers={likers} />
                      <div
                        className="absolute top-full left-4 w-4 h-4 rotate-45 -translate-y-2 border-r border-b"
                        style={{
                          backgroundColor: "var(--white)",
                          borderColor: "var(--border)",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="flex items-center gap-2 transition-all hover:opacity-80"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center transition hover:bg-[var(--primary-20)]"
                  style={{ backgroundColor: "var(--primary-10)" }}
                >
                  <Image
                    src="/icons/coments.png"
                    alt="Comentários"
                    width={18}
                    height={18}
                    className="opacity-70"
                  />
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--gray)" }}>
                  {commentsCount}
                </span>
              </button>
            </div>

            {likesCount > 0 && (
              <div className="sm:hidden text-[10px] text-neutral-400 leading-tight -mt-2">
                {(() => {
                  const shuffled = [...likers].sort(() => Math.random() - 0.5)
                  const names = shuffled.slice(0, 3).map((like) => like.nome)
                  return `curtido por: ${names.join(", ")}${likers.length > 3 ? ", ..." : ""}`
                })()}
              </div>
            )}

            <div className="overflow-visible">
              <CommentsBox postId={post.id} postAuthorId={post.author.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
