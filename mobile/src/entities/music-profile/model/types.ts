import type { MusicUpload } from "@/entities/music-upload";

export type MusicProfileRole = "artist" | "producer";
export type ExperienceLevel = "advanced" | "beginner" | "intermediate" | "pro";
export type CollaborationStatus =
  | "closed"
  | "looking_for_artists"
  | "looking_for_producers"
  | "open";
export type SocialPlatform = "instagram" | "other" | "soundcloud" | "spotify" | "youtube";

export type MusicIdentity = {
  bpm_max: number | null;
  bpm_min: number | null;
  genres: string[];
  influences: string[];
  moods: string[];
  type_beats: string[];
};

export type SocialLink = {
  id: string;
  platform: SocialPlatform;
  url: string;
};

export type MusicProfile = {
  artist_name: string;
  avatar_url: string | null;
  bio: string | null;
  collaboration_status: CollaborationStatus;
  created_at: string;
  experience_level: ExperienceLevel;
  featured_upload: MusicUpload | null;
  id: string;
  identity: MusicIdentity | null;
  location: string | null;
  role: MusicProfileRole;
  socials: SocialLink[];
  updated_at: string;
  user_id: string;
};

export type MusicIdentityRequest = {
  bpm_max?: number | null;
  bpm_min?: number | null;
  genres?: string[];
  influences?: string[];
  moods?: string[];
  type_beats?: string[];
};

export type SocialLinkRequest = {
  platform: SocialPlatform;
  url: string;
};

export type UpsertMusicProfileRequest = {
  artist_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  collaboration_status?: CollaborationStatus;
  experience_level: ExperienceLevel;
  identity?: MusicIdentityRequest | null;
  location?: string | null;
  role: MusicProfileRole;
  socials?: SocialLinkRequest[];
};

export type UpdateMusicProfileRequest = Partial<
  Omit<UpsertMusicProfileRequest, "identity" | "socials">
> & {
  identity?: MusicIdentityRequest | null;
  socials?: SocialLinkRequest[] | null;
};
