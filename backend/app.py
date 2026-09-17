"""Streamlit dashboard entrypoint for Daily Bugle backend."""

import ssl
import sys
from pathlib import Path

# Resolve macOS SSL certificate lookup failures across all libraries
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except AttributeError:
    pass

# Ensure backend root directory is in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from dashboard.app import render_dashboard

render_dashboard()
