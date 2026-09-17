from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class ChatMessage:
    """Represents a chat message with role and text content."""
    role: str  # 'system', 'user', or 'assistant'
    content: str

    def to_dict(self) -> Dict[str, str]:
        return {"role": self.role, "content": self.content}

    def __getitem__(self, key: str) -> str:
        return self.to_dict()[key]


@dataclass
class ResponseChoice:
    """Single completion candidate in the response."""
    message: ChatMessage
    finish_reason: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        res: Dict[str, Any] = {"message": self.message.to_dict()}
        if self.finish_reason is not None:
            res["finish_reason"] = self.finish_reason
        return res

    def __getitem__(self, key: str) -> Any:
        return self.to_dict()[key]


@dataclass
class UsageInfo:
    """Token consumption statistics returned by OpenRouter."""
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0

    def to_dict(self) -> Dict[str, int]:
        return {
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "total_tokens": self.total_tokens,
        }

    def __getitem__(self, key: str) -> int:
        return self.to_dict()[key]


@dataclass
class ChatResponse:
    """
    Structured OpenRouter response schema.
    Supports both object access (.content, .model) and dictionary access (response['choices'][0]...).
    """
    id: str
    model: str
    choices: List[ResponseChoice] = field(default_factory=list)
    usage: UsageInfo = field(default_factory=UsageInfo)
    raw: Dict[str, Any] = field(default_factory=dict)

    @property
    def content(self) -> str:
        """Shortcut to the first choice message content."""
        if self.choices and self.choices[0].message:
            return self.choices[0].message.content
        return ""

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> ChatResponse:
        """Parse raw OpenRouter JSON response into structured ChatResponse."""
        resp_id = data.get("id", "")
        model = data.get("model", "")

        choices_list: List[ResponseChoice] = []
        for c in data.get("choices", []):
            msg_data = c.get("message", {})
            msg = ChatMessage(
                role=msg_data.get("role", "assistant"),
                content=msg_data.get("content", ""),
            )
            choices_list.append(
                ResponseChoice(
                    message=msg,
                    finish_reason=c.get("finish_reason"),
                )
            )

        usage_data = data.get("usage", {})
        usage = UsageInfo(
            prompt_tokens=usage_data.get("prompt_tokens", 0),
            completion_tokens=usage_data.get("completion_tokens", 0),
            total_tokens=usage_data.get("total_tokens", 0),
        )

        return cls(
            id=resp_id,
            model=model,
            choices=choices_list,
            usage=usage,
            raw=data,
        )

    def to_dict(self) -> Dict[str, Any]:
        """Converts to the canonical OpenRouter JSON schema."""
        return {
            "id": self.id,
            "model": self.model,
            "choices": [c.to_dict() for c in self.choices],
            "usage": self.usage.to_dict(),
        }

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)

    def __getitem__(self, key: str) -> Any:
        """Enables dict-style subscripting: response['choices'][0]['message']['content']."""
        if self.raw and key in self.raw:
            return self.raw[key]
        return self.to_dict()[key]

    def __str__(self) -> str:
        return self.content
