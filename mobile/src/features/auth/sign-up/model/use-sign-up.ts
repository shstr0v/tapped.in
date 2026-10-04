import { useMutation } from "@tanstack/react-query";

import type { SignUpRequest } from "@/entities/user";
import { authApi } from "@/shared/api";

export function useSignUp() {
  return useMutation({
    mutationFn: (data: SignUpRequest) => authApi.signUp(data),
  });
}
