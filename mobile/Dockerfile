# syntax=docker/dockerfile:1.7
#
# TappedIn mobile (Expo / React Native) — Metro dev server image.
#
# This image runs the Expo dev server only. The app itself is opened on the host
# (iOS Simulator, Android Emulator, a physical device with Expo Go / a dev client,
# or a browser via Expo Web) and connects to Metro on port 8081.

ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-bookworm-slim AS base

ENV CI=0 \
    EXPO_NO_TELEMETRY=1 \
    EXPO_NO_DOCTOR=1 \
    EXPO_ROUTER_APP_ROOT=app \
    NODE_ENV=development

# git is required by some Expo/npm tooling, ca-certificates for HTTPS fetches.
RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# The repository is locked with bun (bun.lock); node is still the runtime for Expo CLI.
RUN npm install -g bun@1 --no-fund --no-audit

WORKDIR /app

# ---- dependencies (cached while package.json / bun.lock are unchanged) ----
FROM base AS deps
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# ---- dev server ----
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Metro / Expo dev server. 19000-19002 are legacy (Expo CLI < 46) and kept for reference only.
EXPOSE 8081 19000 19001 19002

# --host lan: bind Metro on 0.0.0.0 inside the container so the published port is reachable.
# The host name advertised in the QR code / manifest comes from REACT_NATIVE_PACKAGER_HOSTNAME.
CMD ["npx", "expo", "start", "--host", "lan"]
