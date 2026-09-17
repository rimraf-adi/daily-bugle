"""
Dashboard module for Daily Bugle.

Interactive Streamlit control room and raw output visualizer for arXiv, Reddit,
Gmail, and OpenRouter modules.
"""

from pathlib import Path

APP_PATH = Path(__file__).resolve().parent / "app.py"

__all__ = ["APP_PATH"]
