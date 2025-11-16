"""
Prediction schemas for API responses.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.models.expense import CategoryEnum


class PredictionResponse(BaseModel):
    """Schema for spending prediction API responses."""
    id: int
    user_id: int
    category: CategoryEnum
    predicted_amount: float
    confidence_score: float
    model_version: Optional[str] = None
    month: str
    created_at: datetime
    
    class Config:
        from_attributes = True