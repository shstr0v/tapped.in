import { useMutation, useQueryClient } from "@tanstack/react-query";

import { connectionsApi } from "@/shared/api";

export function useRequestConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profileId: string) => connectionsApi.request(profileId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}
