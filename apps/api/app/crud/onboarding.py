"""
Onboarding CRUD operations.
"""
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_

from app.models.onboarding import UserProfile, FinancialSetup, RecurringExpense, UserGoal
from app.models.user import User
from app.schemas.onboarding import (
    ProfileSetupCreate,
    FinancialSetupCreate,
    CategoryBudgetCreate,
    GoalCreate,
)


class CRUDOnboarding:
    """CRUD operations for onboarding models."""
    
    # Profile Operations
    def get_profile(self, db: Session, *, user_id: int) -> Optional[UserProfile]:
        """Get user profile by user ID."""
        return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    
    def create_or_update_profile(
        self, db: Session, *, user_id: int, profile_in: ProfileSetupCreate
    ) -> UserProfile:
        """Create or update user profile."""
        # Update user's full_name first (before creating profile)
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.full_name = profile_in.name
            user.currency = profile_in.currency
            user.theme = profile_in.theme or "system"
            db.commit()
        
        profile = self.get_profile(db, user_id=user_id)
        
        if profile:
            profile.currency = profile_in.currency
            profile.theme = profile_in.theme or "system"
            db.commit()
            db.refresh(profile)
        else:
            profile = UserProfile(
                user_id=user_id,
                currency=profile_in.currency,
                theme=profile_in.theme or "system",
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        
        return profile
    
    # Financial Setup Operations
    def get_financial_setup(
        self, db: Session, *, user_id: int
    ) -> Optional[FinancialSetup]:
        """Get financial setup by user ID with eagerly loaded expenses."""
        return (
            db.query(FinancialSetup)
            .options(joinedload(FinancialSetup.recurring_expenses))
            .filter(FinancialSetup.user_id == user_id)
            .first()
        )
    
    def create_or_update_financial_setup(
        self, db: Session, *, user_id: int, financial_in: FinancialSetupCreate
    ) -> FinancialSetup:
        """Create or update financial setup."""
        financial_setup = self.get_financial_setup(db, user_id=user_id)
        
        if financial_setup:
            financial_setup.current_savings = financial_in.current_savings
            financial_setup.monthly_income = financial_in.monthly_income
            # Delete existing recurring expenses
            db.query(RecurringExpense).filter(
                RecurringExpense.financial_setup_id == financial_setup.id
            ).delete()
            db.commit()
        else:
            financial_setup = FinancialSetup(
                user_id=user_id,
                current_savings=financial_in.current_savings,
                monthly_income=financial_in.monthly_income,
            )
            db.add(financial_setup)
            db.commit()
            db.refresh(financial_setup)
        
        # Add recurring expenses
        for expense in financial_in.recurring_expenses:
            recurring_expense = RecurringExpense(
                financial_setup_id=financial_setup.id,
                name=expense.name,
                amount=expense.amount,
            )
            db.add(recurring_expense)
        
        db.commit()
        # Refresh financial_setup to ensure it's attached to session
        db.refresh(financial_setup)
        # Re-query with eager loading to avoid detached instance errors
        financial_setup = (
            db.query(FinancialSetup)
            .options(joinedload(FinancialSetup.recurring_expenses))
            .filter(FinancialSetup.id == financial_setup.id)
            .first()
        )
        return financial_setup
    
    # Budget Operations
    def create_budgets(
        self, db: Session, *, user_id: int, budgets: List[CategoryBudgetCreate]
    ) -> List:
        """Create budgets for user from onboarding."""
        from app.models.budget import Budget
        from app.models.expense import CategoryEnum
        from datetime import datetime
        
        created_budgets = []
        current_month = datetime.utcnow().strftime("%Y-%m")
        
        for budget_data in budgets:
            # Convert category string to enum if needed
            try:
                category_enum = CategoryEnum(budget_data.category)
            except ValueError:
                # If category doesn't match enum, skip or use 'other'
                category_enum = CategoryEnum.other
            
            # Check if budget already exists for this month
            existing = (
                db.query(Budget)
                .filter(
                    and_(
                        Budget.user_id == user_id,
                        Budget.category == category_enum,
                        Budget.month == current_month,
                    )
                )
                .first()
            )
            
            if existing:
                existing.limit_amount = budget_data.limit
                db.commit()
                db.refresh(existing)
                created_budgets.append(existing)
            else:
                budget = Budget(
                    user_id=user_id,
                    category=category_enum,
                    limit_amount=budget_data.limit,
                    month=current_month,
                )
                db.add(budget)
                db.commit()
                db.refresh(budget)
                created_budgets.append(budget)
        
        return created_budgets
    
    # Goal Operations
    def create_goals(
        self, db: Session, *, user_id: int, goals: List[GoalCreate]
    ) -> List[UserGoal]:
        """Create goals for user from onboarding."""
        if not goals:
            return []
        
        created_goals = []
        
        for goal_data in goals:
            goal = UserGoal(
                user_id=user_id,
                title=goal_data.title,
                target_amount=goal_data.target_amount,
                target_date=goal_data.target_date,
            )
            db.add(goal)
            created_goals.append(goal)
        
        db.commit()
        # Refresh all goals to ensure they're attached to session
        for goal in created_goals:
            db.refresh(goal)
        
        return created_goals
    
    def complete_onboarding(self, db: Session, *, user_id: int) -> User:
        """Mark user as onboarded."""
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_onboarded = True
            db.commit()
            db.refresh(user)
        else:
            raise ValueError(f"User with id {user_id} not found")
        return user


onboarding = CRUDOnboarding()

