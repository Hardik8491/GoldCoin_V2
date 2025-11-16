"""
Budget model definition.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.models.expense import CategoryEnum


class Budget(Base):
    """Budget model for tracking spending limits by category."""
    
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(SQLEnum(CategoryEnum), nullable=False)
    limit_amount = Column(Float, nullable=False)
    month = Column(String, nullable=False)  # YYYY-MM format
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="budgets")
    
    def __repr__(self):
        return (
            f"<Budget(id={self.id}, user_id={self.user_id}, "
            f"category='{self.category}', limit_amount={self.limit_amount}, "
            f"month='{self.month}')>"
        )