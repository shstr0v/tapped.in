import type { CompleteUserRequest, UpdateUserRequest, User } from "@/entities/user";

import { apiRequest } from "../http-client";

export const usersApi = {
  completeMe: (data: CompleteUserRequest) =>
    apiRequest<User>("/users/me/complete", {
      body: data,
      method: "POST",
    }),

  createGuest: (email?: string | null) =>
    apiRequest<User>("/users/guest", {
      auth: false,
      body: { email },
      method: "POST",
    }),

  getByUsername: (username: string) => apiRequest<User>(`/users/by-username/${username}`),

  getMe: () => apiRequest<User>("/users/me"),

  updateMe: (data: UpdateUserRequest) =>
    apiRequest<User>("/users/me", {
      body: data,
      method: "PATCH",
    }),
};
