"""
Pydantic schemas initialization.
"""

from .user import UserCreate, UserUpdate, UserResponse, UserInDB
from .expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from .budget import BudgetCreate, BudgetUpdate, BudgetResponse
from .prediction import PredictionResponse
from .auth import TokenResponse, TokenData
from .onboarding import (
    ProfileSetupCreate, ProfileSetupResponse,
    FinancialSetupCreate, FinancialSetupResponse,
    BudgetsCreate, GoalsCreate, GoalResponse,
    OnboardingStatusResponse
)

__all__ = [
    "UserCreate", "UserUpdate", "UserResponse", "UserInDB",
    "ExpenseCreate", "ExpenseUpdate", "ExpenseResponse",
    "BudgetCreate", "BudgetUpdate", "BudgetResponse",
    "PredictionResponse",
    "TokenResponse", "TokenData",
    "ProfileSetupCreate", "ProfileSetupResponse",
    "FinancialSetupCreate", "FinancialSetupResponse",
    "BudgetsCreate", "GoalsCreate", "GoalResponse",
    "OnboardingStatusResponse"
]