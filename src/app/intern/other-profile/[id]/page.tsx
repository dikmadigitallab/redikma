"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { TextPostCard } from "@/app/components/posts/text-post-card"
import { PhotoPost } from "@/app/components/posts/photo-post"
import { ImageModal } from "@/app/components/modals/modal-view-photo"
import { useSession } from "next-auth/react"

type OtherUser = {
  id: string
  nome: string
  username: string
  cargo: string
  foto: string
  role: string
  email: string
  telefone: string
  aniversario: string
  admissao: string
  _count: {
    postagens: number
    likes: number
    comentarios: number
  }
}

type Post = {
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
    role: string
  }
  postador: string
  _count: {
    likes: number
    comentarios: number
  }
}

export default function OtherProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const { data: session } = useSession()
  const currentUserId = session?.user?.id

  const [user, setUser] = useState<OtherUser | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null)
  const [openModal, setOpenModal] = useState(false)

  function handleOpenImage(image: string, postId: string, authorId: string) {
    setSelectedImage(image)
    setSelectedPostId(postId)
    setSelectedAuthorId(authorId)
    setOpenModal(true)
  }

  function handleCloseImage() {
    setOpenModal(false)
    setSelectedImage(null)
    setSelectedPostId(null)
    setSelectedAuthorId(null)
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`/api/users/${userId}`)
        if (!res.ok) throw new Error("Perfil não encontrado")
        const data = await res.json()
        setUser(data.user)
        setPosts(data.postagens)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [userId])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8 overflow-y-auto max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-5.5rem)]">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-neutral-200" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-neutral-200 rounded" />
              <div className="h-4 w-32 bg-neutral-200 rounded" />
            </div>
          </div>
          <div className="h-4 w-full bg-neutral-200 rounded" />
          <div className="h-4 w-3/4 bg-neutral-200 rounded" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center overflow-y-auto max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-5.5rem)]">
        <p className="text-gray">Usuário não encontrado</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-6 overflow-y-auto max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-5.5rem)]">
      {/* Profile Header */}
      <div
        className="relative rounded-2xl border-2 shadow-md overflow-hidden"
        style={{
          backgroundColor: "var(--white)",
          borderColor: "var(--primary)",
        }}
      >
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 70%, var(--accent) 100%)",
          }}
        />

        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative shrink-0">
              <div
                className="absolute -inset-1 rounded-full opacity-15"
                style={{ backgroundColor: "var(--secondary)" }}
              />
              <Image
                src={user.foto || "/photoProfile/userDefault.png"}
                alt={user.nome}
                width={80}
                height={80}
                className="relative w-20 h-20 rounded-full object-cover border-4"
                style={{ borderColor: "var(--white)" }}
              />
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-primary">
                {user.nome}
              </h1>
              <p className="text-sm text-gray/80 mt-0.5">
                @{user.username} • {user.cargo}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center sm:justify-start gap-6 mt-6 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="text-center">
              <p className="text-lg font-bold text-primary">{user._count.postagens}</p>
              <p className="text-[11px] text-gray">Postagens</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-primary">{user._count.likes}</p>
              <p className="text-[11px] text-gray">Curtidas</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-primary">{user._count.comentarios}</p>
              <p className="text-[11px] text-gray">Comentários</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <p className="text-center text-sm text-gray py-8">
          Nenhuma postagem ainda
        </p>
      ) : (
        posts.map((post) => {
          if (post.image) {
            return (
              <PhotoPost
                key={post.id}
                post={post}
                liked={false}
                likesCount={post._count.likes}
                commentsCount={post._count.comentarios}
                currentComment=""
                likers={[]}
                currentUserId={currentUserId}
                onLike={() => {}}
                onComment={() => {}}
                onCommentChange={() => {}}
                onOpenImage={handleOpenImage}
                onDelete={() => {}}
                onEdit={() => {}}
              />
            )
          }

          const postLikesCount = post._count.likes

          return (
            <TextPostCard
              key={post.id}
              post={post as any}
              liked={false}
              postLikesCount={postLikesCount}
              commentsCount={post._count.comentarios}
              currentComment=""
              likers={[]}
              currentUserId={currentUserId}
              videoMuted={false}
              isTooltipOpen={false}
              isTouchDevice={false}
              onLike={() => {}}
              onComment={() => {}}
              onCommentChange={() => {}}
              onOpenImage={() => {}}
              onDelete={() => {}}
              onEdit={() => {}}
              onToggleComments={() => {}}
              onToggleMute={() => {}}
              onTooltipEnter={() => {}}
              onTooltipLeave={() => {}}
              onTooltipTouch={() => {}}
            />
          )
        })
      )}

      <ImageModal
        image={selectedImage}
        open={openModal}
        onClose={handleCloseImage}
        postId={selectedPostId}
        authorId={selectedAuthorId}
      />
    </div>
  )
}
