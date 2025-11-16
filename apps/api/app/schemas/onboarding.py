"""
Onboarding schemas for API requests and responses.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class ProfileSetupBase(BaseModel):
    """Base profile setup schema."""
    name: str = Field(..., min_length=2, description="User's full name")
    currency: str = Field(default="USD", description="Preferred currency")
    theme: Optional[str] = Field(default="system", description="Theme preference")


class ProfileSetupCreate(ProfileSetupBase):
    """Schema for creating profile setup."""
    model_config = ConfigDict(populate_by_name=True)
    pass


class ProfileSetupResponse(ProfileSetupBase):
    """Schema for profile setup response."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        
    @classmethod
    def from_profile_and_user(cls, profile, user_name: str):
        """Create response from UserProfile and user name."""
        # Safely access attributes to avoid detached instance errors
        try:
            return cls(
                id=getattr(profile, 'id', None),
                user_id=getattr(profile, 'user_id', None),
                name=user_name or "",
                currency=getattr(profile, 'currency', 'USD'),
                theme=getattr(profile, 'theme', 'system') or "system",
                created_at=getattr(profile, 'created_at', None),
                updated_at=getattr(profile, 'updated_at', None),
            )
        except Exception as e:
            # Fallback if profile is detached
            return cls(
                id=None,
                user_id=None,
                name=user_name or "",
                currency='USD',
                theme='system',
                created_at=None,
                updated_at=None,
            )


class RecurringExpenseBase(BaseModel):
    """Base recurring expense schema."""
    model_config = ConfigDict(populate_by_name=True)
    
    name: str = Field(..., min_length=1, description="Expense name")
    amount: float = Field(..., gt=0, description="Expense amount")


class RecurringExpenseCreate(RecurringExpenseBase):
    """Schema for creating recurring expense."""
    pass


class RecurringExpenseResponse(RecurringExpenseBase):
    """Schema for recurring expense response."""
    id: int
    financial_setup_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
        
    @classmethod
    def from_attributes(cls, obj):
        """Create response from model instance safely."""
        try:
            return cls(
                id=getattr(obj, 'id', None),
                financial_setup_id=getattr(obj, 'financial_setup_id', None),
                name=getattr(obj, 'name', ''),
                amount=getattr(obj, 'amount', 0.0),
                created_at=getattr(obj, 'created_at', None),
            )
        except Exception:
            return cls(
                id=None,
                financial_setup_id=None,
                name='',
                amount=0.0,
                created_at=None,
            )


class FinancialSetupBase(BaseModel):
    """Base financial setup schema."""
    model_config = ConfigDict(populate_by_name=True)  # Allow both alias and original name
    
    current_savings: float = Field(default=0.0, ge=0, description="Current savings amount", alias="currentSavings")
    monthly_income: float = Field(..., gt=0, description="Monthly income", alias="monthlyIncome")
    recurring_expenses: List[RecurringExpenseCreate] = Field(default_factory=list, description="List of recurring expenses", alias="recurringExpenses")


class FinancialSetupCreate(FinancialSetupBase):
    """Schema for creating financial setup."""
    pass


class FinancialSetupResponse(BaseModel):
    """Schema for financial setup response."""
    id: int
    user_id: int
    current_savings: float
    monthly_income: float
    recurring_expenses: List[RecurringExpenseResponse] = []
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        
    @classmethod
    def from_orm_with_expenses(cls, obj):
        """Create response with eagerly loaded expenses."""
        try:
            # Safely access attributes
            recurring_expenses_list = []
            if hasattr(obj, 'recurring_expenses') and obj.recurring_expenses:
                try:
                    recurring_expenses_list = [
                        RecurringExpenseResponse.from_attributes(exp)
                        for exp in obj.recurring_expenses
                    ]
                except Exception:
                    recurring_expenses_list = []
            
            return cls(
                id=getattr(obj, 'id', None),
                user_id=getattr(obj, 'user_id', None),
                current_savings=getattr(obj, 'current_savings', 0.0),
                monthly_income=getattr(obj, 'monthly_income', 0.0),
                recurring_expenses=recurring_expenses_list,
                created_at=getattr(obj, 'created_at', None),
                updated_at=getattr(obj, 'updated_at', None),
            )
        except Exception:
            # Fallback if anything fails
            return cls(
                id=None,
                user_id=None,
                current_savings=0.0,
                monthly_income=0.0,
                recurring_expenses=[],
                created_at=None,
                updated_at=None,
            )


class CategoryBudgetBase(BaseModel):
    """Base category budget schema."""
    category: str = Field(..., description="Expense category")
    limit: float = Field(..., gt=0, description="Budget limit")


class CategoryBudgetCreate(CategoryBudgetBase):
    """Schema for creating category budget."""
    model_config = ConfigDict(populate_by_name=True)
    pass


class BudgetsCreate(BaseModel):
    """Schema for creating multiple budgets."""
    budgets: List[CategoryBudgetCreate] = Field(..., description="List of category budgets")


class GoalBase(BaseModel):
    """Base goal schema."""
    model_config = ConfigDict(populate_by_name=True)
    
    title: str = Field(..., min_length=1, description="Goal title")
    target_amount: float = Field(..., gt=0, description="Target amount", alias="targetAmount")
    target_date: datetime = Field(..., description="Target date", alias="targetDate")


class GoalCreate(GoalBase):
    """Schema for creating goal."""
    model_config = ConfigDict(populate_by_name=True)
    pass


class GoalResponse(GoalBase):
    """Schema for goal response."""
    id: int
    user_id: int
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class GoalsCreate(BaseModel):
    """Schema for creating multiple goals."""
    goals: List[GoalCreate] = Field(..., description="List of goals")


class OnboardingStatusResponse(BaseModel):
    """Schema for onboarding status response."""
    is_onboarded: bool
    
    class Config:
        from_attributes = True

