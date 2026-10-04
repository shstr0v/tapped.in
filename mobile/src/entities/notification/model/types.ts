export type NotificationType = "connection_accepted" | "new_feedback";

export type Notification = {
  created_at: string;
  id: string;
  is_read: boolean;
  payload: Record<string, unknown>;
  type: NotificationType;
  user_id: string;
};
