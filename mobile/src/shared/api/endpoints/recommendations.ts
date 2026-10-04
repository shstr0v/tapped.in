import type { RecommendationCard, RecommendationFilters } from "@/entities/recommendation";

import { apiRequest } from "../http-client";

export const recommendationsApi = {
  decline: (profileId: string) =>
    apiRequest<unknown>(`/recommendations/${profileId}/decline`, {
      method: "POST",
    }),

  feed: (filters: RecommendationFilters = {}) =>
    apiRequest<RecommendationCard[]>("/recommendations/feed", {
      query: filters,
    }),

  score: (profileId: string) => apiRequest<RecommendationCard["match"]>(`/recommendations/${profileId}/score`),

  sendRequest: (profileId: string) =>
    apiRequest<unknown>(`/recommendations/${profileId}/send-request`, {
      method: "POST",
    }),
};
