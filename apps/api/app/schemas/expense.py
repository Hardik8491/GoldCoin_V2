"""
Expense schemas for API requests and responses.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.expense import CategoryEnum


class ExpenseBase(BaseModel):
    """Base expense schema with common fields."""
    description: str = Field(..., min_length=1, max_length=255, description="Expense description")
    amount: float = Field(..., gt=0, description="Expense amount must be positive")
    category: CategoryEnum
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes")


class ExpenseCreate(ExpenseBase):
    """Schema for creating a new expense."""
    date: Optional[datetime] = None


class ExpenseUpdate(BaseModel):
    """Schema for updating expense information."""
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[CategoryEnum] = None
    notes: Optional[str] = Field(None, max_length=1000)
    date: Optional[datetime] = None


class ExpenseResponse(ExpenseBase):
    """Schema for expense API responses."""
    id: int
    user_id: int
    ai_suggested_category: Optional[str] = None
    date: datetime
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True