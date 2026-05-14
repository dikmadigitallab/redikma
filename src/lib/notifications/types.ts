// src/lib/notifications/types.ts

export type NotificationType =
  | "LIKE"
  | "COMMENT"
  | "NEW_POST"
  | "REACTION"
  | "PROFILE_UPDATE"
  | "PROMOTION"
  | "BIRTHDAY"
  | "WORK_ANNIVERSARY";

export interface NotifyParams {
  type: NotificationType;
  title: string;
  message: string;
  userIds?: string[];
  actorId: string;
  data?: Record<string, any>;
  excludeCurrentUser?: boolean;
}