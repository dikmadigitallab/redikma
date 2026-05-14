"use client";

import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actor?: {
    nome: string;
    foto: string | null;
  } | null;
};

export function NotificationsBox({ userId }: { userId: string }) {
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
      } catch {}
    }

    // 2. Busca notificações da API
    async function fetchData() {
      try {
        setLoading(true);

        const res = await fetch(`/api/notifications?userId=${userId}`);
        const data = await res.json();

        if (!mounted) return;

        const fetched: Notification[] = Array.isArray(data)
          ? data
          : Array.isArray(data.notifications)
            ? data.notifications
            : [];

        setNotifications(fetched);

        // Salva no localStorage para persistir localmente
        localStorage.setItem(cacheKey, JSON.stringify(fetched));

        if (fetched.length > 0) {
          localStorage.setItem(lastSeenKey, fetched[0].createdAt);
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

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/notifications?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) return;

      const updated = notifications.filter((n) => n.id !== id);
      setNotifications(updated);
      localStorage.setItem(cacheKey, JSON.stringify(updated));
    } catch (err) {
      console.error("Erro ao deletar notificação:", err);
    }
  }

  return (
    <div className="w-80 bg-white border border-neutral-200 shadow-xl rounded-xl overflow-hidden">
      <div className="p-3 border-b font-medium text-neutral-800 bg-neutral-50 flex justify-between items-center">
        <span>Notificações</span>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 flex justify-center text-sm text-neutral-500">
            Carregando notificações...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-neutral-500">
            Nenhuma notificação por enquanto.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="group flex items-start gap-3 p-3 border-b text-sm transition-colors hover:bg-neutral-50"
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
                <div className="text-neutral-500 text-xs mt-0.5 truncate">
                  {n.message}
                </div>
              </div>

              <button
                onClick={() => handleDelete(n.id)}
                className="shrink-0 mt-1 text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition"
                title="Deletar notificação"
              >
                <FaTrash size={10} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}