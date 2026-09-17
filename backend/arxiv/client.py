from __future__ import annotations

import urllib.parse
import xml.etree.ElementTree as ET
from typing import List, Optional, Union

import requests

from .models import CATEGORY_MAP, ArxivPaper, NewsletterDigest, PaperLinks

ATOM_NS = "{http://www.w3.org/2005/Atom}"
ARXIV_NS = "{http://arxiv.org/schemas/atom}"


class ArxivClient:
    """Client to query the arXiv API and produce semantic, LLM-ready data."""

    BASE_URL = "https://export.arxiv.org/api/query"

    def __init__(self, base_url: str = BASE_URL, timeout: int = 20):
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
        headers = {"User-Agent": "DailyBugleNewsletter/1.0 (mailto:dailybugle@example.com)"}
        resp = requests.get(self.base_url, params=params, headers=headers, timeout=self.timeout)
        resp.raise_for_status()

        return self.parse_feed(resp.content)

    def fetch_newsletter_digest(
        self,
        categories: Union[List[str], str] = ("cs.AI", "cs.LG", "cs.CL"),
        max_results: int = 10,
        topic: Optional[str] = None,
        sort_by: str = "submittedDate",
    ) -> NewsletterDigest:
        """
        Fetch a curated batch of recent papers across one or more categories,
        packaged as an LLM-ready NewsletterDigest.

        :param categories: Single category string or list of categories (e.g. ["cs.AI", "cs.LG"]).
        :param max_results: Number of papers to fetch.
        :param topic: Optional descriptive topic name for the newsletter.
        :param sort_by: "submittedDate", "lastUpdatedDate", or "relevance".
        """
        if isinstance(categories, str):
            cat_list = [categories]
        else:
            cat_list = list(categories)

        # Build arXiv category query, e.g. "cat:cs.AI OR cat:cs.LG"
        query = " OR ".join(f"cat:{c}" for c in cat_list)

        if not topic:
            cat_readable = [CATEGORY_MAP.get(c, c) for c in cat_list]
            topic = f"Latest Updates in {', '.join(cat_readable)}"

        papers = self.search(
            query=query,
            start=0,
            max_results=max_results,
            sort_by=sort_by,
            sort_order="descending",
        )

        return NewsletterDigest(topic=topic, papers=papers)

    def parse_feed(self, xml_content: Union[bytes, str]) -> List[ArxivPaper]:
        """Parse raw Atom XML feed returned by arXiv API into semantic ArxivPaper instances."""
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
            abstract = " ".join((summary_el.text or "").split()) if summary_el is not None else ""

            authors = []
            for author_el in entry.findall(f"{ATOM_NS}author"):
                name_el = author_el.find(f"{ATOM_NS}name")
                if name_el is not None and name_el.text:
                    authors.append(name_el.text.strip())

            published_el = entry.find(f"{ATOM_NS}published")
            published = published_el.text.strip() if published_el is not None and published_el.text else None

            updated_el = entry.find(f"{ATOM_NS}updated")
            updated = updated_el.text.strip() if updated_el is not None and updated_el.text else None

            # Links
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

            abs_link = entry_url or f"https://arxiv.org/abs/{arxiv_id}"
            pdf_link = pdf_url or f"https://arxiv.org/pdf/{arxiv_id}.pdf"
            html_link = f"https://arxiv.org/html/{arxiv_id}"

            links = PaperLinks(
                abstract=abs_link,
                pdf=pdf_link,
                html=html_link,
                full_article=html_link,  # arXiv HTML view is ideal for reading and LLM parsing
            )

            # Metadata & Categories
            primary_cat_el = entry.find(f"{ARXIV_NS}primary_category")
            primary_category = (
                primary_cat_el.attrib.get("term") if primary_cat_el is not None else None
            )

            categories: List[str] = []
            for cat_el in entry.findall(f"{ATOM_NS}category"):
                term = cat_el.attrib.get("term")
                if term and term not in categories:
                    categories.append(term)

            if not primary_category and categories:
                primary_category = categories[0]

            primary_category_name = CATEGORY_MAP.get(primary_category) if primary_category else None
            category_names = [CATEGORY_MAP.get(c, c) for c in categories]

            # Additional metadata (comments, journal ref, doi)
            comment_el = entry.find(f"{ARXIV_NS}comment")
            comment = " ".join((comment_el.text or "").split()) if comment_el is not None and comment_el.text else None

            journal_el = entry.find(f"{ARXIV_NS}journal_ref")
            journal_ref = " ".join((journal_el.text or "").split()) if journal_el is not None and journal_el.text else None

            doi_el = entry.find(f"{ARXIV_NS}doi")
            doi = doi_el.text.strip() if doi_el is not None and doi_el.text else None

            papers.append(
                ArxivPaper(
                    arxiv_id=arxiv_id,
                    title=title,
                    abstract=abstract,
                    authors=authors,
                    published=published,
                    updated=updated,
                    primary_category=primary_category,
                    primary_category_name=primary_category_name,
                    categories=categories,
                    category_names=category_names,
                    comment=comment,
                    journal_ref=journal_ref,
                    doi=doi,
                    links=links,
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


def fetch_newsletter_digest(
    categories: Union[List[str], str] = ("cs.AI", "cs.LG", "cs.CL"),
    max_results: int = 10,
    topic: Optional[str] = None,
) -> NewsletterDigest:
    """Fetch a newsletter digest ready for LLM consumption with links to full articles."""
    return default_client.fetch_newsletter_digest(
        categories=categories,
        max_results=max_results,
        topic=topic,
    )
