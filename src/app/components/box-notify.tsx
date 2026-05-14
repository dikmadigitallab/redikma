"use client";

import { useEffect, useState } from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
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

    // 2. Busca notificações da API e consome (deleta do banco)
    async function fetchAndConsume() {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/notifications?userId=${userId}&consume=true`
        );
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

    fetchAndConsume();

    return () => {
      mounted = false;
    };
  }, [userId, cacheKey, lastSeenKey]);

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
              className="p-3 border-b text-sm transition-colors hover:bg-neutral-50 cursor-pointer"
            >
              <div className="text-neutral-800">{n.title}</div>
              <div className="text-neutral-500 text-xs mt-0.5">
                {n.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}