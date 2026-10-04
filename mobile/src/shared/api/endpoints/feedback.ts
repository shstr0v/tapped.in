import type { CreateFeedbackRequest, Feedback } from "@/entities/feedback";

import { apiRequest } from "../http-client";

export const feedbackApi = {
  create: (data: CreateFeedbackRequest) =>
    apiRequest<Feedback>("/feedback", {
      body: data,
      method: "POST",
    }),

  listMine: () => apiRequest<Feedback[]>("/feedback/me"),
};
