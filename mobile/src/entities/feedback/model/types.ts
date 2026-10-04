import type { MusicProfile } from "@/entities/music-profile";
import type { MusicUpload } from "@/entities/music-upload";

export type FeedbackCategory =
  | "arrangement"
  | "flow"
  | "melody"
  | "mix"
  | "originality"
  | "production"
  | "vocals";

export type CreateFeedbackRequest = {
  category: FeedbackCategory;
  quick_reaction?: string | null;
  target_upload_id: string;
  text?: string | null;
};

export type Feedback = {
  author_profile: MusicProfile | null;
  author_profile_id: string;
  category: FeedbackCategory;
  created_at: string;
  id: string;
  quick_reaction: string | null;
  target_upload: MusicUpload | null;
  target_upload_id: string;
  text: string | null;
};
