"""
Expense model and category enumeration.
"""
import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.db.session import Base


class CategoryEnum(str, enum.Enum):
    """Expense category enumeration."""
    FOOD = "food"
    TRANSPORT = "transport"
    ENTERTAINMENT = "entertainment"
    UTILITIES = "utilities"
    SHOPPING = "shopping"
    HEALTH = "health"
    EDUCATION = "education"
    HOUSING = "housing"
    INSURANCE = "insurance"
    SAVINGS = "savings"
    INVESTMENTS = "investments"
    DEBT = "debt"
    GIFTS = "gifts"
    TRAVEL = "travel"
    OTHER = "other"


class Expense(Base):
    """Expense model for tracking user spending."""
    
    __tablename__ = "expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(SQLEnum(CategoryEnum), nullable=False)
    ai_suggested_category = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="expenses")
    
    def __repr__(self):
        return (
            f"<Expense(id={self.id}, user_id={self.user_id}, "
            f"description='{self.description}', amount={self.amount}, "
            f"category='{self.category}')>"
        )