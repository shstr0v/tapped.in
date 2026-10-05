# TappedIn Client

Mobile client documentation

The TappedIn client is an Expo React Native application (iOS, Android and Expo Web) written in TypeScript. Its source code follows **Feature-Sliced Design (FSD)**: the code is split into layers by business meaning, and each layer may only import from the layers below it. This document describes the layers and conventions, shows the real folder tree, explains how the client talks to the backend and how to run it.

Back to the [project README](../README.md) | [Server docs](server.md) | [MVP plan](MVP-PLAN.md)

## Technology

- Expo SDK 57, React Native 0.86, React 19, TypeScript (strict)
- Expo Router (file-based navigation, typed routes)
- NativeWind 4 + Tailwind CSS 3, `class-variance-authority`, `tailwind-merge`
- TanStack Query 5 for server state, Zustand for local state (session)
- `expo-secure-store` for the session id, `expo-audio` for the player, `expo-image-picker` and `expo-document-picker` for media
- Jest (`jest-expo`) + Testing Library, ESLint (`eslint-config-expo`), Prettier
- Path alias `@/*` -> `src/*` (`tsconfig.json`, `babel.config.js`, Jest `moduleNameMapper`)

## Feature-Sliced Design in This Project

FSD organises code on three levels:

- **Layers** - the top-level folders of `src/`, ordered from the most "global" to the most "generic".
- **Slices** - business-meaning folders inside a layer (`entities/music-profile`, `features/feed/swipe-profile`).
- **Segments** - technical folders inside a slice (`model`, `ui`, `lib`, `api`).

### Layers

| Layer | Folder | Responsibility |
| --- | --- | --- |
| app | `src/app/` | App-wide setup: providers (query client, session hydration, theme). |
| pages | `src/pages/` | Full screens. Compose widgets and features, own layout and navigation calls. |
| widgets | `src/widgets/` | Large self-sufficient UI blocks: feed card, audio player, profile header, tab bar, onboarding stepper. |
| features | `src/features/` | User actions with business value: sign in, sign up, swipe a profile, request a connection, submit feedback, upload a featured track. |
| entities | `src/entities/` | Business entities: types and (for `session`) state of `user`, `music-profile`, `music-upload`, `recommendation`, `connection`, `feedback`, `notification`, `session`. |
| shared | `src/shared/` | Reusable, business-agnostic code: API client and endpoints, config, constants, helpers, styles. |

There is also `src/components/` (`ui/` kit built on NativeWind - `Button`, `Card`, `Chip`, `Input`, `Text`, `Badge`, `EmptyState` - and `layout/Screen`). It is not an official FSD layer; it is treated as an extension of `shared` and may only depend on `shared`.

### Dependency rule

A module may import only from layers **strictly below** it, never from the same layer's other slices and never upwards:

```text
app  ->  pages  ->  widgets  ->  features  ->  entities  ->  shared
```

- `pages` import widgets, features, entities, shared.
- `features` import entities and shared, never other features or widgets.
- `entities` import only `shared` (and, where a type genuinely depends on another entity, its public API - e.g. `recommendation` imports `MusicProfileRole` from `@/entities/music-profile`).
- `shared` imports nothing from the layers above.
- Every slice exposes a **public API** in its `index.ts`; other code imports `@/entities/music-profile`, not `@/entities/music-profile/model/types`.

### Folder tree

