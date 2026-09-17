from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

CATEGORY_MAP: Dict[str, str] = {
    # Computer Science
    "cs.AI": "Artificial Intelligence",
    "cs.AR": "Hardware Architecture",
    "cs.CC": "Computational Complexity",
    "cs.CE": "Computational Engineering, Finance, and Science",
    "cs.CG": "Computational Geometry",
    "cs.CL": "Computation and Language (NLP)",
    "cs.CR": "Cryptography and Security",
    "cs.CV": "Computer Vision and Pattern Recognition",
    "cs.CY": "Computers and Society",
    "cs.DB": "Databases",
    "cs.DC": "Distributed, Parallel, and Cluster Computing",
    "cs.DL": "Digital Libraries",
    "cs.DM": "Discrete Mathematics",
    "cs.DS": "Data Structures and Algorithms",
    "cs.ET": "Emerging Technologies",
    "cs.FL": "Formal Languages and Automata Theory",
    "cs.GL": "General Literature",
    "cs.GR": "Graphics",
    "cs.GT": "Computer Science and Game Theory",
    "cs.HC": "Human-Computer Interaction",
    "cs.IR": "Information Retrieval",
    "cs.IT": "Information Theory",
    "cs.LG": "Machine Learning",
    "cs.LO": "Logic in Computer Science",
    "cs.MA": "Multiagent Systems",
    "cs.MM": "Multimedia",
    "cs.MS": "Mathematical Software",
    "cs.NA": "Numerical Analysis",
    "cs.NE": "Neural and Evolutionary Computing",
    "cs.NI": "Networking and Internet Architecture",
    "cs.OH": "Other Computer Science",
    "cs.OS": "Operating Systems",
    "cs.PF": "Performance",
    "cs.PL": "Programming Languages",
    "cs.RO": "Robotics",
    "cs.SC": "Symbolic Computation",
    "cs.SD": "Sound",
    "cs.SE": "Software Engineering",
    "cs.SI": "Social and Information Networks",
    "cs.SY": "Systems and Control",
    # Statistics
    "stat.ML": "Machine Learning (Statistics)",
    "stat.AP": "Applications",
    "stat.CO": "Computation",
    "stat.ME": "Methodology",
    "stat.TH": "Theory",
    # Mathematics
    "math.PR": "Probability",
    "math.ST": "Statistics Theory",
    "math.OC": "Optimization and Control",
    # Quantitative Biology
    "q-bio.NC": "Neurons and Cognition",
    "q-bio.QM": "Quantitative Methods",
    # Quantitative Finance
    "q-fin.CP": "Computational Finance",
    "q-fin.ST": "Statistical Finance",
}


@dataclass
class PaperLinks:
    """Explicit links for accessing paper full-text and landing page."""
    abstract: str
    pdf: str
    html: str
    full_article: str

    def to_dict(self) -> Dict[str, str]:
        return asdict(self)


