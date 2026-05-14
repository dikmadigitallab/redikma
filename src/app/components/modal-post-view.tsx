"use client";

import { useEffect, useState } from "react";
import { X, Heart, MessageCircle } from "lucide-react";

type Post = {
  id: string;
  label: string;
  createdAt: string;
  image: string;
  author: {
    nome: string;
    foto: string | null;
  };
  postador: string;
  _count?: { likes: number; comentarios: number };
};

type Props = {
  postId: string;
  onClose: () => void;
};

export function PostViewModal({ postId, onClose }: Props) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/posts`);
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
    fetchPost();
  }, [postId]);

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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{ backgroundColor: "var(--white)", borderColor: "var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra decorativa */}
        <div
          className="h-1 w-full sticky top-0 z-10"
          style={{
            background:
              "linear-gradient(90deg, var(--primary-dark) 0%, var(--secondary) 70%, var(--accent) 100%)",
          }}
        />

        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition"
          style={{ backgroundColor: "var(--primary-dark)", color: "var(--white)" }}
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
            <div className="flex items-center gap-3">
              <img
                src={post.author.foto || "/photoProfile/userDefault.png"}
                alt={post.author.nome}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--black)" }}>
                  {post.author.nome}
                </p>
                <p className="text-xs" style={{ color: "var(--gray)" }}>
                  {post.postador}
                </p>
              </div>
            </div>

            {/* Texto */}
            {post.label && (
              <p className="text-sm leading-7 whitespace-pre-wrap break-words" style={{ color: "var(--black)" }}>
                {post.label}
              </p>
            )}

            {/* Imagem */}
            {post.image && (
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                <img
                  src={post.image}
                  alt=""
                  className="w-full max-h-[400px] object-cover"
                />
              </div>
            )}

            {/* Data */}
            <p className="text-xs" style={{ color: "var(--gray)" }}>
              {new Date(post.createdAt).toLocaleString("pt-BR")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
