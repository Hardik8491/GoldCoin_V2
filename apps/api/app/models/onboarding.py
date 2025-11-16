"""
Onboarding model definitions.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.db.session import Base


class UserProfile(Base):
    """User profile information from onboarding."""
    
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    currency = Column(String, default="USD")
    theme = Column(String, default="system")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="profile")
    
    def __repr__(self):
        # Safe repr that handles detached instances
        try:
            id_val = getattr(self, 'id', None)
            user_id_val = getattr(self, 'user_id', None)
            return f"<UserProfile(id={id_val}, user_id={user_id_val})>"
        except Exception:
            return f"<UserProfile(id=None, user_id=None)>"


class FinancialSetup(Base):
    """User financial setup from onboarding."""
    
    __tablename__ = "financial_setups"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    current_savings = Column(Float, default=0.0)
    monthly_income = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="financial_setup")
    recurring_expenses = relationship("RecurringExpense", back_populates="financial_setup", cascade="all, delete-orphan")
    
    def __repr__(self):
        # Safe repr that handles detached instances
        try:
            id_val = getattr(self, 'id', None)
            user_id_val = getattr(self, 'user_id', None)
            return f"<FinancialSetup(id={id_val}, user_id={user_id_val})>"
        except Exception:
            return f"<FinancialSetup(id=None, user_id=None)>"


class RecurringExpense(Base):
    """Recurring expenses from onboarding."""
    
    __tablename__ = "recurring_expenses"
    
    id = Column(Integer, primary_key=True, index=True)
    financial_setup_id = Column(Integer, ForeignKey("financial_setups.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    financial_setup = relationship("FinancialSetup", back_populates="recurring_expenses")
    
    def __repr__(self):
        # Safe repr that handles detached instances
        try:
            id_val = getattr(self, 'id', None)
            name_val = getattr(self, 'name', 'N/A')
            amount_val = getattr(self, 'amount', None)
            return f"<RecurringExpense(id={id_val}, name='{name_val}', amount={amount_val})>"
        except Exception:
            return f"<RecurringExpense(id=None, name='N/A', amount=None)>"


class UserGoal(Base):
    """User financial goals from onboarding."""
    
    __tablename__ = "user_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    target_date = Column(DateTime, nullable=False)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="goals")
    
    def __repr__(self):
        # Safe repr that handles detached instances
        try:
            id_val = getattr(self, 'id', None)
            title_val = getattr(self, 'title', 'N/A')
            target_amount_val = getattr(self, 'target_amount', None)
            return f"<UserGoal(id={id_val}, title='{title_val}', target_amount={target_amount_val})>"
        except Exception:
            return f"<UserGoal(id=None, title='N/A', target_amount=None)>"

