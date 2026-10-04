import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { UpsertMusicProfileRequest } from "@/entities/music-profile";
import { profilesApi } from "@/shared/api";

export function useCompleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpsertMusicProfileRequest) => profilesApi.upsertMe(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profiles", "me"] });
    },
  });
}
