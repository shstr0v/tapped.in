# TappedIn

**Find your sound. Find your people.**

TappedIn is a discovery and networking platform for music producers and artists. Think "Tinder for music collaboration": discover relevant people, listen to their work, connect, exchange feedback, and start working together — people are found by their sound, not by their follower count.

## Users

- **Artist** — rapper, singer, vocalist, songwriter looking for producers, beats, collaborators, and feedback.
- **Producer** — beatmaker looking for artists, placements, collaborators, and feedback.

## Core flow

**Sign up → Create music profile → Upload work → Get recommendations → Listen → Swipe / Connect → Match → Share work**

## Key features

- **Music profile** — role, location, experience, genres, influences, preferred BPM and moods, social links.
- **Recommendation feed** — one profile/track at a time with a match score; swipe to connect, skip, or save.
- **Match score** — transparent, rule-based compatibility (genres, BPM, moods, roles, experience, location) with human-readable reasons.
- **Uploads** — tracks and beats attached to a profile, with an in-feed audio player.
- **Connections & notifications** — send, accept, or reject collaboration requests.
- **Feedback** — share and receive feedback on work.

## Tech stack

- **Mobile:** Expo / React Native, TypeScript, expo-router, TanStack Query, Zustand, NativeWind.
- **Server:** Python 3.12, FastAPI, SQLAlchemy 2 + Alembic, Dishka, taskiq + Redis, PostgreSQL/PostGIS.

## Architecture

- [Server architecture](docs/server.md) — DDD + Clean Architecture
- [Client architecture](docs/client.md) — Feature-Sliced Design
- [MVP plan](docs/MVP-PLAN.md)
