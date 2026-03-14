from pydantic import BaseModel
import os


class Settings(BaseModel):
    app_name: str = "Texas Will Generator API"
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_model: str = os.getenv("OLLAMA_MODEL", "llama3.1")
    rate_limit_per_minute: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))


settings = Settings()