@dataclass
class ArxivPaper:
    """Semantic data model for a research paper fetched from arXiv."""
    arxiv_id: str
    title: str
    abstract: str
    authors: List[str] = field(default_factory=list)
    published: Optional[str] = None
    updated: Optional[str] = None
    primary_category: Optional[str] = None
    primary_category_name: Optional[str] = None
    categories: List[str] = field(default_factory=list)
    category_names: List[str] = field(default_factory=list)
    comment: Optional[str] = None
    journal_ref: Optional[str] = None
    doi: Optional[str] = None
    links: Optional[PaperLinks] = None

    @property
    def summary(self) -> str:
        """Backwards compatibility alias for abstract."""
        return self.abstract

    @property
    def full_article_url(self) -> str:
        """Returns the best available link to read the full article."""
        if self.links:
            return self.links.full_article
        return f"https://arxiv.org/html/{self.arxiv_id}"

    def to_dict(self) -> Dict[str, Any]:
        """Export as a clean, serializable dictionary."""
        data = asdict(self)
        # Ensure links is serialized as a dictionary
        if self.links:
            data["links"] = self.links.to_dict()
        return data

    def to_json(self, indent: int = 2) -> str:
        """Export as a formatted JSON string."""
        return json.dumps(self.to_dict(), indent=indent)

    def to_llm_context(self) -> Dict[str, Any]:
        """
        Produce a compact, high-signal semantic dictionary specifically tuned for LLM prompts.
        Eliminates token bloat while keeping all critical metadata and full article links.
        """
        return {
            "arxiv_id": self.arxiv_id,
            "title": self.title,
            "authors": self.authors,
            "published": self.published,
            "primary_topic": self.primary_category_name or self.primary_category,
            "abstract": self.abstract,
            "full_article_link": self.full_article_url,
            "pdf_link": self.links.pdf if self.links else f"https://arxiv.org/pdf/{self.arxiv_id}.pdf",
            "html_link": self.links.html if self.links else f"https://arxiv.org/html/{self.arxiv_id}",
            "comment": self.comment,
        }

    def to_markdown(self) -> str:
        """Format the paper as semantic markdown with prominent full-article links."""
        authors_str = ", ".join(self.authors) if self.authors else "Unknown Authors"
        category_str = (
            f"{self.primary_category_name} (`{self.primary_category}`)"
            if self.primary_category_name
            else (self.primary_category or "Uncategorized")
        )
        pdf_url = self.links.pdf if self.links else f"https://arxiv.org/pdf/{self.arxiv_id}.pdf"
        html_url = self.links.html if self.links else f"https://arxiv.org/html/{self.arxiv_id}"
        abs_url = self.links.abstract if self.links else f"https://arxiv.org/abs/{self.arxiv_id}"

        md = [
            f"### [{self.title}]({self.full_article_url})",
            f"- **ArXiv ID:** `{self.arxiv_id}`",
            f"- **Authors:** {authors_str}",
            f"- **Category:** {category_str}",
            f"- **Published:** {self.published or 'N/A'}",
            f"- **Full Article Links:** [HTML Article]({html_url}) | [PDF Paper]({pdf_url}) | [Abstract Page]({abs_url})",
        ]
        if self.comment:
            md.append(f"- **Note/Code:** {self.comment}")
        md.append(f"\n**Abstract:**\n{self.abstract}\n")
        return "\n".join(md)


@dataclass
class NewsletterDigest:
    """
    Container for a periodic collection of research papers structured for newsletter generation.
    Provides semantic prompt formatting for LLM consumption.
    """
    topic: str
    generated_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    papers: List[ArxivPaper] = field(default_factory=list)

    @property
    def total_papers(self) -> int:
        return len(self.papers)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "topic": self.topic,
            "generated_at": self.generated_at,
            "total_papers": self.total_papers,
            "papers": [p.to_dict() for p in self.papers],
        }

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent)

    def to_llm_payload(self) -> List[Dict[str, Any]]:
        """List of curated semantic representations for LLM prompt context."""
        return [p.to_llm_context() for p in self.papers]

    def to_llm_prompt(self, custom_instructions: Optional[str] = None) -> str:
        """
        Generates a complete, structured prompt ready to pass into an LLM (e.g. Gemini/GPT/Claude)
        to draft a newsletter update.
        """
        papers_context = "\n---\n\n".join(p.to_markdown() for p in self.papers)
        instructions = custom_instructions or (
            "1. Write an engaging, publication-ready newsletter edition based on these papers.\n"
            "2. Include a compelling executive summary highlighting key industry shifts or research themes.\n"
            "3. For each featured paper, synthesize the core insight, why it matters, and MUST provide direct clickable markdown links to the Full Article (HTML / PDF).\n"
            "4. Add a 'Quick Hits' section for any remaining notable papers.\n"
            "5. Maintain an authoritative yet accessible tone."
        )

        return f"""You are the lead editor and researcher for the Daily Bugle Research Newsletter.

Topic: {self.topic}
Date: {self.generated_at}
Number of Papers Analyzed: {self.total_papers}

### INSTRUCTIONS:
{instructions}

### CURATED RESEARCH PAPERS:
{papers_context}
"""

    def to_markdown(self) -> str:
        """Formats the digest into a markdown newsletter draft."""
        lines = [
            f"# Daily Bugle Research Digest: {self.topic}",
            f"*Generated at: {self.generated_at} | Papers analyzed: {self.total_papers}*",
            "\n---\n",
        ]
        for p in self.papers:
            lines.append(p.to_markdown())
            lines.append("\n---\n")
        return "\n".join(lines)