```text
mobile/
├── app/                              # Expo Router route files (thin: re-export pages)
│   ├── _layout.tsx                   # root layout: gesture handler, global CSS, AppProviders, Stack
│   ├── index.tsx                     # -> pages/root
│   ├── (auth)/                       # sign-in, sign-up
│   ├── (onboarding)/                 # profile, music, upload
│   ├── (tabs)/                       # feed, chats, chat/[id], connections, notifications, my-profile, edit-profile
│   ├── feedback/[uploadId].tsx
│   └── profile/[id].tsx
├── assets/                           # logo, icons (svg), images, demo audio
└── src/
    ├── app/
    │   └── providers/                # index, query-provider, session-provider, theme-provider
    ├── pages/
    │   ├── auth/                     # sign-in.tsx, sign-up.tsx, ui/auth-kit.tsx
    │   ├── chat/                     # index.tsx, model/use-chat-playback.ts, ui/{thread,beat-sheet}.tsx
    │   ├── chats/                    # index.tsx, ui/states.tsx
    │   ├── feed/                     # index.tsx, ui/feed-states.tsx
    │   ├── onboarding/               # profile.tsx, music.tsx, upload-work.tsx, model/draft-store.ts, ui/onboarding-kit.tsx
    │   ├── connections/  edit-profile/  feedback/  my-profile/  notifications/
    │   └── profile-details/  root/  welcome/
    ├── widgets/
    │   ├── audio-player/             # ui/audio-player.tsx
    │   ├── feed-card/                # ui/feed-card.tsx
    │   ├── navigation/               # tabs-layout.tsx, tab-bar.tsx
    │   ├── onboarding-stepper/       # ui/onboarding-stepper.tsx
    │   └── profile-header/           # ui/profile-header.tsx
    ├── features/
    │   ├── auth/sign-in/             # model/use-email-sign-in.ts, model/use-email-code-sign-in.ts
    │   ├── auth/sign-up/             # model/use-sign-up.ts
    │   ├── chat/send-message/
    │   ├── connections/request-connection/
    │   ├── feed/swipe-profile/
    │   ├── feedback/submit-feedback/
    │   ├── notifications/mark-notification-read/
    │   ├── profile/complete-profile/
    │   └── uploads/upload-featured-work/
    ├── entities/
    │   ├── connection/  conversation/  feedback/  music-profile/  music-upload/
    │   ├── notification/  recommendation/  user/        # model/types.ts + index.ts
    │   └── session/                                     # lib/session-storage.ts, model/session-store.ts
    ├── shared/
    │   ├── api/                      # http-client.ts, session-handlers.ts, endpoints/*.ts, index.ts
    │   ├── config/env.ts             # API_URL
    │   ├── constants/brand.ts
    │   ├── lib/                      # cn.ts (clsx + tailwind-merge), reduce-motion.ts
    │   └── styles/global.css
    └── components/                   # UI kit (ui/*: avatar, badge, button, card, chip, ...) and layout/screen.tsx
```

Each slice contains only the segments it needs. For example the `swipe-profile` slice is just `index.ts` + `model/use-swipe-profile.ts`.

### Why FSD

- **Predictable place for everything.** A new developer finds "what happens when I swipe" in `features/feed/swipe-profile`, "what a feed card looks like" in `widgets/feed-card`, and "what a recommendation looks like" in `entities/recommendation`.
- **Explicit, enforceable dependencies.** The one-directional layer order prevents the usual mobile-app tangle where screens, hooks and API files import each other in circles.
- **Parallel work.** Slices on the same layer are independent, so several people (or agents) can build `features/*` and `widgets/*` at the same time with few merge conflicts - which matters in a hackathon-style MVP.
- **Cheap refactoring.** A slice can be removed or rewritten as long as its public API stays the same; internals are never imported from outside.
- **Fits the product.** TappedIn is organised around user actions (swipe, connect, give feedback) and business entities (profile, upload, connection), which map one-to-one to FSD features and entities.

### Peculiarities of this setup

- **Expo Router needs a top-level `app/` directory**, which collides with the FSD `app` layer name. Route files in `mobile/app/` are therefore one-line re-exports of pages:

  ```tsx
  // mobile/app/(tabs)/feed.tsx
  export { FeedPage as default } from "@/pages/feed";
  ```

  Navigation structure (groups, tabs, stacks) lives in `mobile/app/`, while screen contents live in `src/pages/`. The FSD `app` layer is `src/app/`. `EXPO_ROUTER_APP_ROOT=app` and `extra.router.root` in `app.json` make this explicit.
- **Pages are mostly flat files** (`pages/auth/sign-in.tsx`) or folders with `index.tsx`. When a screen needs page-local helpers they live in its own `ui/` and `model/` segments (`pages/chat/ui/thread.tsx`, `pages/onboarding/model/draft-store.ts`) and are not exported to other layers.
- **Features expose hooks, not components.** A feature is a TanStack Query mutation/query wrapped in a hook; the page decides how to render it.
- **API functions live in `shared/api`, types live in `entities`.** See the next section.
- **`src/components/` is outside the official FSD layers** (a shared UI kit); it follows the same rule as `shared`.
- **Local flow state belongs to the page.** The multi-step onboarding keeps its draft in a page-level Zustand store (`pages/onboarding/model/draft-store.ts`) until the final step submits the profile, identity and featured upload to the backend.
- **Optimistic updates live in features.** `features/chat/send-message` inserts a pending message into the TanStack Query cache and rolls it back on error.

## API Calls and Entities

The convention is:

