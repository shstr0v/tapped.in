import type { MusicProfile } from "@/entities/music-profile";

export type ConnectionStatus = "accepted" | "pending" | "rejected";

export type Connection = {
  created_at: string;
  id: string;
  receiver_profile: MusicProfile | null;
  receiver_profile_id: string;
  requester_profile: MusicProfile | null;
  requester_profile_id: string;
  status: ConnectionStatus;
  updated_at: string;
};
