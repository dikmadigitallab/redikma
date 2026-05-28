'use client'

/* não mexer nessa agora
 */
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Send } from 'lucide-react'
<<<<<<< HEAD:src/app/components/photo-post.tsx
import { useState } from 'react'
=======
import { useState} from 'react'
>>>>>>> a82e5ad77f890c28c28ba8cecdde5c4a4c23e5f4:src/app/components/posts/photo-post.tsx
import { LikeView } from './likes-view'
import { CommentsBox } from './comentarios'
import { PostOptions } from './postDelete'
import {useSession} from 'next-auth/react'

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
    video?: string
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
  onOpenImage: (
    image: string,
    postId: string,
    authorId: string
  ) => void
  currentUserId?: string
  onDelete: (postId: string) => void
  onEdit?: (postId: string) => void
}

export function PhotoPost({
  post,
  liked,
  likesCount,
  commentsCount,
  currentComment,
  likers,
  currentUserId,
  onLike,
  onComment,
  onCommentChange,
  onOpenImage,
  onDelete,
  onEdit,
}: PhotoPostProps) {
  const router = useRouter()
  const isAuthor = currentUserId === post.author.id

  const [, setImageLoaded] = useState(false)

  const [imageDimensions, setImageDimensions] = useState<{
    width: number
    height: number
  } | null>(null)

  const [tooltipOpen, setTooltipOpen] = useState(false)

  const [expanded, setExpanded] = useState(false)

  const [isTouchDevice] = useState<boolean>(() => {
    try {
      return (
        typeof window !== 'undefined' &&
        ('ontouchstart' in window ||
          navigator.maxTouchPoints > 0)
      )
    } catch {
      return false
    }
  })

<<<<<<< HEAD:src/app/components/photo-post.tsx
  const LIMIT = 100

  const shouldTruncate =
    (post.label?.length || 0) > LIMIT

  const displayedText =
    shouldTruncate && !expanded
      ? post.label.slice(0, LIMIT)
      : post.label
=======
  const session = useSession()
  const user = session?.data?.user
>>>>>>> a82e5ad77f890c28c28ba8cecdde5c4a4c23e5f4:src/app/components/posts/photo-post.tsx

  const handleImageLoad = (e: any) => {
    setImageLoaded(true)

    const img = e.target

    setImageDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    })
  }

  const isPortrait =
    imageDimensions &&
    imageDimensions.height /
      imageDimensions.width >
      1.5

  return (
    <>
      {/* Mobile: card layout */}
      <div className="w-full relative overflow-hidden md:hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(135deg, rgba(39, 38, 98, 0.06) 0%, rgba(241, 90, 36, 0.04) 100%)',
          }}
        />

        <div className="pt-2 pb-1">
          <div
            className={`relative w-full mx-auto overflow-hidden shadow-xl ${
              isPortrait
                ? 'aspect-[9/16] max-h-[75vh]'
                : 'aspect-video'
            }`}
            style={{
              boxShadow:
                '0 8px 40px rgba(39, 38, 98, 0.2)',
            }}
          >
            <Image
              src={post.image}
              alt="Post de foto"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
              onLoad={handleImageLoad}
              onClick={() =>
                onOpenImage(
                  post.image,
                  post.id,
                  post.authorId
                )
              }
              style={{ cursor: 'pointer' }}
            />

            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-3 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push(`/intern/other-profile/${post.author.id}`)}>
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/50 bg-white/10 flex items-center justify-center shrink-0">
                    {post.author.foto &&
                    (post.author.foto.startsWith(
                      'http'
                    ) ||
                      post.author.foto.startsWith(
                        '/'
                      )) ? (
                      <Image
                        src={post.author.foto}
                        alt={post.author.nome}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                        <span className="text-white font-bold text-[10px]">
                          {post.author.nome
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <p className="text-white font-bold text-xs">
                      {post.author.nome}
                    </p>

                    <p className="text-white/70 text-[10px]">
                      {post.author.cargo}
                    </p>
                  </div>
                </div>

                {isAuthor ? (
                  <div
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >
                    <PostOptions
                      postId={post.id}
                      onDelete={onDelete}
                      onEdit={onEdit}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 z-10">
              <div className="space-y-2">
                <div className="flex gap-3 text-[11px] text-white/80">
                  <span className="font-semibold">
                    {likesCount} curtidas
                  </span>

                  <span className="font-semibold">
                    {commentsCount} comentários
                  </span>
                </div>

                <div className="flex gap-2 items-stretch">
                  <button
                    onClick={onLike}
                    className={`h-auto px-4 rounded-xl font-bold transition transform hover:scale-105 flex items-center justify-center ${
                      liked
                        ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/50'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Heart
                      size={16}
                      className={
                        liked ? '' : 'opacity-80'
                      }
                      color="white"
                      fill={
                        liked
                          ? 'white'
                          : 'transparent'
                      }
                    />
                  </button>

                  <div className="flex-1 flex gap-2 bg-white/20 rounded-xl p-1.5 backdrop-blur-sm">
                    <input
                      type="text"
                      placeholder="Comentar..."
                      value={currentComment}
                      onChange={(e) =>
                        onCommentChange(
                          post.id,
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          onComment(post.id)
                        }
                      }}
                      className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-xs font-medium"
                    />

                    <button
                      onClick={() =>
                        onComment(post.id)
                      }
                      className="p-1.5 rounded-lg bg-[var(--accent)] text-white hover:shadow-lg transition"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {post.label && (
            <div className="px-3 py-2">
              <div
                className="text-sm leading-6 whitespace-pre-wrap break-words"
                style={{
                  color: 'var(--black)',
                }}
              >
                {displayedText}

                {shouldTruncate &&
                  !expanded && (
                    <>
                      ...{' '}
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded(true)
                        }
                        className="font-semibold hover:underline"
                        style={{
                          color:
                            'var(--accent)',
                        }}
                      >
                        Ver mais
                      </button>
                    </>
                  )}

                {shouldTruncate &&
                  expanded && (
                    <>
                      {' '}
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded(false)
                        }
                        className="font-semibold hover:underline"
                        style={{
                          color:
                            'var(--accent)',
                        }}
                      >
                        Ver menos
                      </button>
                    </>
                  )}
              </div>
            </div>
          )}

          {likesCount > 0 && (
            <div className="text-[10px] text-neutral-400 leading-tight mt-1 px-1">
              {(() => {
                const shuffled = [
                  ...likers,
                ].sort(
                  () => Math.random() - 0.5
                )

                const names = shuffled
                  .slice(0, 3)
                  .map((like) => like.nome)

                return `curtido por: ${names.join(
                  ', '
                )}${
                  likers.length > 3
                    ? ', ...'
                    : ''
                }`
              })()}
            </div>
          )}

          <div className="overflow-visible mt-1">
            <CommentsBox
              postId={post.id}
              postAuthorId={post.author.id}
            />
          </div>
        </div>
      </div>

      {/* Desktop: card layout */}
      <div
        className="hidden md:block relative rounded-2xl border-2 shadow-md overflow-visible transition-all duration-500 hover:shadow-lg hover:border-[var(--accent)]"
        style={{
          backgroundColor: 'var(--white)',
          borderColor: 'var(--primary)',
          boxShadow:
            '0 4px 16px rgba(39, 38, 98, 0.08)',
        }}
      >
        <div
          className="h-1 w-full"
          style={{
            background:
              'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 70%, var(--accent) 100%)',
          }}
        />

        {isAuthor ? (
          <div
            className="absolute top-4 right-4 z-20"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <PostOptions
              postId={post.id}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          </div>
        ) : null}

        <div className="p-4 md:p-5 space-y-4">
<<<<<<< HEAD:src/app/components/photo-post.tsx
          <div
            className="flex items-start gap-3 pb-4 border-b"
            style={{
              borderColor: 'var(--border)',
            }}
          >
            <div className="relative shrink-0">
              <div
                className="absolute -inset-1 rounded-full opacity-15"
                style={{
                  backgroundColor:
                    'var(--secondary)',
                }}
              />

              <Image
                src={
                  post.author.foto ||
                  '/photoProfile/userDefault.png'
                }
=======
          <div className="flex items-start gap-3 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="relative shrink-0 cursor-pointer" onClick={() => router.push(`/intern/other-profile/${post.author.id}`)}>
              <div className="absolute -inset-1 rounded-full opacity-15" style={{ backgroundColor: "var(--secondary)" }} />
              <img
                src={post.author.foto || "/photoProfile/userDefault.png"}
>>>>>>> a82e5ad77f890c28c28ba8cecdde5c4a4c23e5f4:src/app/components/posts/photo-post.tsx
                alt={post.author.nome}
                width={44}
                height={44}
                className="relative w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2"
                style={{
                  borderColor: 'var(--white)',
                }}
              />
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h3 className="text-sm md:text-base font-bold text-[var(--primary)] truncate cursor-pointer hover:underline" onClick={() => router.push(`/intern/other-profile/${post.author.id}`)}>
                  {post.author.nome}
                </h3>

                {post.author.cargo && (
                  <span className="text-[10px] md:text-xs font-normal text-[var(--gray)] truncate">
                    • {post.author.cargo}
                  </span>
                )}
              </div>
            </div>
          </div>

          {post.label && (
            <div className="px-1">
              <div
                className="text-sm leading-7 whitespace-pre-wrap break-words"
                style={{
                  color: 'var(--black)',
                }}
              >
                {displayedText}

                {shouldTruncate &&
                  !expanded && (
                    <>
                      ...{' '}
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded(true)
                        }
                        className="font-semibold hover:underline"
                        style={{
                          color:
                            'var(--accent)',
                        }}
                      >
                        Ver mais
                      </button>
                    </>
                  )}

                {shouldTruncate &&
                  expanded && (
                    <>
                      {' '}
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded(false)
                        }
                        className="font-semibold hover:underline"
                        style={{
                          color:
                            'var(--accent)',
                        }}
                      >
                        Ver menos
                      </button>
                    </>
                  )}
              </div>
            </div>
          )}

          <div
            className="rounded-2xl overflow-hidden border"
            style={{
              backgroundColor:
                'var(--background)',
              borderColor: 'var(--border)',
            }}
          >
            <Image
              src={post.image}
              alt="Imagem da postagem"
              width={1200}
              height={800}
              onLoad={handleImageLoad}
              onClick={() =>
                onOpenImage(
                  post.image,
                  post.id,
                  post.authorId
                )
              }
              onDoubleClick={onLike}
              className="w-full max-h-[520px] object-cover cursor-pointer transition-opacity hover:opacity-95"
            />
          </div>

<<<<<<< HEAD:src/app/components/photo-post.tsx
          <div
            className="pt-4 border-t space-y-4"
            style={{
              borderColor: 'var(--border)',
            }}
          >
=======
          <div className="pt-4 border-t space-y-4" style={{ borderColor: "var(--border)" }}>
            <div
              className="flex items-center gap-3 rounded-full px-3 py-2 border-2 relative transition focus-within:border-[var(--accent)]"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--primary)",
              }}
            >
              <img
                src={`${user?.foto} || /photoProfile/userDefault.png`}
                className="w-7 h-7 rounded-full object-cover shrink-0"
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

>>>>>>> a82e5ad77f890c28c28ba8cecdde5c4a4c23e5f4:src/app/components/posts/photo-post.tsx
            <div className="flex items-center gap-6 relative overflow-visible">
              <div
                className="relative"
                onMouseEnter={() => {
                  if (
                    !isTouchDevice &&
                    likesCount > 0
                  ) {
                    setTooltipOpen(true)
                  }
                }}
                onMouseLeave={() => {
                  if (!isTouchDevice) {
                    setTooltipOpen(false)
                  }
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onLike()

                    if (isTouchDevice) {
                      setTooltipOpen(
                        (prev) => !prev
                      )
                    }
                  }}
                  className="flex items-center gap-2 transition-all hover:opacity-80"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 font-bold ${
                      liked
                        ? 'scale-110 bg-[var(--accent)]'
                        : 'bg-[var(--primary-10)]'
                    }`}
                  >
                    <Heart
                      size={18}
                      className={`transition-all duration-300 ${
                        liked
                          ? 'opacity-100 scale-110 text-white'
                          : 'opacity-60'
                      }`}
                      fill={
                        liked
                          ? 'white'
                          : 'transparent'
                      }
                    />
                  </div>

                  <span
                    className="text-sm font-semibold"
                    style={{
                      color: liked
                        ? 'var(--accent)'
                        : 'var(--gray)',
                    }}
                  >
                    {likesCount}
                  </span>
                </button>

                {tooltipOpen &&
                  likesCount > 0 && (
                    <div className="absolute bottom-full left-0 mb-3 z-20 animate-in fade-in zoom-in-95 duration-200">
                      <div
                        className="relative rounded-2xl border shadow-2xl p-2 min-w-[200px]"
                        style={{
                          backgroundColor:
                            'var(--white)',
                          borderColor:
                            'var(--border)',
                        }}
                      >
                        <LikeView
                          totalLikes={
                            likers.length
                          }
                          likers={likers}
                        />

                        <div
                          className="absolute top-full left-4 w-4 h-4 rotate-45 -translate-y-2 border-r border-b"
                          style={{
                            backgroundColor:
                              'var(--white)',
                            borderColor:
                              'var(--border)',
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
                  style={{
                    backgroundColor:
                      'var(--primary-10)',
                  }}
                >
                  <MessageCircle
                    size={18}
                    className="opacity-70"
                  />
                </div>

                <span
                  className="text-sm font-semibold"
                  style={{
                    color: 'var(--gray)',
                  }}
                >
                  {commentsCount}
                </span>
              </button>
            </div>

            <div className="overflow-visible">
              <CommentsBox
                postId={post.id}
                postAuthorId={post.author.id}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}