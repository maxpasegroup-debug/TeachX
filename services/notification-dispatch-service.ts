import type { ActivityType } from "@prisma/client";

import { createModuleNotification } from "@/services/notification-aggregation-service";
import { recordActivity } from "@/services/activity-service";

export async function dispatchNotification(input: {
  institutionId?: string | null;
  userId?: string | null;
  actorId?: string | null;
  type: ActivityType;
  title: string;
  body?: string;
  link?: string;
}) {
  const [notification, activity] = await Promise.all([
    createModuleNotification(input),
    recordActivity({ institutionId: input.institutionId, actorId: input.actorId, type: input.type, title: input.title, body: input.body, link: input.link })
  ]);

  return { notification, activity };
}
