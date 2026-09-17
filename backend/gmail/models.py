from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


@dataclass
class SubstackEmail:
    """Represents a Substack newsletter issue received via Gmail."""
    id: str
    subject: str
    sender: str
    sender_name: Optional[str] = None
    sender_email: Optional[str] = None
    date: Optional[str] = None
    web_url: Optional[str] = None
    body_text: str = ""
    body_html: Optional[str] = None
    links: List[str] = field(default_factory=list)

    @property
    def full_article_url(self) -> Optional[str]:
        """Convenient alias for the Substack web link."""
        return self.web_url

    def to_dict(self) -> Dict[str, Any]:
        """Serialize to dictionary without raw HTML bloat."""
        data = asdict(self)
        if "body_html" in data and data["body_html"]:
            # Omit large raw HTML in standard dict to avoid token bloat
            data.pop("body_html")
        return data

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)

    def to_llm_context(self, max_body_chars: int = 1500) -> Dict[str, Any]:
        """
        Produce a compact, high-signal semantic payload for LLM prompts.
        Truncates excessively long email bodies while preserving the essential summary and link.
        """
        truncated_body = self.body_text
        if len(truncated_body) > max_body_chars:
            truncated_body = truncated_body[:max_body_chars].rstrip() + "\n... [truncated]"

        return {
            "email_id": self.id,
            "publication": self.sender_name or self.sender,
            "subject": self.subject,
            "date": self.date,
            "web_url": self.web_url,
            "content_excerpt": truncated_body,
            "key_links": self.links[:5],
        }

    def to_markdown(self) -> str:
        """Format the newsletter email into markdown with direct web link."""
        pub = self.sender_name or self.sender
        header = f"### [{self.subject}]({self.web_url})" if self.web_url else f"### {self.subject}"

        lines = [
            header,
            f"- **Publication / Author:** {pub}",
            f"- **Date:** {self.date or 'N/A'}",
        ]
        if self.web_url:
            lines.append(f"- **Read Online:** [Full Substack Post]({self.web_url})")

        lines.append(f"\n{self.body_text[:1000]}\n")
        return "\n".join(lines)


@dataclass
class SubstackDigest:
    """Collection of tracked Substack newsletters structured for LLM processing."""
    emails: List[SubstackEmail] = field(default_factory=list)
    generated_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    @property
    def total_emails(self) -> int:
        return len(self.emails)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "generated_at": self.generated_at,
            "total_emails": self.total_emails,
            "emails": [e.to_dict() for e in self.emails],
        }

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)

    def to_llm_payload(self) -> List[Dict[str, Any]]:
        return [e.to_llm_context() for e in self.emails]

    def to_llm_prompt(self, custom_instructions: Optional[str] = None) -> str:
        """
        Generates a complete prompt formatted for OpenRouter / LLMs to summarize
        recent Substack newsletter issues.
        """
        issues_context = "\n---\n\n".join(e.to_markdown() for e in self.emails)
        instructions = custom_instructions or (
            "1. Synthesize these Substack newsletters into an executive briefing for Daily Bugle.\n"
            "2. Group insights by themes (e.g. Technology, Markets, AI, Strategy).\n"
            "3. For each issue, provide a 2-3 sentence takeaway and MUST include the link to read the full Substack post.\n"
            "4. Keep the tone sharp, analytical, and informative."
        )

        return f"""You are the chief research analyst for Daily Bugle.
Review the following {self.total_emails} Substack newsletter issues received via Gmail on {self.generated_at}:

### INSTRUCTIONS:
{instructions}

### SUBSTACK NEWSLETTER ISSUES:
{issues_context}
"""

    def to_markdown(self) -> str:
        lines = [
            "# Daily Bugle: Substack Newsletters Tracking",
            f"*Generated: {self.generated_at} | Issues: {self.total_emails}*",
            "\n---\n",
        ]
        for e in self.emails:
            lines.append(e.to_markdown())
            lines.append("\n---\n")
        return "\n".join(lines)
