"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react"
import { toast } from "sonner"
import { CommentsBox } from "./comentarios"
import { PostOptions } from "./postDelete"
import { LikeView } from "./likes-view"
import { FrashPlayer } from "./frash-player"
import { useSession } from "next-auth/react"
import { TRUNCATE_LENGTH } from "@/lib/constantes"


type Post = {
  id: string
  label: string
  createdAt: string
  authorId: string
  image: string
  video?: string
  author: { id: string; nome: string; foto: string; cargo: string; role: string }
  postador: string
  comentarios: []
}

type Liker = { id: string; nome: string; foto: string }

type TextPostCardProps = {
  post: Post
  liked: boolean
  postLikesCount: number
  commentsCount: number
  currentComment: string
  likers: Liker[]
  currentUserId?: string
  videoMuted: boolean
  isTooltipOpen: boolean
  isTouchDevice: boolean
  onLike: () => void
  onComment: (postId: string) => void
  onCommentChange: (postId: string, text: string) => void
  onOpenImage: (image: string, postId: string, authorId: string) => void
  onDelete: (postId: string) => void
  onEdit: (postId: string) => void
  onToggleComments: (postId: string) => void
  onToggleMute: () => void
  onTooltipEnter: () => void
  onTooltipLeave: () => void
  onTooltipTouch: () => void
}

function renderTextWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.split(urlRegex).map((part, index) =>
    urlRegex.test(part) ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all hover:text-blue-800">
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    )
  )
}

