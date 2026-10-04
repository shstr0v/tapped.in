import type { ExperienceLevel, MusicProfileRole } from "@/entities/music-profile";

export type RecommendationFilters = {
  genre?: string | null;
  limit?: number;
  location?: string | null;
  role?: MusicProfileRole | null;
};

export type MatchScore = {
  breakdown: Record<string, number>;
  reasons: string[];
  score: number;
};

export type FeedUserAccount = {
  avatar_url: string | null;
  bio: string | null;
  collaboration_status: string | null;
  experience_level: ExperienceLevel | null;
  id: string;
  location: string | null;
  name: string;
  profile_id: string;
  role: MusicProfileRole;
  tags: string[];
};

export type FeedPreviewBeat = {
  audio_url: string;
  bpm: number | null;
  description: string | null;
  genre: string | null;
  id: string;
  tags: string[];
  title: string;
};

export type FeedProfile = {
  id: string;
  image_url: string | null;
  preview_beat: FeedPreviewBeat;
  user_account: FeedUserAccount;
};

export type RecommendationCard = {
  match: MatchScore;
  profile: FeedProfile;
};
