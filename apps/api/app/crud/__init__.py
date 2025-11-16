"""
CRUD operations initialization.
"""

from .user import user
from .expense import expense
from .budget import budget
from .prediction import prediction
from .onboarding import onboarding

__all__ = ["user", "expense", "budget", "prediction", "onboarding"]