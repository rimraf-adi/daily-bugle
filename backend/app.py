"""Streamlit dashboard entrypoint for Daily Bugle backend."""

import sys
from pathlib import Path

# Ensure backend root directory is in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from dashboard.app import render_dashboard

render_dashboard()
