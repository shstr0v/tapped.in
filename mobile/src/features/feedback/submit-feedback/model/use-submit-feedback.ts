import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateFeedbackRequest } from "@/entities/feedback";
import { feedbackApi } from "@/shared/api";

export function useSubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeedbackRequest) => feedbackApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["feedback", "me"] });
    },
  });
}
