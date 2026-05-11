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

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/notifications?userId=${userId}`);
        const data = await res.json();

        if (!mounted) return;

        // Garante que, mesmo se a API falhar, não quebra a tela
        if (Array.isArray(data)) {
          setNotifications(data);
        } else if (data.notifications) {
          setNotifications(data.notifications);
        } else {
          setNotifications([]);
        }
      } catch (err) {
        console.error("Erro ao buscar notificações:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [userId]); // Removi o `open` que não existia aqui

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
              className={`p-3 border-b text-sm transition-colors hover:bg-neutral-50 cursor-pointer ${
                n.read ? "opacity-60 bg-white" : "font-medium bg-blue-50/30"
              }`}
            >
              <div className="text-neutral-800">{n.title}</div>
              <div className="text-neutral-500 text-xs mt-0.5">
                {n.message}
                {n.id}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}