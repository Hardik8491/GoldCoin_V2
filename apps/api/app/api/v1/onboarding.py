"""
Onboarding API routes.
"""
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.crud import onboarding
from app.db.session import get_db
from app.models.user import User
from app.schemas.onboarding import (
    ProfileSetupCreate,
    ProfileSetupResponse,
    FinancialSetupCreate,
    FinancialSetupResponse,
    BudgetsCreate,
    GoalsCreate,
    GoalResponse,
    OnboardingStatusResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/profile", response_model=ProfileSetupResponse)
async def save_profile(
    profile_data: ProfileSetupCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Save user profile setup.
    
    Args:
        profile_data: Profile setup data
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        Saved profile data
    """
    try:
        profile = onboarding.create_or_update_profile(
            db, user_id=current_user.id, profile_in=profile_data
        )
        logger.info(f"Profile saved for user: {current_user.email}")
        # Ensure profile is still attached to session before accessing attributes
        db.refresh(profile)
        # Refresh user to get updated full_name
        db.refresh(current_user)
        # Extract all values while objects are still in session
        user_name = getattr(current_user, 'full_name', None) or profile_data.name
        profile_id = getattr(profile, 'id', None)
        profile_user_id = getattr(profile, 'user_id', None)
        profile_currency = getattr(profile, 'currency', 'USD')
        profile_theme = getattr(profile, 'theme', 'system') or 'system'
        profile_created_at = getattr(profile, 'created_at', None)
        profile_updated_at = getattr(profile, 'updated_at', None)
        # Create response with extracted values
        response = ProfileSetupResponse(
            id=profile_id,
            user_id=profile_user_id,
            name=user_name,
            currency=profile_currency,
            theme=profile_theme,
            created_at=profile_created_at,
            updated_at=profile_updated_at,
        )
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile save error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save profile",
        )


@router.post("/financial", response_model=FinancialSetupResponse)
async def save_financial_setup(
    financial_data: FinancialSetupCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Save user financial setup.
    
    Args:
        financial_data: Financial setup data
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        Saved financial setup data
    """
    try:
        financial_setup = onboarding.create_or_update_financial_setup(
            db, user_id=current_user.id, financial_in=financial_data
        )
        logger.info(f"Financial setup saved for user: {current_user.email}")
        # Ensure financial_setup is still attached to session before returning
        db.refresh(financial_setup)
        # Eagerly load recurring_expenses while session is active
        _ = list(financial_setup.recurring_expenses) if financial_setup.recurring_expenses else []
        # Use the custom from_orm method to handle relationships safely
        return FinancialSetupResponse.from_orm_with_expenses(financial_setup)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Financial setup save error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save financial setup",
        )


@router.post("/budgets")
async def save_budgets(
    budgets_data: BudgetsCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Save user budgets.
    
    Args:
        budgets_data: Budgets data
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        Success message
    """
    try:
        budgets = onboarding.create_budgets(
            db, user_id=current_user.id, budgets=budgets_data.budgets
        )
        logger.info(f"Budgets saved for user: {current_user.email}")
        return {"message": "Budgets saved successfully", "count": len(budgets)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Budgets save error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save budgets",
        )


@router.post("/goals", response_model=list[GoalResponse])
async def save_goals(
    goals_data: GoalsCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Save user goals.
    
    Args:
        goals_data: Goals data
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        List of saved goals
    """
    try:
        goals = onboarding.create_goals(
            db, user_id=current_user.id, goals=goals_data.goals
        )
        logger.info(f"Goals saved for user: {current_user.email}")
        # Extract all values while objects are still in session
        goal_responses = []
        for goal in goals:
            db.refresh(goal)
            goal_responses.append(GoalResponse(
                id=getattr(goal, 'id', None),
                user_id=getattr(goal, 'user_id', None),
                title=getattr(goal, 'title', ''),
                target_amount=getattr(goal, 'target_amount', 0.0),
                target_date=getattr(goal, 'target_date', None),
                is_completed=getattr(goal, 'is_completed', False),
                created_at=getattr(goal, 'created_at', None),
                updated_at=getattr(goal, 'updated_at', None),
            ))
        return goal_responses
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Goals save error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save goals",
        )


@router.post("/complete")
async def complete_onboarding(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Complete onboarding process.
    
    Args:
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        Success message
    """
    try:
        user = onboarding.complete_onboarding(db, user_id=current_user.id)
        # Extract email while user is still in session
        user_email = getattr(user, 'email', None) or current_user.email
        logger.info(f"Onboarding completed for user: {user_email}")
        return {"message": "Onboarding completed successfully", "is_onboarded": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Onboarding completion error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete onboarding",
        )


@router.get("/status", response_model=OnboardingStatusResponse)
async def get_onboarding_status(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get onboarding status for current user.
    
    Args:
        current_user: Currently authenticated user
        
    Returns:
        Onboarding status
    """
    is_onboarded = getattr(current_user, 'is_onboarded', False) or False
    return OnboardingStatusResponse(is_onboarded=is_onboarded)

