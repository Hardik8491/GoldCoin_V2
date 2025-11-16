"""
API v1 routes initialization.
"""

from fastapi import APIRouter

api_router = APIRouter()

# Import routes after router creation to avoid circular imports
from app.api.v1 import auth, users, expenses, budgets, predictions, onboarding, analytics, ai, logs

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
api_router.include_router(budgets.router, prefix="/budgets", tags=["budgets"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
api_router.include_router(onboarding.router, prefix="/onboarding", tags=["onboarding"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(logs.router, prefix="/logs", tags=["logs"])