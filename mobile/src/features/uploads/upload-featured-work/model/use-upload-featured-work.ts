import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { CreateFeaturedUploadRequest } from "@/entities/music-upload";
import { uploadsApi } from "@/shared/api";

export function useUploadFeaturedWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeaturedUploadRequest) => uploadsApi.createFeatured(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["uploads", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["profiles", "me"] });
    },
  });
}
