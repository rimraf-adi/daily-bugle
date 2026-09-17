"""
LLM Router module for Daily Bugle.

Provides unified routing to open-source and frontier LLMs via OpenRouter,
supporting free and premium models, automatic .env key resolution, and newsletter summarization.
"""

from .client import (
    LLMRouter,
    generate_completion,
    get_default_router,
    load_env_file,
)
from .models import (
    ChatMessage,
    ChatResponse,
)

__all__ = [
    "LLMRouter",
    "ChatMessage",
    "ChatResponse",
    "generate_completion",
    "get_default_router",
    "load_env_file",
]
