import { API_URL } from "@/shared/config/env";

import { resolveSessionCookie } from "./session-handlers";

type QueryValue = boolean | number | string | null | undefined;

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  body?: unknown;
  query?: Record<string, QueryValue>;
};

export class ApiError extends Error {
  data: unknown;
  detail: string;
  status: number;

  constructor(status: number, detail: string, data: unknown) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.data = data;
  }
}

function toQueryString(query?: Record<string, QueryValue>) {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

function parseDetail(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "detail" in data) {
    const detail = (data as { detail?: unknown }).detail;
    return typeof detail === "string" ? detail : fallback;
  }

  return fallback;
}

async function readResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function apiRequest<TResponse>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const { auth = true, body, headers: requestHeaders, query, ...init } = options;
  const headers = new Headers(requestHeaders);

  if (body !== undefined && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const cookie = await resolveSessionCookie();
    if (cookie) {
      headers.set("Cookie", cookie);
    }
  }

  const response = await fetch(`${API_URL}${path}${toQueryString(query)}`, {
    ...init,
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
    headers,
  });
  const data = await readResponse(response);

  if (!response.ok) {
    throw new ApiError(response.status, parseDetail(data, response.statusText), data);
  }

  return data as TResponse;
}
