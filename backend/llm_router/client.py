from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import requests

from .models import ChatMessage, ChatResponse


def load_env_file(env_path: Optional[Union[str, Path]] = None) -> None:
    """Simple, zero-dependency .env loader that populates os.environ if not already set."""
    candidates = []
    if env_path:
        candidates.append(Path(env_path))
    else:
        # Check current dir, parent dir, and backend dir
        current_dir = Path.cwd()
        script_backend = Path(__file__).resolve().parent.parent
        candidates.extend([
            current_dir / ".env",
            current_dir.parent / ".env",
            script_backend / ".env",
        ])

    for candidate in candidates:
        if candidate.is_file():
            try:
                with open(candidate, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            key, val = line.split("=", 1)
                            key = key.strip()
                            val = val.strip().strip("'\"")
                            if key not in os.environ:
                                os.environ[key] = val
                break
            except Exception:
                pass


class LLMRouter:
    """
    Client for routing completions through OpenRouter.
    Supports free and premium models, automatic env resolution, and newsletter summarization.
    """

    BASE_URL = "https://openrouter.ai/api/v1/chat/completions"
    DEFAULT_MODEL = "openrouter/free"

    def __init__(
        self,
        api_key: Optional[str] = None,
        default_model: str = DEFAULT_MODEL,
        base_url: str = BASE_URL,
        timeout: int = 60,
    ):
        if not api_key:
            load_env_file()
            api_key = os.environ.get("OPENROUTER_API_KEY")

        if not api_key:
            raise ValueError(
                "OPENROUTER_API_KEY is required. Provide it in constructor or set it in .env / os.environ."
            )

        self.api_key = api_key
        self.default_model = default_model
        self.base_url = base_url
        self.timeout = timeout

    def chat(
        self,
        messages: List[Union[Dict[str, str], ChatMessage]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **extra_params: Any,
    ) -> ChatResponse:
        """
        Send a chat completion request to OpenRouter.

        :param messages: List of message dictionaries ({"role": ..., "content": ...}) or ChatMessage objects.
        :param model: Model identifier (defaults to self.default_model, e.g. "openrouter/free").
        :param temperature: Optional sampling temperature.
        :param max_tokens: Optional max token limit for the response.
        :return: ChatResponse containing content, model name, and usage stats.
        """
        selected_model = model or self.default_model

        formatted_messages = []
        for msg in messages:
            if isinstance(msg, ChatMessage):
                formatted_messages.append(msg.to_dict())
            elif isinstance(msg, dict):
                formatted_messages.append({"role": msg["role"], "content": msg["content"]})
            else:
                raise ValueError(f"Invalid message type: {type(msg)}. Expected dict or ChatMessage.")

        payload: Dict[str, Any] = {
            "model": selected_model,
            "messages": formatted_messages,
        }
        if temperature is not None:
            payload["temperature"] = temperature
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
        payload.update(extra_params)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/rimraf-adi/daily-bugle",
            "X-Title": "Daily Bugle",
        }

        response = requests.post(
            url=self.base_url,
            headers=headers,
            data=json.dumps(payload),
            timeout=self.timeout,
        )

        if not response.ok:
            error_detail = response.text
            try:
                error_json = response.json()
                if "error" in error_json:
                    error_detail = error_json["error"].get("message", error_detail)
            except Exception:
                pass
            raise RuntimeError(f"OpenRouter API error (HTTP {response.status_code}): {error_detail}")

        data = response.json()

        choices = data.get("choices", [])
        if not choices:
            raise RuntimeError(f"OpenRouter returned empty choices: {data}")

        return ChatResponse.from_dict(data)

    def complete(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        **kwargs: Any,
    ) -> ChatResponse:
        """Convenience method to execute a prompt without manual message list construction."""
        messages: List[Dict[str, str]] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        return self.chat(messages=messages, model=model, **kwargs)

    def generate_newsletter(
        self,
        digest_or_prompt: Any,
        model: Optional[str] = None,
        system_prompt: Optional[str] = None,
    ) -> ChatResponse:
        """
        Integrates with the arxiv module: accepts a NewsletterDigest or prompt string,
        and generates a formatted newsletter draft.
        """
        if hasattr(digest_or_prompt, "to_llm_prompt"):
            prompt = digest_or_prompt.to_llm_prompt()
        else:
            prompt = str(digest_or_prompt)

        sys_prompt = system_prompt or "You are the chief editorial writer for the Daily Bugle Research Newsletter."
        return self.complete(prompt=prompt, system_prompt=sys_prompt, model=model)


_default_router: Optional[LLMRouter] = None


def get_default_router() -> LLMRouter:
    global _default_router
    if _default_router is None:
        _default_router = LLMRouter()
    return _default_router


def generate_completion(
    prompt: str,
    system_prompt: Optional[str] = None,
    model: str = "openrouter/free",
    api_key: Optional[str] = None,
    **kwargs: Any,
) -> ChatResponse:
    """Standalone helper function to quickly run a completion through OpenRouter."""
    if api_key:
        router = LLMRouter(api_key=api_key, default_model=model)
    else:
        router = get_default_router()
    return router.complete(prompt=prompt, system_prompt=system_prompt, model=model, **kwargs)