1. **Types of backend payloads belong to entities.** Every entity slice has `model/types.ts` with request/response types matching the backend schemas (snake_case, as sent by FastAPI) and exports them from `index.ts`.
2. **Transport belongs to `shared/api`.** `http-client.ts` implements `apiRequest`, and `endpoints/*.ts` group calls by backend router (`authApi`, `profilesApi`, `uploadsApi`, `recommendationsApi`, `swipesApi`, `connectionsApi`, `feedbackApi`, `notificationsApi`, `usersApi`). Endpoint modules import *types* from entities - that is why `shared/api` is the single deliberate exception to "shared imports nothing above": it depends only on type-only entity exports, never on entity runtime code.
3. **Features turn calls into use cases.** Each feature wraps an endpoint in a TanStack Query hook and decides which query keys to invalidate.
4. **Pages and widgets consume hooks and entity types.**

Example from the repository - an endpoint module (`shared/api/endpoints/recommendations.ts`):

```ts
export const recommendationsApi = {
  decline: (profileId: string) =>
    apiRequest<unknown>(`/recommendations/${profileId}/decline`, { method: "POST" }),

  feed: (filters: RecommendationFilters = {}) =>
    apiRequest<RecommendationCard[]>("/recommendations/feed", { query: filters }),
  // ...
};
```

and the feature that uses a sibling endpoint (`features/feed/swipe-profile/model/use-swipe-profile.ts`):

```ts
export function useSwipeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SwipeRequest) => swipesApi.swipe(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["recommendations", "feed"] });
      void queryClient.invalidateQueries({ queryKey: ["swipes", "saved"] });
    },
  });
}
```

Query keys are plain arrays grouped by resource (`["profiles", "me"]`, `["recommendations", "feed"]`, `["swipes", "saved"]`).

### Endpoint coverage

| Client module | Backend routes |
| --- | --- |
| `authApi` | `POST /auth/email/login`, `/auth/email/code`, `/auth/email/verify`, `/auth/signup`, `/auth/phone/login`, `/auth/phone/verify`, `/auth/phone/activate`, `/auth/logout` |
| `conversationsApi` | `GET /conversations`, `POST /conversations/{user_id}`, `GET`/`POST /conversations/{id}/messages`, `POST /conversations/{id}/read` |
| `usersApi` | `/users/me` (`GET`, `PATCH`), `/users/me/complete` |
| `profilesApi` | `/profiles/me` (`GET`, `POST`, `PATCH`), `/profiles/{id}` |
| `uploadsApi` | `/uploads/presigned-url`, `/uploads/featured`, `/uploads/me`, `DELETE /uploads/{id}`; plus a direct `PUT` to the S3 presigned URL |
| `recommendationsApi` | `/recommendations/feed`, `/{id}/score`, `/{id}/send-request`, `/{id}/decline` |
| `swipesApi` | `POST /swipes`, `GET /swipes/saved` |
| `connectionsApi` | `/connections`, `/connections/{id}/request`, `/accept`, `/reject` |
| `feedbackApi` | `POST /feedback`, `GET /feedback/me` |
| `notificationsApi` | `GET /notifications`, `POST /notifications/{id}/read` |

## Authentication and Session Handling

The backend issues an opaque session id (`sid`). The client keeps it in three places with distinct roles:

- **Persistent storage** - `entities/session/lib/session-storage.ts` reads/writes `tappedin.sid` in `expo-secure-store` (Keychain / Keystore). On web it falls back to `localStorage`.
- **In-memory state** - `entities/session/model/session-store.ts` is a Zustand store with `sid` and `isHydrated`, used by screens to decide between the auth and app flows.
- **Request layer** - `shared/api/session-handlers.ts` holds three injectable callbacks (resolver, writer, clearer). The API layer never imports the `session` entity (that would violate the dependency rule); instead `app/providers/session-provider.tsx` registers the real implementations on startup:

```tsx
useEffect(() => {
  setSessionSidResolver(getSessionSid);
  setSessionSidWriter(async (sid) => {
    await setSessionSid(sid);
    setSid(sid);
  });
  setSessionClearer(async () => {
    await clearSessionSid();
    setSid(null);
  });
  getSessionSid().then(setSid).finally(() => setHydrated(true));
}, [setHydrated, setSid]);
```

Flow:

1. `authApi.signUp / emailLogin / phoneVerify` call the backend with `auth: false` and, on success, call `persistSessionSid(response.sid)`.
2. `apiRequest` adds `Authorization: Bearer <sid>` to every request with `auth: true` (the default). The backend accepts the same value from the `sid` cookie or from the bearer header, so the client does not depend on cookie handling.
3. Errors are normalised into `ApiError { status, detail, data }`, where `detail` is taken from the FastAPI `{ "detail": ... }` body.
4. `authApi.logout` calls `POST /auth/logout` and clears the stored session.
5. On start the provider hydrates the session from secure storage ("session restore" from the MVP plan).

