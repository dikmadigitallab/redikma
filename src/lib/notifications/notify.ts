// src/lib/notifications/notify.ts

import { prisma } from "@/lib/prisma";
import { NotifyParams } from "./types";

export async function notify({
  type,
  title,
  message,
  userIds,
  actorId,
  data,
  excludeCurrentUser,
}: NotifyParams) {
  let targets = userIds ?? [];

  if (!targets.length) return;

  if (excludeCurrentUser) {
    targets = targets.filter((id) => id !== actorId);
  }

  targets = [...new Set(targets)].filter(Boolean);

  if (!targets.length) return;

  await prisma.notification.createMany({
    data: targets.map((userId) => ({
      userId,
      actorId,
      type,
      title,
      message,
      data: data ?? {},
      read: false,
    })),
  });
}

// src/lib/notifications/index.ts

export * from "./notify";
export * from "./types";