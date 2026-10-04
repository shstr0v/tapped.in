import type { MusicProfile } from "@/entities/music-profile";

import { apiRequest } from "../http-client";

export type SwipeAction = "like" | "save" | "skip";

export type SwipeRequest = {
  action: SwipeAction;
  target_profile_id: string;
};

export const swipesApi = {
  listSaved: () => apiRequest<MusicProfile[]>("/swipes/saved"),

  swipe: (data: SwipeRequest) =>
    apiRequest<unknown>("/swipes", {
      body: data,
      method: "POST",
    }),
};
