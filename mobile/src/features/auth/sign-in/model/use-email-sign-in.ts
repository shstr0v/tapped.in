import { useMutation } from "@tanstack/react-query";

import type { EmailLoginRequest } from "@/entities/user";
import { authApi } from "@/shared/api";

export function useEmailSignIn() {
  return useMutation({
    mutationFn: (data: EmailLoginRequest) => authApi.emailLogin(data),
  });
}
