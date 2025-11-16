"""
Core application configuration and settings.
"""
import os
import logging
from functools import lru_cache
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application Info
    APP_NAME: str = Field(default="GoldCoin", description="Application name")
    APP_VERSION: str = Field(default="1.0.0", description="Application version")
    DEBUG: bool = Field(default=False, description="Debug mode")
    ENVIRONMENT: str = Field(default="development", description="Environment (development/staging/production)")
    
    # API Configuration
    API_V1_STR: str = Field(default="/api/v1", description="API v1 prefix")
    PROJECT_NAME: str = Field(default="GoldCoin API", description="Project name")
    
    # Database Configuration
    DATABASE_URL: str = Field(
        default="postgresql://finance_user:finance_password@postgres:5432/goldcoin",
        description="Database connection URL"
    )
    DATABASE_POOL_SIZE: int = Field(default=20, description="Database pool size")
    DATABASE_MAX_OVERFLOW: int = Field(default=10, description="Database max overflow")
    DATABASE_ECHO: bool = Field(default=False, description="Database echo SQL queries")
    
    # Security Configuration
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production", description="Application secret key")
    JWT_SECRET_KEY: str = Field(default="your-jwt-secret-key-change-in-production", description="JWT secret key")
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, description="Access token expiration in minutes")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, description="Refresh token expiration in days")
    
    # CORS Configuration
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:3000,http://localhost:8000",
        description="Comma-separated list of allowed origins"
    )
    CORS_MAX_AGE: int = Field(default=600, description="CORS max age")
    
    # External APIs
    OPENAI_API_KEY: str = Field(default="", description="OpenAI API key")
    OPENAI_MODEL: str = Field(default="gpt-4", description="OpenAI model to use")
    OPENAI_TIMEOUT: int = Field(default=30, description="OpenAI API timeout")
    
    # Redis/Celery Configuration
    REDIS_URL: str = Field(default="redis://redis:6379/0", description="Redis connection URL")
    REDIS_POOL_SIZE: int = Field(default=10, description="Redis pool size")
    CELERY_BROKER_URL: str = Field(default="redis://redis:6379/0", description="Celery broker URL")
    CELERY_RESULT_BACKEND: str = Field(default="redis://redis:6379/1", description="Celery result backend")
    CELERY_TASK_SERIALIZER: str = Field(default="json", description="Celery task serializer")
    CELERY_RESULT_SERIALIZER: str = Field(default="json", description="Celery result serializer")
    CELERY_ACCEPT_CONTENT: List[str] = Field(default=["json"], description="Celery accepted content types")
    CELERY_TIMEZONE: str = Field(default="UTC", description="Celery timezone")
    
    # Logging Configuration
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    LOG_FILE: str = Field(default="logs/app.log", description="Log file path")
    LOG_MAX_BYTES: int = Field(default=10485760, description="Log file max size (10MB)")
    LOG_BACKUP_COUNT: int = Field(default=10, description="Log backup count")
    
    # Monitoring
    SENTRY_DSN: str = Field(default="", description="Sentry DSN for error tracking")
    PROMETHEUS_ENABLED: bool = Field(default=True, description="Enable Prometheus metrics")
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = Field(default=True, description="Enable rate limiting")
    RATE_LIMIT_REQUESTS: int = Field(default=100, description="Rate limit requests per period")
    RATE_LIMIT_PERIOD: int = Field(default=60, description="Rate limit period in seconds")
    
    # File Upload
    MAX_UPLOAD_SIZE: int = Field(default=10485760, description="Max upload size (10MB)")
    ALLOWED_UPLOAD_EXTENSIONS: List[str] = Field(
        default=["pdf", "csv", "xlsx"],
        description="Allowed file extensions"
    )
    
    # Timeouts
    REQUEST_TIMEOUT: int = Field(default=30, description="Request timeout")
    HEALTH_CHECK_TIMEOUT: int = Field(default=5, description="Health check timeout")

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def allowed_origins_list(self) -> List[str]:
        """Convert ALLOWED_ORIGINS string to list."""
        if isinstance(self.ALLOWED_ORIGINS, str):
            return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
        return self.ALLOWED_ORIGINS


@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()


def setup_logging() -> None:
    """Configure application logging."""
    settings = get_settings()
    
    # Create logs directory if it doesn't exist
    log_dir = os.path.dirname(settings.LOG_FILE)
    if log_dir:
        os.makedirs(log_dir, exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(settings.LOG_FILE),
            logging.StreamHandler()
        ]
    )
    
    # Set specific logger levels
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(
        logging.INFO if settings.DATABASE_ECHO else logging.WARNING
    )


# Initialize logging on import
setup_logging()