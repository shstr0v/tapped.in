import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadBeat } from "./upload-beat";

export function useUploadBeat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadBeat,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["beats", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["profiles", "me"] });
      void queryClient.invalidateQueries({ queryKey: ["uploads", "me"] });
    },
  });
}
