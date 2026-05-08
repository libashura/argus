from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application configuration from environment variables"""
    
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/probeblade"
    REDIS_URL: str = "redis://redis:6379/0"
    SECRET_KEY: str = "supersecretkey"
    
    # Server config
    API_TITLE: str = "ProbeBlade API"
    API_VERSION: str = "0.1.0"
    API_DESCRIPTION: str = "Automated API Security Testing Platform"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance"""
    return Settings()
