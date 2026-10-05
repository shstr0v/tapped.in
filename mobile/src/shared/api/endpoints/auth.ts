import type {
  AuthSessionResponse,
  EmailCodeRequest,
  EmailCodeVerifyRequest,
  EmailLoginRequest,
  PhoneLoginRequest,
  PhoneLoginVerifyRequest,
  SignUpRequest,
} from "@/entities/user";

import { apiRequest } from "../http-client";
import { clearPersistedSession, persistSessionSid } from "../session-handlers";

async function persistAuthResponse<TResponse extends { sid: string }>(response: TResponse) {
  await persistSessionSid(response.sid);
  return response;
}

export const authApi = {
  async emailLogin(data: EmailLoginRequest) {
    const response = await apiRequest<AuthSessionResponse>("/auth/email/login", {
      auth: false,
      body: data,
      method: "POST",
    });
    return persistAuthResponse(response);
  },

  requestEmailCode: (data: EmailCodeRequest) =>
    apiRequest<unknown>("/auth/email/code", {
      auth: false,
      body: data,
      method: "POST",
    }),

  async verifyEmailCode(data: EmailCodeVerifyRequest) {
    const response = await apiRequest<AuthSessionResponse>("/auth/email/verify", {
      auth: false,
      body: data,
      method: "POST",
    });
    return persistAuthResponse(response);
  },

  logout: async () => {
    await apiRequest<void>("/auth/logout", { method: "POST" });
    await clearPersistedSession();
  },

  phoneLogin: (data: PhoneLoginRequest) =>
    apiRequest<{ user?: unknown }>("/auth/phone/login", {
      auth: false,
      body: data,
      method: "POST",
    }),

  async phoneVerify(data: PhoneLoginVerifyRequest) {
    const response = await apiRequest<AuthSessionResponse>("/auth/phone/verify", {
      auth: false,
      body: data,
      method: "POST",
    });
    return persistAuthResponse(response);
  },

  async signUp(data: SignUpRequest) {
    const response = await apiRequest<AuthSessionResponse>("/auth/signup", {
      auth: false,
      body: data,
      method: "POST",
    });
    return persistAuthResponse(response);
  },

  verifyPhone: (code: string) =>
    apiRequest<unknown>("/auth/phone/activate", {
      body: { code },
      method: "POST",
    }),
};
