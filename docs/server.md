# Server — DDD + Clean Architecture

← [README](../README.md) · [Client](client.md) · [MVP Plan](MVP-PLAN.md)

Stack: Python 3.12, FastAPI, SQLAlchemy 2 (async) + Alembic, Dishka (DI), taskiq + Redis (background tasks: OTP, e-mail/SMS), PostgreSQL/PostGIS.

## Why DDD + Clean Architecture

- **Business rules don't depend on the framework.** Match score calculation and match/status rules live in `domain` without FastAPI/SQLAlchemy.
- **Testability.** Interactors are tested with fake ports, without a DB or HTTP (`server/tests`).
- **Replaceable infrastructure.** Storage, SMS, e-mail, S3 are implementations of ports and can be swapped without touching the scenarios.
- **Thin HTTP layer.** A router only validates input and calls a use case.
- **Clear boundaries** — easier to grow feature by feature and to split work.

## Layers and the dependency rule

Dependencies point inward only: `presentation → application → domain`; `adapters → application (ports) → domain`.

```text
server/src/vnu/
├── domain/          # entities, value objects, enums, domain services and exceptions (pure Python)
│   └── entities/music/   entities.py, value_objects.py, enums.py, scoring.py
├── application/     # use cases and ports
│   ├── interactors/     # commands (mutate state): swipes, connections, profile, uploads, feedback...
│   ├── queries/         # reads: recommendations, saved, notifications...
│   ├── commands/  services/
│   ├── common/          # ports: music/dao.py, music/repository.py, uow, otp, user
│   ├── dto/  schemas/  errors/
├── adapters/        # port implementations
│   ├── data/            # models, dao (reads), repository (writes), migrations (Alembic)
│   ├── auth/ (sessions, idp)  tasks/  uow.py  email.py  sms_client.py  aws.py  config.py
├── presentation/http/   # FastAPI routers (thin), shared error handlers
└── entrypoint/      # application assembly: web.py, broker.py, di/providers
```

## Key techniques

- **Interactors** — one class per scenario (`SwipeProfile`, `AcceptConnection`, …), depending on interfaces:

```python
class SwipeProfile(Interactor[SwipeInputDTO, SwipeDTO]):
    def __init__(self, repository: MusicRepository, dao: MusicDAO, uow: UoW, idp: SessionIdProvider) -> None: ...

    async def __call__(self, data: SwipeInputDTO) -> SwipeDTO:
        profile = await current_profile(self.dao, self.idp)
        ...
        swipe = Swipe.create(actor_profile_id=profile.id, target_profile_id=target.id,
                             action=data.action, match_score=match.score)
        await self.repository.save_swipe(swipe)
```

- **Repository / DAO (CQRS-lite).** The `Repository` writes aggregates, the `DAO` is optimized for reads; the interfaces live in `application/common`, and the SQLAlchemy implementations in `adapters/data`.
- **Unit of Work** (`adapters/uow.py`) — the transactional boundary of a scenario.
- **Domain logic.** `domain/entities/music/scoring.py::calculate_match_score` computes compatibility (genres, BPM, moods, roles, experience, location) and returns a score + reasons:

```python
@dataclass(frozen=True)
class MatchScore:
    score: int
    reasons: list[str]
    breakdown: dict[str, int]
```

- **Thin routers + DI (Dishka):**

```python
@router.post("")
@inject
async def swipe_profile(data: SwipeRequest, interactor: FromDishka[SwipeProfile]) -> Any:
    return await interactor(SwipeInputDTO(target_profile_id=data.target_profile_id, action=data.action))
```

- **Sessions.** Authentication uses server-side sessions (`sid` cookie); the current user is obtained via `SessionIdProvider`.
- **Migrations** — Alembic (`adapters/data/migrations/versions`).

## Endpoints

Swagger: `http://localhost:8000/docs`.

| Group | Methods |
|---|---|
| `/auth` | `POST /signup`, `POST /email/login`, `POST /phone/login`, `POST /phone/verify`, `POST /phone/activate`, `POST /logout` |
| `/users` | `POST /guest`, `GET /me`, `PATCH /me`, `POST /me/complete`, `GET /by-username/{username}` |
| `/profiles` | `POST /me`, `GET /me`, `PATCH /me`, `GET /{profile_id}` |
| `/uploads` | `POST /presigned-url`, `POST /featured`, `GET /me`, `DELETE /{upload_id}` |
| `/recommendations` | `GET /feed`, `GET /{profile_id}/score`, `POST /{profile_id}/send-request`, `POST /{profile_id}/decline` |
| `/swipes` | `POST ""` (like / skip / save), `GET /saved` |
| `/connections` | `GET ""`, `POST /{profile_id}/request`, `POST /{connection_id}/accept`, `POST /{connection_id}/reject` |
| `/feedback` | `POST ""`, `GET /me` |
| `/notifications` | `GET ""`, `POST /{notification_id}/read` |

## Data

Music data lives in separate tables (not in `user`): profile, music identity, social links, uploads, swipes, connections, feedback, notifications. The full schema is in [MVP-PLAN](MVP-PLAN.md#database-tables).

## Running the server separately

```bash
make env && make server-up     # db + redis + backend + worker + scheduler
make migrate
# Swagger: http://localhost:8000/docs
```

On a host without Docker: `cd server && cp .env.example .env && uv sync`, start Postgres/Redis (`DB_HOST=localhost`, ports `LOCAL_DB_PORT`/`LOCAL_REDIS_PORT`), and run uvicorn with `vnu.entrypoint.web` (see the backend command in `server/docker-compose.dev.yml`).

## Tests

```bash
make test-server     # server/tests: domain (scoring), application (interactors), adapters (session idp)
make test-root       # tests/: feed and actions unit tests + e2e API contract (requires E2E_BASE_URL)
```

## Notes and trade-offs

- More files and abstractions than "CRUD in routers" — the price of isolating business logic.
- Recommendations are deterministic rule-based scoring, no ML (transparent, explainable, fast).
- Reads and writes are separated (DAO/Repository), but there is a single DB — a simplified CQRS.