Because the session travels in the `Authorization` header (not in a cookie), the same code path works on iOS, Android and Expo Web; on web the server's CORS allow-list must include the web origin (see the [README](../README.md#trade-offs-and-known-limitations)).

## Environment and Configuration

| Variable | Used by | Meaning |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | `src/shared/config/env.ts` | Backend base URL, trailing slash trimmed, default `http://localhost:8000`. Inlined at bundle time. |
| `EXPO_ROUTER_APP_ROOT` | Expo Router | Must be `app`. |
| `REACT_NATIVE_PACKAGER_HOSTNAME` | Expo CLI | Host Metro advertises (LAN IP for a physical device). |

```ts
// mobile/src/shared/config/env.ts
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";
```

`EXPO_PUBLIC_*` variables are public: never put secrets in them. After changing a value, restart Metro (`npx expo start -c`) so the bundle is rebuilt.

| App runs on | `EXPO_PUBLIC_API_URL` |
| --- | --- |
| iOS Simulator, Expo Web | `http://localhost:8000` |
| Android Emulator | `http://10.0.2.2:8000` |
| Physical device | `http://<LAN IP>:8000` |

## Styling

NativeWind turns Tailwind class names into React Native styles. Metro is wrapped with `withNativeWind` (`metro.config.js`, input `src/shared/styles/global.css`), and `babel.config.js` uses `jsxImportSource: "nativewind"`. Components in `src/components/ui` use `class-variance-authority` for variants and `cn()` (`clsx` + `tailwind-merge`) for merging:

```tsx
const buttonVariants = cva("min-h-12 flex-row items-center justify-center gap-2 rounded-lg px-4", {
  defaultVariants: { size: "md", variant: "primary" },
  variants: {
    variant: { primary: "bg-primary", outline: "border border-border bg-card", /* ... */ },
  },
});
```

SVG icons are imported as components through `react-native-svg-transformer`.

## Testing

- `npm test` runs `jest --runInBand` with `jest-expo`.
- `jest.setup.ts` mocks `expo-secure-store` with an in-memory map.
- `src/shared/api/http-client.test.ts` verifies that the `sid` is sent as a bearer token on authenticated requests and that backend errors become `ApiError` with the server `detail`.
- `npm run typecheck` (`tsc --noEmit`) and `npm run lint` (ESLint) are the static gates (`make mobile-check`).

Tests live next to the code they cover. Domain logic is deliberately kept on the server, so the client tests focus on the transport layer and hooks.

## Running the Client Alone

### On the host (recommended for development)

```bash
cd mobile
cp .env.example .env          # set EXPO_PUBLIC_API_URL for your target (see table above)
npm install                   # or: bun install
npx expo start                # i = iOS simulator, a = Android emulator, w = web, QR = Expo Go
```

Useful variants:

```bash
npx expo start -c                                     # clear Metro cache
npx expo start --tunnel                               # when the phone cannot reach your LAN
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.42 \
EXPO_PUBLIC_API_URL=http://192.168.1.42:8000 npx expo start   # physical device on Wi-Fi
```

The backend must be running (see the [Server docs](server.md#running-the-server-alone) or `make server-up` from the repository root).

### In Docker

```bash
make mobile-up        # from the repository root
# equivalent: docker compose up --build --no-deps mobile
```

The `mobile` service (`mobile/Dockerfile`, `mobile/docker-compose.{base,dev}.yml`) runs `npx expo start --host lan` on port 8081 with `CI=0` (Expo disables file watching when `CI` is set) and `EXPO_NO_TELEMETRY=1`. Sources are bind-mounted for hot reload and `node_modules` stays an anonymous volume inside the container. The container only serves the bundle; the simulator or phone runs on your machine and must be able to reach `REACT_NATIVE_PACKAGER_HOSTNAME:8081` and `EXPO_PUBLIC_API_URL`. After adding a dependency run `make rebuild`.

## Trade-offs and Limitations

- FSD requires discipline: the layer rules are not enforced by tooling yet (no `eslint-plugin-boundaries` / `steiger` configured), only by review and convention.
- The `shared/api` -> `entities` type import is a pragmatic compromise to keep payload types next to their entity.
- Some pages still contain sizeable inline layout code and constants; they should migrate to widgets as the screens stabilise.
- No offline cache: TanStack Query keeps data in memory only.
- Audio is played from remote URLs with `expo-audio`; there is no waveform, preloading or background playback in the MVP.
