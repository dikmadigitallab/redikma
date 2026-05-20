"use client";

import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { usePostModal } from "../providers/PostModalContext";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 5) return "agora";
  if (diffSec < 60) return `há ${diffSec} segundos atrás`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return diffMin === 1 ? "há 1 minuto atrás" : `há ${diffMin} minutos atrás`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return diffH === 1 ? "há 1 hora atrás" : `há ${diffH} horas atrás`;

  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return diffD === 1 ? "há 1 dia atrás" : `há ${diffD} dias atrás`;

  if (diffD === 7) return "há 1 semana atrás";

  // Mais de 1 semana → mostra data
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any> | null;
  actor?: {
    nome: string;
    foto: string | null;
  } | null;
};

export function NotificationsBox({ userId }: { userId: string }) {
  const { openPost } = usePostModal();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const cacheKey = `notifications-cache-${userId}`;
  const lastSeenKey = `notifications-last-seen-${userId}`;

  useEffect(() => {
    let mounted = true;

    // 1. Carrega cache local imediatamente (se existir)
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
          setLoading(false);
        }
      } catch { }
    }

    // 2. Busca notificações da API (sem deletar do banco)
    async function fetchData() {
      try {
        setLoading(true);

        const res = await fetch(`/api/notifications?userId=${userId}&all=true`);
        const data = await res.json();

        if (!mounted) return;

        const fetched: Notification[] = Array.isArray(data)
          ? data
          : Array.isArray(data.notifications)
            ? data.notifications
            : [];

        // Merge: notificações novas (do DB) são prepended às que já estavam em cache
        if (fetched.length > 0) {
          const existingIds = new Set(notifications.map((n) => n.id));
          const trulyNew = fetched.filter((n) => !existingIds.has(n.id));
          const merged = [...trulyNew, ...notifications];
          setNotifications(merged);
          localStorage.setItem(cacheKey, JSON.stringify(merged));
          localStorage.setItem(lastSeenKey, merged[0].createdAt);

          // 3. Após salvar no localStorage, deleta do banco
          fetch(`/api/notifications?clearAll=true&userId=${userId}`, {
            method: "DELETE",
          }).catch(() => { });
        } else {
          localStorage.setItem(lastSeenKey, new Date().toISOString());
        }
      } catch (err) {
        console.error("Erro ao buscar notificações:", err);

        if (mounted) {
          setNotifications([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [userId, cacheKey, lastSeenKey]);

  function handleDelete(id: string) {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem(cacheKey, JSON.stringify(updated));
  }

  return (
    <div className="w-80 bg-white border border-[var(--primary)] shadow-xl rounded-xl overflow-hidden">
      <div className="p-3 border-b font-medium text-neutral-800 bg-neutral-50 flex justify-between items-center">
        <span>Notificações</span>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 flex justify-center text-sm text-[var(--primary)]">
            Carregando notificações...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-[var(--primary)]">
            Nenhuma notificação por enquanto.
          </div>
        ) : (
          notifications.map((n) => {
            const postId = n.data?.postId as string | undefined;

            return (
              <div
                key={n.id}
                className="group flex items-start gap-3 p-3 border-b text-sm transition-colors hover:bg-neutral-50"
              >
                <button
                  onClick={() => {
                    if (postId) openPost(postId);
                  }}
                  className="flex items-start gap-3 flex-1 min-w-0 text-left"
                >
                  <img
                    src={
                      n.actor?.foto ||
                      "/photoProfile/userDefault.png"
                    }
                    alt={n.actor?.nome || "Usuário"}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="text-neutral-800 truncate">{n.title}</div>
                    <div className="text-[var(--primary)] text-xs mt-0.5 truncate">
                      {n.message}
                    </div>
                    <div className="text-neutral-400 text-[10px] mt-1">
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(n.id);
                  }}
                  className="shrink-0 mt-1 text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:text-red-600 transition"
                  title="Deletar notificação"
                >
                  <FaTrash size={10} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}