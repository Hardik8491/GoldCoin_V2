"""
Budget schemas for API requests and responses.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.expense import CategoryEnum


class BudgetBase(BaseModel):
    """Base budget schema with common fields."""
    category: CategoryEnum
    limit_amount: float = Field(..., gt=0, description="Budget limit must be positive")
    month: str = Field(..., pattern=r"^\d{4}-\d{2}$", description="Month in YYYY-MM format")


class BudgetCreate(BudgetBase):
    """Schema for creating a new budget."""
    pass


class BudgetUpdate(BaseModel):
    """Schema for updating budget information."""
    category: Optional[CategoryEnum] = None
    limit_amount: Optional[float] = Field(None, gt=0)
    month: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}$")


class BudgetResponse(BudgetBase):
    """Schema for budget API responses."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True