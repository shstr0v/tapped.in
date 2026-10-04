# TappedIn Landing

Mobile-first Next.js landing page for TappedIn, a music-first matching network for artists and producers.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Bun
- Mailchimp Marketing API via `app/api/waitlist/route.ts`

## Setup

```bash
bun install
bun run dev
```

Open `http://localhost:3000`.

## Mailchimp

Copy the values into `.env.local`:

```bash
MAILCHIMP_API_KEY=
MAILCHIMP_AUDIENCE_ID=
MAILCHIMP_TAG=waitlist
MAILCHIMP_STATUS=subscribed
```

`MAILCHIMP_API_KEY` must include the Mailchimp server suffix, for example `...-us21`.
Use `MAILCHIMP_STATUS=pending` if you want double opt-in.

## Checks

```bash
bun run lint
bun run build
```
