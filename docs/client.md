# Client (mobile) — Feature-Sliced Design

← [README](../README.md) · [Server](server.md) · [MVP Plan](MVP-PLAN.md)

The client is Expo / React Native in TypeScript, with routing via `expo-router` (the `mobile/app` folder), server state in TanStack Query, local/session state in Zustand, and the session stored in `expo-secure-store`.

## Why FSD

- **Predictability.** It's immediately clear where to find any code: by "layer" (what it is) and by "slice" (what it's about).
- **One-way dependencies.** Upper layers know about lower ones, but not the other way around — no cycles, and changes don't "leak" upward.
- **Parallel work.** Different people build different features/pages with almost no conflicts.
- **Isolation of business entities.** Entity types and APIs (`music-profile`, `connection`, …) are reused across any feature.
- **Public API of a slice.** Only what `index.ts` exports is visible from outside.

## Layers (top to bottom)

| Layer | Purpose | Folder |
|---|---|---|
| `app` | providers (Query, session), initialization | `src/app` (+ routes in `mobile/app`) |
| `pages` | screens, composition only | `src/pages` |
| `widgets` | large self-contained UI blocks | `src/widgets` |
| `features` | user scenarios (actions) | `src/features` |
| `entities` | business entities: types, model, queries | `src/entities` |
| `shared` | reusable code with no business meaning: HTTP client, config, UI kit, utilities | `src/shared`, `src/components` |

**Import rule:** a layer imports only from layers strictly below it; slices of the same layer don't import each other; imports go only through a slice's `index.ts`.

## Structure

```text
mobile/
├── app/                      # expo-router: (auth), (onboarding), (tabs), profile, feedback
└── src/
    ├── app/providers/
    ├── pages/                # welcome, auth, onboarding, feed, connections, notifications,
    │                         # my-profile, edit-profile, profile-details, feedback, root
    ├── widgets/              # audio-player, feed-card, navigation, onboarding-stepper, profile-header
    ├── features/
    │   ├── auth/             # sign-in, sign-up
    │   ├── feed/             # swipe-profile
    │   ├── connections/  feedback/  notifications/  profile/  uploads/
    ├── entities/
    │   ├── session/          # model (zustand store), lib (secure-store)
    │   ├── user/  music-profile/  music-upload/
    │   ├── recommendation/  connection/  notification/  feedback/
    └── shared/
        ├── api/              # http-client, session-handlers, endpoints/*
        ├── config/env.ts     # API_URL from EXPO_PUBLIC_API_URL
        ├── constants/  lib/  styles/
```

## Working with the API

The single network exit point is `shared/api/http-client.ts` (`apiRequest`):

- base URL comes from `EXPO_PUBLIC_API_URL`;
- attaches the session cookie (`sid=…`) via registered handlers (`session-handlers.ts`) configured by the `entities/session` layer — so `shared` doesn't depend on upper layers;
- normalizes errors into `ApiError { status, detail, data }`;
- serializes `body` and `query`.

Endpoint definitions are grouped by resource in `shared/api/endpoints/*` (`auth`, `users`, `profiles`, `uploads`, `recommendations`, `swipes`, `connections`, `feedback`, `notifications`). Example:

```ts
export const swipesApi = {
  listSaved: () => apiRequest<MusicProfile[]>("/swipes/saved"),
  swipe: (data: SwipeRequest) =>
    apiRequest<unknown>("/swipes", { body: data, method: "POST" }),
};
```

Entities (`entities/*`) re-export types and the model, features (`features/*`) wrap calls in TanStack Query hooks/mutations and implement the scenario (e.g. `useEmailSignIn`, `swipe-profile`), and pages merely assemble everything and show loading / error / empty states.

## Authentication and session

1. `features/auth/sign-up` / `sign-in` call `/auth/signup` and `/auth/email/login` (as well as the phone flow `/auth/phone/*`).
2. The backend returns a session id; `entities/session` stores it in `expo-secure-store` and the Zustand store.
3. `http-client` adds `Cookie: sid=…` to all requests.
4. The root route restores the session on startup and redirects: no session → `(auth)`, no profile → `(onboarding)`, otherwise → `(tabs)`.
5. Logout: `/auth/logout` + clearing secure-store.

## Notes

- **Thin pages** — all logic lives in features/entities.
- **Tests:** jest, e.g. `shared/api/http-client.test.ts`. Run with: `make test-mobile`.
- **UI:** NativeWind (Tailwind classes) + custom components in `src/components/ui`, a light "sky-blue" theme.
- **Environment:** all public variables are prefixed with `EXPO_PUBLIC_`.

## Running the client separately

```bash
cd mobile
cp .env.example .env     # see README for EXPO_PUBLIC_API_URL
npm install
npx expo start           # i / a / w
npm run lint && npx tsc --noEmit
```

Or in Docker from the repo root: `make mobile-up` (Metro on port `MOBILE_PORT`, 8081 by default). A table of `EXPO_PUBLIC_API_URL` values for the simulator, emulator, and a physical device is in the [README](../README.md#запуск).
