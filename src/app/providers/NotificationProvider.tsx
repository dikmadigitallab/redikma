// src/app/providers/NotificationProvider.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

type NotificationType =
  | "LIKE"
  | "COMMENT"
  | "NEW_POST"
  | "REACTION"
  | "PROFILE_UPDATE"
  | "PROMOTION"
  | "BIRTHDAY"
  | "WORK_ANNIVERSARY";

interface NotifyPayload {
  type: NotificationType;
  title: string;
  message: string;
  userIds?: string[];
  excludeCurrentUser?: boolean;
  data?: Record<string, any>;
}

interface NotificationContextData {
  notify: (payload: NotifyPayload) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextData | null>(null);

export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { data: session } = useSession();

  // Extrai o ID antes para evitar o aviso do React Compiler
  const actorId = session?.user?.id;

  const notify = useCallback(
    async (payload: NotifyPayload): Promise<boolean> => {
      try {
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            actorId,
          }),
        });

        if (!response.ok) {
          throw new Error("Erro ao enviar notificação");
        }

        return true;
      } catch (error) {
        console.error("Erro ao enviar notificação:", error);
        return false;
      }
    },
    [actorId]
  );

  const value = useMemo(
    () => ({
      notify,
    }),
    [notify]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification deve ser utilizado dentro de NotificationProvider"
    );
  }

  return context;
}