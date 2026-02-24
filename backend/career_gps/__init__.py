"""
Career GPS - AI-Powered Career Path Generator

Package: career_gps

This __init__.py file turns the 'career_gps' directory into a proper Python package
and makes the core components easily importable.

Author: Swastik (Mumbai, India) – with help from Grok (xAI)
Version: 1.0.0
Date: February 2026
"""

# Import the main model class so users can do:
# from career_gps import CareerPathModel
from .model import CareerPathModel

# Optional: You can add more imports here in the future
# e.g., from .utils import some_helper_function

# Define what gets imported with "from career_gps import *"
__all__ = [
    "CareerPathModel",
]

# Package metadata (useful for tools like pip show or setup.py)
__version__ = "1.0.0"
__author__ = "Swastik Kulkarni"
__email__ = ""  # Add your email if you want
__description__ = "AI-powered personalized career roadmap generator using Google Gemini"
__license__ = "MIT"
__url__ = "https://github.com/yourusername/CareerGPS"  # Update with your repo if any