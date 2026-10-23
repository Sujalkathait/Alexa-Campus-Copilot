import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "Alexa+ Campus Copilot"
    API_V1_PREFIX: str = "/api"
    DEBUG: bool = True
    
    # Database: Supports SQLite for zero-config local run, or PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./campus_copilot.db")
    
    # AI Configuration: Google Gemini & AWS Bedrock
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY", None)
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    BEDROCK_MODEL_ID: str = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-5-sonnet-20240620-v1:0")
    AWS_ACCESS_KEY_ID: str | None = os.getenv("AWS_ACCESS_KEY_ID", None)
    AWS_SECRET_ACCESS_KEY: str | None = os.getenv("AWS_SECRET_ACCESS_KEY", None)
    USE_BEDROCK_MOCK: bool = os.getenv("USE_BEDROCK_MOCK", "auto").lower() in ("true", "1", "auto")
    
    # Pre-seeded Demo Student Profile
    DEMO_USER_ID: str = "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    DEMO_USER_NAME: str = "Alex Morgan"
    DEMO_USER_EMAIL: str = "alex.morgan@campus.edu"
    DEMO_USER_TIMEZONE: str = os.getenv("STUDENT_TIMEZONE", "Asia/Kolkata")

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
