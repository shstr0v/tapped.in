export type MusicUpload = {
  audio_url: string;
  bpm: number | null;
  created_at: string;
  description: string | null;
  genre: string | null;
  id: string;
  is_featured: boolean;
  profile_id: string;
  tags: string[];
  title: string;
};

export type CreateFeaturedUploadRequest = {
  audio_url: string;
  bpm?: number | null;
  description?: string | null;
  genre?: string | null;
  tags?: string[];
  title: string;
};
