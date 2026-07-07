"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PostBar } from "./posts-bar";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { containsBadWords } from "@/lib/ofensivas";
import { ImageModal } from "../modals/modal-view-photo";
import { EditPostModal } from "../modals/modal-edit-post";
import { TextPostCard } from "./text-post-card";
import { PhotoPost } from "./photo-post";

type Post = {
  id: string;
  label: string;
  createdAt: string;
  authorId: string;
  image: string;
  video?: string;
  author: {
    id: string;
    nome: string;
    foto: string;
    cargo: string;
    role: string;
  };
  postador: string;
  comentarios: [];
};

export function FeedNoticias({ onRefresh }: { onRefresh?: () => void }) {
  const { data: session } = useSession();
  const user = session?.user;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [commentsCount, setCommentsCount] = useState<Record<string, number>>(
    {},
  );
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const pathname = usePathname();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isTouchDevice, ] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0),
  );

  const [videoMuted, setVideoMuted] = useState(false)
  const [editingPost, setEditingPost] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);

  type Liker = {
    id: string;
    nome: string;
    foto: string;
  };

  const [listOfLikes, setListOfLikes] = useState<Record<string, Liker[]>>({});

  function handleOpenImage(image: string, postId: string, authorId: string) {
    setSelectedImage(image);
    setSelectedPostId(postId);
    setSelectedAuthorId(authorId);
    setOpenModal(true);
  }

  function handleCloseImage() {
    setOpenModal(false);
    setSelectedImage(null);
    setSelectedPostId(null);
    setSelectedAuthorId(null);
  }

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      try {
        const res = await fetch("/api/posts", { cache: "no-store" });
        const data = await res.json();

        setPosts(Array.isArray(data) ? data : (data?.posts ?? []));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [pathname, refreshKey]);

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
    onRefresh?.();
  }

  //consolidado: carrega likes, likers, status do user e contagem de comentários
  useEffect(() => {
    if (!posts.length) return;

    async function loadFeedData() {
      const postIds = posts.map((p) => p.id);
      try {
        const res = await fetch("/api/posts/feed-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postIds, userId: user?.id }),
        });
        if (!res.ok) return;
        const data = await res.json();

        const newLikedPosts: Record<string, boolean> = {};
        const newLikesCount: Record<string, number> = {};
        const newCommentsCount: Record<string, number> = {};
        const newListOfLikes: Record<string, Liker[]> = {};

        for (const [postId, info] of Object.entries(data) as [
          string,
          {
            liked: boolean;
            likesCount: number;
            commentsCount: number;
            likers: Liker[];
          },
        ][]) {
          newLikedPosts[postId] = info.liked;
          newLikesCount[postId] = info.likesCount;
          newCommentsCount[postId] = info.commentsCount;
          newListOfLikes[postId] = info.likers;
        }

        setLikedPosts(newLikedPosts);
        setLikesCount(newLikesCount);
        setCommentsCount(newCommentsCount);
        setListOfLikes(newListOfLikes);
      } catch (error) {
        console.error("Erro ao carregar dados do feed:", error);
      }
    }

    loadFeedData();

    const interval = setInterval(loadFeedData, 30000);
    return () => clearInterval(interval);
  }, [posts, user]);

  //realiza o curtir
  async function curtir(postId: string, autorPostId: string) {
    if (!user) return;

    const isLiked = likedPosts[postId];

    try {
      const res = await fetch("/api/posts/posts-likes", {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          userId: user.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error(err);
        throw new Error("Erro ao curtir");
      }

      // atualiza UI
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: !isLiked,
      }));

      setLikesCount((prev) => ({
        ...prev,
        [postId]: isLiked
          ? Math.max((prev[postId] || 1) - 1, 0)
          : (prev[postId] || 0) + 1,
      }));
    } catch (error) {
      console.error(error);
    }
  }

  //comentar
  async function comentar(postId: string) {
    if (!user) return;

    const texto = comments[postId]?.trim();

    if (!texto) return;

    if (containsBadWords(texto)) {
      setComments((prev) => ({
        ...prev,
        [postId]: "",
      }));

      toast.error("Comentário ofensivo não pode ser enviado");
      return;
    }

    try {
      const res = await fetch("/api/posts/posts-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto,
          postId,
          authorId: user.id,
        }),
      });

      if (!res.ok) throw new Error("Erro ao comentar");

      setComments((prev) => ({
        ...prev,
        [postId]: "",
      }));

      setCommentsCount((prev) => ({
        ...prev,
        [postId]: (prev[postId] || 0) + 1,
      }));

      toast.success("Comentário postado!");
    } catch {
      toast.error("Erro ao postar comentário");
    }
  }

  //deletar post
  async function handleDeletePost(postId: string) {
    // Verifica se o usuário está logado antes de tentar deletar
    if (!session?.user?.id) {
      return toast.error("Você precisa estar logado para excluir um post");
    }

    // Confirmação simples para evitar exclusões acidentais
    if (!confirm("Tem certeza que deseja excluir esta postagem?")) return;

    try {
      // Ajuste da URL para usar Query Params conforme esperado pelo seu DELETE:
      // /api/posts?postId=XXX&userId=YYY
      const res = await fetch(`/api/posts?postId=${postId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        // Usa a mensagem de erro vinda do servidor (ex: "Sem permissão")
        throw new Error(data.error || "Erro ao deletar post");
      }

      toast.success("Postagem excluída com sucesso!");
      await handleRefresh();

      // Atualiza o feed após a exclusão

      // ou handleRefresh(), dependendo de como está nomeado no seu componente
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro de conexão ao excluir post";

      toast.error(message);
    }
  }
  //editar post
  function handleEditPost(postId: string) {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setEditingPost({ id: post.id, label: post.label });
    }
  }

  function toggleComments(id: string): void {
    const commentInput = document.getElementById(`comment-input-${id}`);
    const toggleBtn = document.querySelector(`[data-comment-toggle="${id}"]`);
    if (toggleBtn instanceof HTMLButtonElement) {
      const isOpen = toggleBtn.textContent?.includes("Esconder");
      if (!isOpen) toggleBtn.click();
    }
    if (commentInput instanceof HTMLInputElement) {
      if (document.activeElement === commentInput) {
        commentInput.blur();
      } else {
        commentInput.focus();
        setTimeout(() => {
          const postEl = document.getElementById(`post-${id}`);
          if (postEl) {
            postEl.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            commentInput.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 400);
      }
    }
  }

  return (
    <section
      className="w-full max-w-3xl space-y-1"
      style={{ scrollSnapType: "y mandatory", scrollBehavior: "smooth" }}
    >
      <PostBar onCreated={handleRefresh} onRefresh={handleRefresh} />

      {loading && (
        <p className="text-sm px-2" style={{ color: "var(--gray)" }}>
          Carregando posts...
        </p>
      )}

      {posts.map((post) => {
        const liked = likedPosts[post.id] || false;
        const postLikesCount = likesCount[post.id] || 0;
        const isTooltipOpen = activeTooltip === post.id;

        // Renderizar PhotoPost se houver imagem, senão renderizar TextPost (atual)
        if (post.image) {
          return (
            <PhotoPost
              key={post.id}
              post={post}
              liked={liked}
              likesCount={postLikesCount}
              commentsCount={commentsCount[post.id] || 0}
              currentComment={comments[post.id] || ""}
              likers={listOfLikes[post.id] || []}
              currentUserId={session?.user?.id}
              onLike={() => curtir(post.id, post.authorId)}
              onComment={comentar}
              onCommentChange={(postId, text) =>
                setComments((prev) => ({ ...prev, [postId]: text }))
              }
              onOpenImage={handleOpenImage}
              onDelete={handleDeletePost}
              onEdit={handleEditPost}
            />
          );
        }

        return (
          <TextPostCard
            key={post.id}
            post={post}
            liked={liked}
            postLikesCount={postLikesCount}
            commentsCount={commentsCount[post.id] || 0}
            currentComment={comments[post.id] || ""}
            likers={listOfLikes[post.id] || []}
            currentUserId={session?.user?.id}
            videoMuted={videoMuted}
            isTooltipOpen={isTooltipOpen}
            isTouchDevice={isTouchDevice}
            onLike={() => curtir(post.id, post.authorId)}
            onComment={comentar}
            onCommentChange={(postId, text) =>
              setComments((prev) => ({ ...prev, [postId]: text }))
            }
            onOpenImage={handleOpenImage}
            onDelete={handleDeletePost}
            onEdit={handleEditPost}
            onToggleComments={toggleComments}
            onToggleMute={() => setVideoMuted((v) => !v)}
            onTooltipEnter={() => {
              if (!isTouchDevice && postLikesCount > 0) {
                setActiveTooltip(post.id)
              }
            }}
            onTooltipLeave={() => {
              if (!isTouchDevice) {
                setActiveTooltip(null)
              }
            }}
            onTooltipTouch={() =>
              setActiveTooltip(isTooltipOpen ? null : post.id)
            }
          />
        );
      })}

      <ImageModal
        image={selectedImage}
        open={openModal}
        onClose={handleCloseImage}
        postId={selectedPostId}
        authorId={selectedAuthorId}
      />

      {editingPost && (
        <EditPostModal
          postId={editingPost.id}
          currentText={editingPost.label}
          onClose={() => setEditingPost(null)}
          onSaved={handleRefresh}
        />
      )}
    </section>
  );
}
