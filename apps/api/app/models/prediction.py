"""
Spending prediction model definition.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, Float, DateTime, String, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.models.expense import CategoryEnum


class SpendingPrediction(Base):
    """Spending prediction model for AI-generated forecasts."""
    
    __tablename__ = "spending_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(SQLEnum(CategoryEnum), nullable=False)
    predicted_amount = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)  # 0.0 to 1.0
    model_version = Column(String, nullable=True)
    month = Column(String, nullable=False)  # YYYY-MM format
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="predictions")
    
    def __repr__(self):
        return (
            f"<SpendingPrediction(id={self.id}, user_id={self.user_id}, "
            f"category='{self.category}', predicted_amount={self.predicted_amount}, "
            f"confidence_score={self.confidence_score}, month='{self.month}')>"
        )