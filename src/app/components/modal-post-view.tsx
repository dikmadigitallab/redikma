"use client";

import { useEffect, useState } from "react";
import { X, Edit3 } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";

const scrollStyles = `
  .modal-scroll::-webkit-scrollbar { width: 0; background: transparent; }
  .modal-scroll:hover::-webkit-scrollbar { width: 6px; }
  .modal-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 3px; }
  .modal-scroll:hover::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); }
  .modal-scroll::-webkit-scrollbar-track { background: transparent; }
  .modal-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
  .modal-scroll:hover { scrollbar-color: rgba(0,0,0,0.15) transparent; }
`;
import { CommentsBox } from "./comentarios";
import { ImageModal } from "./modal-view-photo";
import { LikeView } from "./likes-view";
import { EditPostModal } from "./modal-edit-post";

type Post = {
  id: string;
  label: string;
  createdAt: string;
  image: string;
  authorId: string;
  author: {
    id: string;
    nome: string;
    foto: string | null;
  };
  postador: string;
};

type Liker = {
  id: string;
  nome: string;
  foto: string;
};

type Props = {
  postId: string;
  onClose: () => void;
};

export function PostViewModal({ postId, onClose }: Props) {
  const { data: session } = useSession();
  const user = session?.user;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [likers, setLikers] = useState<Liker[]>([]);
  const [showLikers, setShowLikers] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<{ id: string; label: string } | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/posts", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const posts: Post[] = Array.isArray(data) ? data : [];
        const found = posts.find((p) => p.id === postId);
        if (found) setPost(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [postId]);

  useEffect(() => {
    const pid = post?.id;
    if (!pid) return;

    async function loadLikes() {
      try {
        const res = await fetch(`/api/posts/posts-likes?postId=${pid}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setLikesCount(data.total || 0);
        if (user?.id && data.likes) {
          setLiked(data.likes.some((l: { userId: string }) => l.userId === user.id));
        }
      } catch {}
    }

    async function loadLikers() {
      try {
        const res = await fetch(`/api/posts/list-likes?postId=${pid}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setLikers(data.likers || []);
      } catch {}
    }

    async function loadCommentsCount() {
      try {
        const res = await fetch(`/api/posts/comments-count?postId=${pid}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setCommentsCount(data.total || data.count || 0);
      } catch {}
    }

    loadLikes();
    loadLikers();
    loadCommentsCount();
  }, [post, user]);

  async function toggleLike() {
    if (!user?.id || !post) return;

    try {
      const res = await fetch("/api/posts/posts-likes", {
        method: liked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, userId: user.id }),
      });
      if (!res.ok) return;

      setLiked(!liked);
      setLikesCount((prev) => (liked ? Math.max(prev - 1, 0) : prev + 1));
    } catch {}
  }

  function renderTextWithLinks(text: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) =>
      urlRegex.test(part) ? (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all hover:text-blue-800">
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  return (
    <>
      <style>{scrollStyles}</style>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="modal-scroll relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          style={{ backgroundColor: "var(--white)", borderColor: "var(--border)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Barra decorativa */}
          <div
            className="h-1 w-full sticky top-0 z-10"
            style={{
              background:
                "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 70%, var(--accent) 100%)",
            }}
          />

          {/* Botão fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition"
            style={{ backgroundColor: "var(--primary)", color: "var(--white)" }}
          >
            <X size={16} />
          </button>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div
                className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "var(--secondary)" }}
              />
            </div>
          ) : !post ? (
            <div className="text-center py-20 text-sm" style={{ color: "var(--gray)" }}>
              Post não encontrado
            </div>
          ) : (
            <div className="p-5 space-y-4">
              {/* Cabeçalho */}
              <div
                className="flex items-start gap-3 pb-4 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="absolute -inset-1 rounded-full opacity-15"
                    style={{ backgroundColor: "var(--secondary)" }}
                  />
                  <img
                    src={post.author.foto || "/photoProfile/userDefault.png"}
                    alt={post.author.nome}
                    className="relative w-10 h-10 rounded-full object-cover border-2"
                    style={{ borderColor: "var(--white)" }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--black)" }}>
                      {post.author.nome}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--gray)" }}>
                      {post.postador}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "var(--success)" }}
                      />
                      <p className="text-[11px] font-medium" style={{ color: "var(--gray)" }}>
                        {new Date(post.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  {user?.id === post.authorId && (
                    <button
                      onClick={() => setEditingPost({ id: post.id, label: post.label })}
                      className="flex-shrink-0 p-2 rounded-full hover:bg-[var(--primary-10)] transition"
                      title="Editar post"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                </div>

              {/* Texto */}
              {post.label && (
                <div className="px-1">
                  <p className="text-sm leading-7 whitespace-pre-wrap break-words" style={{ color: "var(--black)" }}>
                    {renderTextWithLinks(post.label)}
                  </p>
                </div>
              )}

              {/* Imagem */}
              {post.image && (
                <div
                  className="rounded-2xl overflow-hidden border"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
                >
                  <img
                    src={post.image}
                    onClick={() => setSelectedImage(post.image)}
                    className="w-full max-h-[300px] object-cover cursor-pointer transition-opacity hover:opacity-95"
                    alt=""
                  />
                </div>
              )}

              {/* Likes info */}
              {likesCount > 0 && (
                <div className="px-1">
                  <button
                    onClick={() => setShowLikers(!showLikers)}
                    className="text-xs font-medium"
                    style={{ color: "var(--gray)" }}
                  >
                    {likesCount} {likesCount === 1 ? "curtida" : "curtidas"}
                  </button>

                  {showLikers && likers.length > 0 && (
                    <div className="mt-2 p-2 rounded-xl border" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
                      <LikeView likers={likers} totalLikes={likers.length} />
                    </div>
                  )}
                </div>
              )}

              {/* Ações */}
              <div
                className="flex items-center gap-6 pt-2 border-t"
                style={{ borderColor: "var(--border)" }}
              >
                {/* Curtir */}
                <button
                  onClick={toggleLike}
                  className="flex items-center gap-2 transition-all hover:opacity-80"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      liked ? "scale-105" : ""
                    }`}
                    style={{
                      backgroundColor: liked
                        ? "rgba(255, 0, 85, 0.12)"
                        : "rgba(79, 195, 217, 0.08)",
                    }}
                  >
                    <Image
                      src="/icons/like.png"
                      alt="Curtir"
                      width={18}
                      height={18}
                      className={`transition-all duration-300 ${
                        liked ? "opacity-100 scale-110" : "opacity-60"
                      }`}
                    />
                  </div>

                  <span
                    className="text-sm font-semibold"
                    style={{ color: liked ? "var(--accent)" : "var(--gray)" }}
                  >
                    {likesCount}
                  </span>
                </button>

                {/* Comentários */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(79, 195, 217, 0.08)" }}
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
                </div>
              </div>

              {/* Comentários */}
              <div className="overflow-visible pt-2">
                <CommentsBox postId={post.id} postAuthorId={post.author.id} />
              </div>
            </div>
          )}
        </div>
      </div>

      <ImageModal
        image={selectedImage}
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        postId={post?.id}
        authorId={post?.authorId}
      />

      {editingPost && (
        <EditPostModal
          postId={editingPost.id}
          currentText={editingPost.label}
          onClose={() => setEditingPost(null)}
          onSaved={() => {
            setEditingPost(null)
            onClose()
          }}
        />
      )}
    </>
  );
}
