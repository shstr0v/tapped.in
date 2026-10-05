import { useMutation } from "@tanstack/react-query";

import type { EmailCodeRequest, EmailCodeVerifyRequest } from "@/entities/user";
import { authApi } from "@/shared/api";

export function useRequestEmailCode() {
  return useMutation({
    mutationFn: (data: EmailCodeRequest) => authApi.requestEmailCode(data),
  });
}

export function useVerifyEmailCode() {
  return useMutation({
    mutationFn: (data: EmailCodeVerifyRequest) => authApi.verifyEmailCode(data),
  });
}
