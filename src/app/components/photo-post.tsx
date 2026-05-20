'use client'

import Image from 'next/image'
import { MoreHorizontal, Send } from 'lucide-react'
import { useState } from 'react'

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
  onLike,
  onComment,
  onCommentChange,
  onOpenImage,
  onShowOptions,
}: PhotoPostProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)

  const handleImageLoad = (e: any) => {
    setImageLoaded(true)
    const img = e.target
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
  }

  // Calcula se a imagem é portrait (9:16) ou precisa de padding
  const isPortrait = imageDimensions && imageDimensions.height / imageDimensions.width > 1.5

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden snap-center">
      {/* Background abstrato com gradiente Dikma discreto */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(39, 38, 98, 0.08) 0%, rgba(241, 90, 36, 0.06) 100%)',
        }}
      />

      {/* Imagem centralizada com proporção 9:16 */}
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

          {/* Overlay superior com informações do autor */}
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

          {/* Overlay inferior com interações */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 z-10">
            <div className="space-y-3">
              {/* Texto do post */}
              {post.label && (
                <p className="text-white text-sm font-medium line-clamp-3">{post.label}</p>
              )}

              {/* Contador de likes e comentários */}
              <div className="flex gap-4 text-xs text-white/80">
                <span className="font-semibold">{likesCount} curtidas</span>
                <span className="font-semibold">{commentsCount} comentários</span>
              </div>

              {/* Botão de like */}
              <button
                onClick={onLike}
                className={`w-full py-2.5 rounded-xl font-bold transition transform hover:scale-105 ${
                  liked
                    ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/50'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {liked ? '❤️ Curtir' : '🤍 Curtir'}
              </button>

              {/* Campo de comentário */}
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
                  style={{ fontFamily: "'Red Hat Text', sans-serif" }}
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
  )
}
