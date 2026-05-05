from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Application
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    log_level: str = "INFO"

    # PostgreSQL
    database_url: str

    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = 8

    # OpenAI
    openai_api_key: str
    openai_chat_model: str = "gpt-4o"
    openai_realtime_model: str = "gpt-realtime"
    openai_embedding_model: str = "text-embedding-3-small"
    openai_realtime_voice: str = "alloy"

    # Chroma
    chroma_persist_dir: str = "/app/chroma_data"
    chroma_collection: str = "nexus_bank_kb"

    # CORS — comma-separated string, e.g. "http://localhost:3000,https://example.com"
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
