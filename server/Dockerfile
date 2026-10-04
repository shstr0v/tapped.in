FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy

ENV UV_PYTHON_DOWNLOADS=0

WORKDIR /home/app

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project --no-dev
COPY . /home/app
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev

# Running stage
FROM python:3.12-slim-bookworm

RUN adduser app
USER app

WORKDIR /home/app

COPY --from=builder --chown=app:app /home/app /home/app/

ENV PATH="/home/app/.venv/bin:$PATH"