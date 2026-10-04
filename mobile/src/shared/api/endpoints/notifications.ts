import type { Notification } from "@/entities/notification";

import { apiRequest } from "../http-client";

export const notificationsApi = {
  list: () => apiRequest<Notification[]>("/notifications"),

  markRead: (notificationId: string) =>
    apiRequest<Notification>(`/notifications/${notificationId}/read`, {
      method: "POST",
    }),
};
