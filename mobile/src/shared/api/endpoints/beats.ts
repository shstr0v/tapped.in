import type { Beat, CreateBeatRequest } from "@/entities/music-upload";

import { apiRequest } from "../http-client";

export const beatsApi = {
  create: (data: CreateBeatRequest) =>
    apiRequest<Beat>("/beats", {
      body: data,
      method: "POST",
    }),
};
