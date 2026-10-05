export type MessageType = "beat" | "text";

export type ChatUser = {
  artist_name: string;
  avatar_url: string | null;
  profile_id: string | null;
  role: "artist" | "producer" | null;
  user_id: string;
};

export type BeatPreview = {
  audio_url: string;
  bpm: number | null;
  genre: string | null;
  id: string;
  owner: ChatUser | null;
  profile_id: string;
  tags: string[];
  title: string;
};

export type ChatMessage = {
  beat: BeatPreview | null;
  conversation_id: string;
  created_at: string;
  id: string;
  read_at: string | null;
  sender_id: string;
  text: string | null;
  type: MessageType;
};

export type ConversationSummary = {
  created_at: string;
  id: string;
  last_message: ChatMessage | null;
  last_message_at: string | null;
  other_user: ChatUser;
  unread_count: number;
};

export const conversationKeys = {
  list: ["conversations"] as const,
  messages: (conversationId: string) => ["conversations", conversationId, "messages"] as const,
};
