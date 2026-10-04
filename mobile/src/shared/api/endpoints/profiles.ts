import type {
  MusicProfile,
  UpdateMusicProfileRequest,
  UpsertMusicProfileRequest,
} from "@/entities/music-profile";

import { apiRequest } from "../http-client";

export const profilesApi = {
  getById: (profileId: string) => apiRequest<MusicProfile>(`/profiles/${profileId}`),

  getMe: () => apiRequest<MusicProfile>("/profiles/me"),

  updateMe: (data: UpdateMusicProfileRequest) =>
    apiRequest<MusicProfile>("/profiles/me", {
      body: data,
      method: "PATCH",
    }),

  upsertMe: (data: UpsertMusicProfileRequest) =>
    apiRequest<MusicProfile>("/profiles/me", {
      body: data,
      method: "POST",
    }),
};
