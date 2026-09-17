from __future__ import annotations

import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from typing import List, Optional

ATOM_NS = "{http://www.w3.org/2005/Atom}"
ARXIV_NS = "{http://arxiv.org/schemas/atom}"


@dataclass
class ArxivPaper:
    """Represents a research paper fetched from arXiv."""
    arxiv_id: str
    title: str
    summary: str
    authors: List[str] = field(default_factory=list)
    published: Optional[str] = None
    updated: Optional[str] = None
    entry_url: Optional[str] = None
    pdf_url: Optional[str] = None
    primary_category: Optional[str] = None
    categories: List[str] = field(default_factory=list)


class ArxivClient:
    """Client to query the arXiv API."""

    BASE_URL = "http://export.arxiv.org/api/query"

    def __init__(self, base_url: str = BASE_URL, timeout: int = 15):
        self.base_url = base_url
        self.timeout = timeout

    def search(
        self,
        query: str,
        start: int = 0,
        max_results: int = 10,
        sort_by: str = "submittedDate",
        sort_order: str = "descending",
    ) -> List[ArxivPaper]:
        """
        Search arXiv papers matching the given query.

        :param query: arXiv search query (e.g. "quantum computing" or "cat:cs.AI").
        :param start: 0-based index of the first result.
        :param max_results: Maximum number of papers to retrieve.
        :param sort_by: "relevance", "lastUpdatedDate", or "submittedDate".
        :param sort_order: "ascending" or "descending".
        """
        params = {
            "search_query": query,
            "start": start,
            "max_results": max_results,
            "sortBy": sort_by,
            "sortOrder": sort_order,
        }
        url = f"{self.base_url}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "DailyBugleArxivClient/1.0 (mailto:dailybugle@example.com)"},
        )

        with urllib.request.urlopen(req, timeout=self.timeout) as response:
            content = response.read()

        return self.parse_feed(content)

    def parse_feed(self, xml_content: bytes | str) -> List[ArxivPaper]:
        """Parse raw Atom XML feed returned by the arXiv API into ArxivPaper instances."""
        if isinstance(xml_content, str):
            xml_content = xml_content.encode("utf-8")

        root = ET.fromstring(xml_content)
        papers: List[ArxivPaper] = []

        for entry in root.findall(f"{ATOM_NS}entry"):
            id_el = entry.find(f"{ATOM_NS}id")
            raw_id = id_el.text.strip() if id_el is not None and id_el.text else ""
            arxiv_id = raw_id.rsplit("/abs/", 1)[-1] if "/abs/" in raw_id else raw_id

            title_el = entry.find(f"{ATOM_NS}title")
            title = " ".join((title_el.text or "").split()) if title_el is not None else ""

            summary_el = entry.find(f"{ATOM_NS}summary")
            summary = " ".join((summary_el.text or "").split()) if summary_el is not None else ""

            authors = []
            for author_el in entry.findall(f"{ATOM_NS}author"):
                name_el = author_el.find(f"{ATOM_NS}name")
                if name_el is not None and name_el.text:
                    authors.append(name_el.text.strip())

            published_el = entry.find(f"{ATOM_NS}published")
            published = published_el.text.strip() if published_el is not None and published_el.text else None

            updated_el = entry.find(f"{ATOM_NS}updated")
            updated = updated_el.text.strip() if updated_el is not None and updated_el.text else None

            entry_url = None
            pdf_url = None
            for link in entry.findall(f"{ATOM_NS}link"):
                rel = link.attrib.get("rel")
                href = link.attrib.get("href")
                title_attr = link.attrib.get("title")
                if rel == "alternate" and href:
                    entry_url = href
                elif title_attr == "pdf" and href:
                    pdf_url = href

            if not entry_url and raw_id:
                entry_url = raw_id
            if not pdf_url and arxiv_id:
                pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"

            primary_cat_el = entry.find(f"{ARXIV_NS}primary_category")
            primary_category = (
                primary_cat_el.attrib.get("term") if primary_cat_el is not None else None
            )

            categories = []
            for cat_el in entry.findall(f"{ATOM_NS}category"):
                term = cat_el.attrib.get("term")
                if term:
                    categories.append(term)

            papers.append(
                ArxivPaper(
                    arxiv_id=arxiv_id,
                    title=title,
                    summary=summary,
                    authors=authors,
                    published=published,
                    updated=updated,
                    entry_url=entry_url,
                    pdf_url=pdf_url,
                    primary_category=primary_category,
                    categories=categories,
                )
            )

        return papers


default_client = ArxivClient()


def search_papers(
    query: str,
    start: int = 0,
    max_results: int = 10,
    sort_by: str = "submittedDate",
    sort_order: str = "descending",
) -> List[ArxivPaper]:
    """Search papers matching a query using the default ArxivClient."""
    return default_client.search(
        query=query,
        start=start,
        max_results=max_results,
        sort_by=sort_by,
        sort_order=sort_order,
    )


def fetch_recent_papers(
    category: str = "cs.AI",
    max_results: int = 10,
) -> List[ArxivPaper]:
    """Fetch the most recent papers in a specific category (e.g., 'cs.AI', 'cs.LG', 'cs.CV')."""
    return search_papers(
        query=f"cat:{category}",
        start=0,
        max_results=max_results,
        sort_by="submittedDate",
        sort_order="descending",
    )
