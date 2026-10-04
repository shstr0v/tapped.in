import { apiRequest } from "./http-client";
import { clearApiSessionHandlers, setSessionSidResolver } from "./session-handlers";

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status >= 400 ? "Request failed" : "OK",
    text: async () => JSON.stringify(body),
  } as Response;
}

describe("apiRequest", () => {
  beforeEach(() => {
    clearApiSessionHandlers();
    globalThis.fetch = jest.fn(async () => jsonResponse(200, { ok: true }));
  });

  it("adds the sid cookie to authenticated requests", async () => {
    setSessionSidResolver(() => "session-123");

    await apiRequest("/profiles/me");

    const [, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect((init.headers as Headers).get("Cookie")).toBe("sid=session-123");
  });

  it("normalizes backend error responses", async () => {
    globalThis.fetch = jest.fn(async () => jsonResponse(422, { detail: "Validation error" }));

    await expect(apiRequest("/profiles/me")).rejects.toMatchObject({
      detail: "Validation error",
      status: 422,
    });
  });
});
