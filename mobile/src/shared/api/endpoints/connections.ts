import type { Connection } from "@/entities/connection";

import { apiRequest } from "../http-client";

export const connectionsApi = {
  accept: (connectionId: string) =>
    apiRequest<Connection>(`/connections/${connectionId}/accept`, {
      method: "POST",
    }),

  list: () => apiRequest<Connection[]>("/connections"),

  reject: (connectionId: string) =>
    apiRequest<Connection>(`/connections/${connectionId}/reject`, {
      method: "POST",
    }),

  request: (profileId: string) =>
    apiRequest<Connection>(`/connections/${profileId}/request`, {
      method: "POST",
    }),
};
