import { useMutation, useQueryClient } from "@tanstack/react-query";

import { swipesApi, type SwipeRequest } from "@/shared/api/endpoints/swipes";

export function useSwipeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SwipeRequest) => swipesApi.swipe(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["recommendations", "feed"] });
      void queryClient.invalidateQueries({ queryKey: ["swipes", "saved"] });
    },
  });
}