export function TextPostCard({
  post, liked, postLikesCount, commentsCount, currentComment, likers, currentUserId,
  videoMuted, isTooltipOpen, isTouchDevice,
  onLike, onComment, onCommentChange, onOpenImage, onDelete, onEdit,
  onToggleComments, onToggleMute, onTooltipEnter, onTooltipLeave, onTooltipTouch,
}: TextPostCardProps) {
  const router = useRouter()
  const isAuthor = currentUserId === post.author.id
  const session = useSession()
  const user = session?.data?.user
  const [textExpanded, setTextExpanded] = useState(false)
  const shouldTruncate = post.label.length > TRUNCATE_LENGTH
  const displayLabel = shouldTruncate && !textExpanded
    ? post.label.slice(0, TRUNCATE_LENGTH)
    : post.label

  return (
    <div
      id={`post-${post.id}`}
      className="relative rounded-2xl border-2 shadow-md overflow-visible transition-all duration-500 hover:shadow-lg hover:border-accent"
      style={{
        backgroundColor: "var(--white)",
        borderColor: "var(--primary)",
        boxShadow: "0 4px 16px rgba(39, 38, 98, 0.08)",
      }}
    >
      <div
        className="h-1 w-full"
        style={{ background: "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 70%, var(--accent) 100%)" }}
      />

      {isAuthor ? (
        <div className="absolute top-4 right-4 z-50 overflow-visible">
          <div onClick={(e) => e.stopPropagation()}>
            <PostOptions postId={post.id} onDelete={onDelete} onEdit={onEdit} />
          </div>
        </div>
      ) : (
        <div className="absolute top-4 right-4 z-50 overflow-visible">
          <button
            className="text-primary hover:bg-primary-10 p-1 rounded-full transition-colors flex items-center justify-center select-none"
            onClick={(e) => { e.stopPropagation(); toast.info("Somente o criador do post poderá editá-lo") }}
          >
            <MoreHorizontal size={24} />
          </button>
        </div>
      )}

      <div className="p-4 md:p-5 space-y-4 overflow-visible">
        <div className="flex items-start gap-3 pb-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="relative shrink-0 cursor-pointer" onClick={() => router.push(`/intern/other-profile/${post.author.id}`)}>
            <div className="absolute -inset-1 rounded-full opacity-15" style={{ backgroundColor: "var(--secondary)" }} />
            <Image
              src={post.author.foto || "/photoProfile/userDefault.png"}
              alt={post.author.nome}
              width={44} height={44}
              loading="lazy" quality={100} draggable={false}
              className="relative w-10 h-10 md:w-11 md:h-11 rounded-full object-cover border-2"
              style={{ borderColor: "var(--white)" }}
            />
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-sm md:text-base font-bold text-primary truncate cursor-pointer hover:underline" onClick={() => router.push(`/intern/other-profile/${post.author.id}`)}>{post.author.nome}</h3>
              {post.author.cargo && (
                <span className="text-[10px] md:text-xs font-normal text-gray truncate">• {post.author.cargo}</span>
              )}
            </div>
            {post.postador && post.postador !== post.author.nome && (
              <p className="text-xs text-gray/80 mt-0.5 truncate">via {post.postador}</p>
            )}
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] md:text-xs font-medium text-gray">
              <span className="w-2 h-2 rounded-full bg-success" aria-hidden="true" />
              <time dateTime={post.createdAt}>
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </time>
            </div>
          </div>
        </div>

        <div className="px-1">
          <div className="text-sm leading-7 whitespace-pre-wrap break-words" style={{ color: "var(--black)" }}>
            {renderTextWithLinks(displayLabel)}
            {shouldTruncate && (
              <button
                onClick={() => setTextExpanded(!textExpanded)}
                className="text-blue-600 hover:underline ml-1 text-sm"
              >
                {textExpanded ? "... ver menos" : "... ver mais"}
              </button>
            )}
          </div>
        </div>

        {post.video && (
          <div className="relative rounded-2xl overflow-hidden border" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
            <FrashPlayer src={post.video} muted={videoMuted} onToggleMute={onToggleMute} />
            <div
              className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: "var(--accent)", color: "var(--white)" }}
            >
              Frash
            </div>
          </div>
        )}

        {post.image && (
          <div className="rounded-2xl overflow-hidden border" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
            <Image
              src={post.image} alt="Imagem da postagem"
              width={1200} height={800}
              loading="lazy" quality={100} draggable={false}
              onClick={() => onOpenImage(post.image, post.id, post.authorId)}
              onDoubleClick={onLike}
              className="w-full max-h-300px md:max-h-520px object-contain cursor-pointer transition-opacity hover:opacity-95"
            />
          </div>
        )}

        <div className="pt-4 border-t space-y-4 overflow-visible" style={{ borderColor: "var(--border)" }}>
          <div
            className="flex items-center gap-2 rounded-full px-3 py-2 border-2 relative transition focus-within:border-accent"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--primary)",
            }}
          >
            <img
              src={user?.foto || "/photoProfile/userDefault.png"}
              className="w-8 h-8 rounded-full object-cover shrink-0"
              alt="Comentador"
            />

            <input
              id={`comment-input-${post.id}`}
              value={currentComment}
              maxLength={50}
              onChange={(e) => onCommentChange(post.id, e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  currentComment.trim() !== ""
                ) {
                  onComment(post.id)
                }
              }}
              placeholder="Escreva um comentário..."
              className="flex-1 bg-transparent outline-none text-sm pr-10"
              style={{ color: "var(--black)" }}
            />

            {currentComment.trim() !== "" && (
              <button
                type="button"
                onClick={() => onComment(post.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-accent transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
              >
                <Send size={15} color="white" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-6 relative overflow-visible">
            <div
              className="relative"
              onMouseEnter={onTooltipEnter}
              onMouseLeave={onTooltipLeave}
            >
              <button
                type="button"
                onClick={() => { onLike(); if (isTouchDevice) onTooltipTouch() }}
                className="flex items-center gap-2 transition-all hover:opacity-80"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${liked ? "scale-110" : ""}`}
                  style={{ backgroundColor: liked ? "var(--accent)" : "var(--primary-10)" }}
                >
                  <Heart
                    size={18}
                    className={`transition-all duration-300 ${liked ? "scale-110" : "opacity-60"}`}
                    color={liked ? "var(--white)" : "var(--gray)"}
                    fill={liked ? "var(--white)" : "transparent"}
                  />
                </div>
                <span className="text-sm font-semibold" style={{ color: liked ? "var(--accent)" : "var(--gray)" }}>
                  {postLikesCount}
                </span>
              </button>

              {isTooltipOpen && postLikesCount > 0 && (
                <div className="absolute bottom-full left-0 mb-3 z-20 animate-in fade-in zoom-in-95 duration-200 hidden md:block">
                  <div
                    className="relative rounded-2xl border shadow-2xl p-2 min-w-200px"
                    style={{ backgroundColor: "var(--white)", borderColor: "var(--border)" }}
                  >
                    <LikeView totalLikes={likers.length} likers={likers} />
                    <div
                      className="absolute top-full left-4 w-4 h-4 rotate-45 -translate-y-2 border-r border-b"
                      style={{ backgroundColor: "var(--white)", borderColor: "var(--border)" }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onToggleComments(post.id)}
              className="flex items-center gap-2 transition-all hover:opacity-80"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--primary-10)" }}>
                <MessageCircle size={18} className="opacity-70" color="var(--gray)" />
              </div>
              <span className="text-sm font-semibold" style={{ color: "var(--gray)" }}>{commentsCount}</span>
            </button>
          </div>

          {postLikesCount > 0 && (
            <div className="sm:hidden text-[10px] text-neutral-400 leading-tight -mt-2">
              {(() => {
                const shuffled = [...likers].sort(() => Math.random() - 0.5)
                const names = shuffled.slice(0, 3).map((l) => l.nome)
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
  )
}
