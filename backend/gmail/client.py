from __future__ import annotations

import email
import email.header
import email.utils
import imaplib
import os
import re
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

from .models import SubstackDigest, SubstackEmail


def load_env_file(env_path: Optional[Union[str, Path]] = None) -> None:
    """Zero-dependency .env loader that populates os.environ if not already present."""
    candidates = []
    if env_path:
        candidates.append(Path(env_path))
    else:
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


class _HTMLTextExtractor(HTMLParser):
    """Simple parser to strip HTML tags and collect anchor links."""
    def __init__(self):
        super().__init__()
        self.text_chunks: List[str] = []
        self.links: List[str] = []

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]):
        if tag.lower() == "a":
            for k, v in attrs:
                if k.lower() == "href" and v and v.startswith("http"):
                    self.links.append(v)

    def handle_data(self, data: str):
        self.text_chunks.append(data)

    def get_text(self) -> str:
        text = "".join(self.text_chunks)
        # Normalize whitespace
        return re.sub(r"\s+", " ", text).strip()


class GmailClient:
    """
    Gmail IMAP client specialized in tracking and extracting Substack newsletter emails.
    """

    IMAP_HOST = "imap.gmail.com"
    IMAP_PORT = 993

    def __init__(
        self,
        user: Optional[str] = None,
        password: Optional[str] = None,
        host: str = IMAP_HOST,
        port: int = IMAP_PORT,
    ):
        load_env_file()

        self.user = (user or os.environ.get("GMAIL_USER") or os.environ.get("GMAIL_EMAIL") or "").strip()
        raw_password = (password or os.environ.get("GMAIL_APP_PASSWORD") or os.environ.get("GMAIL_PASSWORD") or "").strip()

        # Clean Google App Passwords: strip internal whitespace
        self.password = raw_password.replace(" ", "")
        self.host = host
        self.port = port
        self.mail: Optional[imaplib.IMAP4_SSL] = None

    def __enter__(self) -> GmailClient:
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()

    def connect(self) -> None:
        """Establish SSL connection to Gmail IMAP server and authenticate."""
        if not self.user:
            raise ValueError(
                "Gmail username/email is required. Provide it in constructor or set GMAIL_USER in .env."
            )
        if not self.password:
            raise ValueError(
                "Gmail App Password is required. Provide it in constructor or set GMAIL_APP_PASSWORD in .env."
            )

        try:
            self.mail = imaplib.IMAP4_SSL(self.host, self.port)
            self.mail.login(self.user, self.password)
        except imaplib.IMAP4.error as e:
            err_msg = str(e)
            if "AUTHENTICATIONFAILED" in err_msg:
                raise RuntimeError(
                    f"Gmail IMAP authentication failed for '{self.user}'. "
                    "Make sure: 1) IMAP is enabled in Gmail Settings ('Forwarding and POP/IMAP'), "
                    "2) The 16-character Google App Password is correct and generated for this account."
                ) from e
            raise RuntimeError(f"Failed to connect to Gmail IMAP ({self.host}): {e}") from e

    def disconnect(self) -> None:
        """Close mailbox and terminate IMAP session safely."""
        if self.mail:
            try:
                self.mail.close()
            except Exception:
                pass
            try:
                self.mail.logout()
            except Exception:
                pass
            self.mail = None

    def _decode_header_str(self, header_raw: Optional[str]) -> str:
        """Decode MIME encoded header strings like '=?utf-8?B?...?=' into clean text."""
        if not header_raw:
            return ""
        decoded_fragments = []
        for fragment, encoding in email.header.decode_header(header_raw):
            if isinstance(fragment, bytes):
                try:
                    decoded_fragments.append(fragment.decode(encoding or "utf-8", errors="replace"))
                except Exception:
                    decoded_fragments.append(fragment.decode("latin-1", errors="replace"))
            else:
                decoded_fragments.append(str(fragment))
        return " ".join("".join(decoded_fragments).split())

    def _extract_post_url(self, html_content: str, links: List[str]) -> Optional[str]:
        """Detect the direct web URL for the Substack post."""
        # Check links matching typical Substack post patterns
        for link in links:
            # Pattern: https://<publication>.substack.com/p/<slug>
            if re.search(r"https?://[a-zA-Z0-9_\-]+\.substack\.com/p/[a-zA-Z0-9_\-]+", link):
                # Clean tracking parameters
                return link.split("?")[0]

        # Search in raw HTML for "read in app" or canonical post links
        match = re.search(r'https?://[a-zA-Z0-9_\-]+\.substack\.com/p/[a-zA-Z0-9_\-]+', html_content)
        if match:
            return match.group(0)

        # Fallback to any substack.com link found
        for link in links:
            if "substack.com" in link and "/unsubscribe" not in link:
                return link.split("?")[0]

        return None

    def parse_email_message(self, email_id: str, raw_bytes: bytes) -> SubstackEmail:
        """Parse raw RFC822 email bytes into a structured SubstackEmail model."""
        msg = email.message_from_bytes(raw_bytes)

        subject = self._decode_header_str(msg.get("Subject", "(No Subject)"))
        sender_raw = self._decode_header_str(msg.get("From", "Unknown Sender"))

        # Parse sender name and email address
        name, addr = email.utils.parseaddr(sender_raw)
        sender_name = name if name else sender_raw
        sender_email = addr if addr else None

        date = msg.get("Date")

        body_text = ""
        body_html = ""
        links: List[str] = []

        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition", ""))

                if "attachment" in content_disposition:
                    continue

                payload = part.get_payload(decode=True)
                if not payload:
                    continue

                charset = part.get_content_charset() or "utf-8"
                try:
                    decoded = payload.decode(charset, errors="replace")
                except Exception:
                    decoded = payload.decode("latin-1", errors="replace")

                if content_type == "text/plain" and not body_text:
                    body_text = decoded
                elif content_type == "text/html":
                    body_html += decoded
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                charset = msg.get_content_charset() or "utf-8"
                try:
                    decoded = payload.decode(charset, errors="replace")
                except Exception:
                    decoded = payload.decode("latin-1", errors="replace")

                if msg.get_content_type() == "text/html":
                    body_html = decoded
                else:
                    body_text = decoded

        # If HTML exists, extract links and use extractor for clean text fallback
        if body_html:
            extractor = _HTMLTextExtractor()
            try:
                extractor.feed(body_html)
                links = extractor.links
                if not body_text:
                    body_text = extractor.get_text()
            except Exception:
                pass

        # Identify the primary Substack web URL
        web_url = self._extract_post_url(body_html, links)

        # Normalize body text
        body_text = " ".join(body_text.split())

        return SubstackEmail(
            id=email_id,
            subject=subject,
            sender=sender_raw,
            sender_name=sender_name,
            sender_email=sender_email,
            date=date,
            web_url=web_url,
            body_text=body_text,
            body_html=body_html if body_html else None,
            links=links,
        )

    def fetch_substack_emails(
        self,
        folder: str = "INBOX",
        limit: int = 15,
        unread_only: bool = False,
        custom_query: Optional[str] = None,
    ) -> List[SubstackEmail]:
        """
        Search and retrieve recent Substack emails from the mailbox.

        :param folder: Mailbox folder to select (default: "INBOX").
        :param limit: Maximum number of recent emails to fetch.
        :param unread_only: If True, only fetch unread emails (UNSEEN).
        :param custom_query: Optional custom IMAP search query.
        """
        if not self.mail:
            self.connect()

        assert self.mail is not None

        status, _ = self.mail.select(folder, readonly=True)
        if status != "OK":
            raise RuntimeError(f"Could not open mailbox folder '{folder}'")

        # Construct search criteria targeting Substack newsletters
        if custom_query:
            criteria = custom_query
        else:
            # Match emails from Substack domain or with Substack header
            base_query = 'OR FROM "substack.com" HEADER List-Unsubscribe "substack.com"'
            if unread_only:
                criteria = f'(UNSEEN {base_query})'
            else:
                criteria = f'({base_query})'

        # Execute search
        status, data = self.mail.search(None, criteria)

        # Fallback to general FROM "substack" search if combined criteria returns empty
        if status != "OK" or not data or not data[0]:
            fallback_query = 'UNSEEN FROM "substack"' if unread_only else 'FROM "substack"'
            status, data = self.mail.search(None, fallback_query)

        if status != "OK" or not data or not data[0]:
            return []

        message_ids = data[0].split()
        # Take the most recent 'limit' messages
        recent_ids = message_ids[-limit:]
        recent_ids.reverse()  # Newest first

        substack_emails: List[SubstackEmail] = []
        for msg_id in recent_ids:
            str_id = msg_id.decode("utf-8")
            status, msg_data = self.mail.fetch(msg_id, "(RFC822)")
            if status != "OK" or not msg_data or not msg_data[0]:
                continue

            raw_email = msg_data[0][1]
            if isinstance(raw_email, bytes):
                parsed = self.parse_email_message(str_id, raw_email)
                substack_emails.append(parsed)

        return substack_emails

    def create_substack_digest(
        self,
        folder: str = "INBOX",
        limit: int = 10,
        unread_only: bool = False,
    ) -> SubstackDigest:
        """Fetch Substack newsletters and bundle them into an LLM-ready SubstackDigest."""
        emails = self.fetch_substack_emails(folder=folder, limit=limit, unread_only=unread_only)
        return SubstackDigest(emails=emails)


def fetch_substack_newsletters(
    limit: int = 10,
    unread_only: bool = False,
    user: Optional[str] = None,
    password: Optional[str] = None,
) -> SubstackDigest:
    """Convenience helper to fetch Substack emails and return an LLM-ready SubstackDigest."""
    with GmailClient(user=user, password=password) as client:
        return client.create_substack_digest(limit=limit, unread_only=unread_only)
