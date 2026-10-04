import { createHash } from "node:crypto";

type MailchimpError = {
  title?: string;
  detail?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validStatuses = new Set(["subscribed", "pending"]);

export const runtime = "nodejs";

function getMailchimpConfig() {
  const apiKey = process.env.MAILCHIMP_API_KEY?.trim();
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID?.trim();
  const tag = process.env.MAILCHIMP_TAG?.trim();
  const requestedStatus = process.env.MAILCHIMP_STATUS?.trim() || "subscribed";
  const status = validStatuses.has(requestedStatus)
    ? requestedStatus
    : "subscribed";
  const serverPrefix = apiKey?.split("-").at(-1);

  if (!apiKey || !audienceId || !serverPrefix || serverPrefix === apiKey) {
    return null;
  }

  return { apiKey, audienceId, serverPrefix, status, tag };
}

function subscriberHash(email: string) {
  return createHash("md5").update(email.toLowerCase()).digest("hex");
}

function authHeader(apiKey: string) {
  return `Basic ${Buffer.from(`tappedin:${apiKey}`).toString("base64")}`;
}

async function readMailchimpError(response: Response) {
  const fallback = "Mailchimp could not add this email right now.";

  try {
    const data = (await response.json()) as MailchimpError;
    return data.detail || data.title || fallback;
  } catch {
    return fallback;
  }
}

async function applyTag({
  apiKey,
  audienceId,
  serverPrefix,
  hash,
  tag,
}: {
  apiKey: string;
  audienceId: string;
  serverPrefix: string;
  hash: string;
  tag: string;
}) {
  const response = await fetch(
    `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${hash}/tags`,
    {
      method: "POST",
      headers: {
        Authorization: authHeader(apiKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tags: [{ name: tag, status: "active" }],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await readMailchimpError(response));
  }
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { ok: false, message: "Send a JSON body with an email field." },
      { status: 400 },
    );
  }

  const email =
    typeof payload === "object" &&
    payload !== null &&
    "email" in payload &&
    typeof payload.email === "string"
      ? payload.email.trim().toLowerCase()
      : "";

  if (!emailPattern.test(email)) {
    return Response.json(
      { ok: false, message: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const config = getMailchimpConfig();

  if (!config) {
    return Response.json(
      {
        ok: false,
        message:
          "Mailchimp is not configured yet. Add MAILCHIMP_API_KEY and MAILCHIMP_AUDIENCE_ID.",
      },
      { status: 500 },
    );
  }

  const hash = subscriberHash(email);

  try {
    const response = await fetch(
      `https://${config.serverPrefix}.api.mailchimp.com/3.0/lists/${config.audienceId}/members/${hash}`,
      {
        method: "PUT",
        headers: {
          Authorization: authHeader(config.apiKey),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          status: config.status,
          status_if_new: config.status,
          merge_fields: {},
        }),
      },
    );

    if (!response.ok) {
      return Response.json(
        { ok: false, message: await readMailchimpError(response) },
        { status: response.status },
      );
    }

    if (config.tag) {
      await applyTag({ ...config, hash, tag: config.tag });
    }

    return Response.json({
      ok: true,
      message:
        config.status === "pending"
          ? "Check your inbox to confirm your spot on the waitlist."
          : "You are on the waitlist. We will send early access soon.",
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Could not join the waitlist right now.",
      },
      { status: 502 },
    );
  }
}
