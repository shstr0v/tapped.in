import os
from dataclasses import dataclass
from typing import Self

from dotenv import load_dotenv

load_dotenv(override=True)


DEFAULT_CORS_ORIGINS = (
    "http://localhost:8081,http://127.0.0.1:8081,http://localhost:19006,http://localhost:5173"
)
DEFAULT_CORS_ORIGIN_REGEX = (
    r"https?://(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|"
    r"172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?"
)


def _is_running_in_docker() -> bool:
    return os.path.exists("/.dockerenv") or os.getenv("RUNNING_IN_DOCKER") == "1"


def _resolve_host_port(
    host: str,
    port: str,
    *,
    docker_host: str,
    local_host: str,
    local_port: str,
) -> tuple[str, str]:
    if host == docker_host and not _is_running_in_docker():
        return local_host, local_port
    return host, port


@dataclass(slots=True, frozen=True)
class DatabaseConfig:
    host: str
    port: str
    name: str
    user: str
    password: str

    @property
    def connection_url(self) -> str:
        return (
            f"postgresql+asyncpg://{self.user}:{self.password}@{self.host}:{self.port}/{self.name}"
        )


@dataclass(slots=True, frozen=True)
class AwsConfig:
    access_key: str
    secret_key: str
    bucket_name: str
    region: str

    def object_url(self, key: str) -> str:
        region = f".s3.{self.region}" if self.region else ".s3"
        return f"https://{self.bucket_name}{region}.amazonaws.com/{key.lstrip('/')}"


@dataclass(slots=True, frozen=True)
class EmailConfig:
    hostname: str
    port: str
    username: str
    password: str
    from_email: str


@dataclass(slots=True, frozen=True)
class MailchimpConfig:
    api_key: str
    client_id: str
    client_secret: str


@dataclass(slots=True, frozen=True)
class RedisConfig:
    host: str
    port: str
    db: str
    password: str

    @property
    def connection_url(self) -> str:
        if not self.password:
            return f"redis://{self.host}:{self.port}/{self.db}"
        return f"redis://:{self.password}@{self.host}:{self.port}/{self.db}"


@dataclass(slots=True, frozen=True)
class SmsConfig:
    api_key: str
    base_url: str


@dataclass(slots=True, frozen=True)
class Config:
    aws: AwsConfig
    database: DatabaseConfig
    email: EmailConfig
    mailchimp: MailchimpConfig
    redis: RedisConfig
    sms: SmsConfig
    cors_origins: tuple[str, ...]
    cors_origin_regex: str | None

    @classmethod
    def load_from_environment(cls) -> Self:
        db_host, db_port = _resolve_host_port(
            os.getenv("DB_HOST", "localhost"),
            os.getenv("DB_PORT", "5432"),
            docker_host="postgresql",
            local_host="localhost",
            local_port=os.getenv("LOCAL_DB_PORT", "5432"),
        )
        redis_host, redis_port = _resolve_host_port(
            os.getenv("REDIS_HOST", "localhost"),
            os.getenv("REDIS_PORT", "6379"),
            docker_host="redis",
            local_host="localhost",
            local_port=os.getenv("LOCAL_REDIS_PORT", "6379"),
        )
        return cls(
            aws=AwsConfig(
                access_key=os.getenv("AWS_ACCESS_KEY_ID", ""),
                secret_key=os.getenv("AWS_SECRET_ACCESS_KEY", ""),
                bucket_name=os.getenv("AWS_BUCKET_NAME", ""),
                region=os.getenv("AWS_BUCKET_REGION_NAME", ""),
            ),
            database=DatabaseConfig(
                host=db_host,
                port=db_port,
                name=os.getenv("DB_NAME", "miss_xtreme"),
                user=os.getenv("DB_USER", "postgres"),
                password=os.getenv("DB_PASSWORD", "postgres"),
            ),
            email=EmailConfig(
                hostname=os.getenv("EMAIL_HOSTNAME", ""),
                port=os.getenv("EMAIL_PORT", "587"),
                username=os.getenv("EMAIL_USERNAME", ""),
                password=os.getenv("EMAIL_PASSWORD", ""),
                from_email=os.getenv("EMAIL_FROM_EMAIL", ""),
            ),
            mailchimp=MailchimpConfig(
                api_key=os.getenv("MAILCHIMP_API_KEY", ""),
                client_id=os.getenv("MAILCHIMP_CLIENT_ID", ""),
                client_secret=os.getenv("MAILCHIMP_CLIENT_SECRET", ""),
            ),
            redis=RedisConfig(
                host=redis_host,
                port=redis_port,
                db=os.getenv("REDIS_DB", "0"),
                password=os.getenv("REDIS_PASSWORD", ""),
            ),
            sms=SmsConfig(
                api_key=os.getenv("BREVO_SMS_API_KEY", ""),
                base_url="https://api.brevo.com/v3/",
            ),
            cors_origins=tuple(
                origin.strip() for origin in os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS).split(",") if origin.strip()
            ),
            cors_origin_regex=os.getenv("CORS_ORIGIN_REGEX", DEFAULT_CORS_ORIGIN_REGEX) or None,
        )
