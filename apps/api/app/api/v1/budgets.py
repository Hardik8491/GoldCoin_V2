"""
Budget management API routes.
"""
import logging
from typing import Any, List, Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.crud import budget
from app.db.session import get_db
from app.models.user import User
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("", response_model=List[BudgetResponse])
async def get_budgets(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    month: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}$", description="Filter by month (YYYY-MM)"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get user's budgets with optional filtering.
    
    Args:
        skip: Number of records to skip
        limit: Number of records to return
        month: Optional month filter (YYYY-MM format)
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        List of user's budgets
    """
    try:
        if month:
            budgets = budget.get_by_user_and_month(
                db, 
                user_id=current_user.id, 
                month=month
            )
        else:
            budgets = budget.get_by_user(
                db, 
                user_id=current_user.id, 
                skip=skip, 
                limit=limit
            )
        
        return budgets
        
    except Exception as e:
        logger.error(f"Error fetching budgets: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch budgets"
        )


@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_budget(
    budget_data: BudgetCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Create a new budget.
    
    Args:
        budget_data: Budget creation data
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        Created budget data
        
    Raises:
        HTTPException: If budget already exists for category and month
    """
    try:
        # Check if budget already exists for this category and month
        existing_budget = budget.get_by_user_category_and_month(
            db,
            user_id=current_user.id,
            category=budget_data.category.value,
            month=budget_data.month
        )
        
        if existing_budget:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Budget already exists for this category and month"
            )
        
        db_budget = budget.create_for_user(
            db, 
            obj_in=budget_data, 
            user_id=current_user.id
        )
        
        logger.info(f"Budget created: {db_budget.id} for user {current_user.id}")
        return db_budget
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating budget: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create budget"
        )


@router.get("/status")
async def get_budget_status(
    month: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}$", description="Filter by month (YYYY-MM)"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get budget status (spent vs allocated) for all budgets.
    
    Args:
        month: Optional month filter (YYYY-MM format), defaults to current month
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        List of budget statuses with spent amounts
    """
    try:
        from app.models.expense import Expense
        from sqlalchemy import func, extract
        
        # Default to current month if not specified
        if not month:
            month = datetime.utcnow().strftime("%Y-%m")
        
        # Get all budgets for the user and month
        budgets = budget.get_by_user_and_month(
            db,
            user_id=current_user.id,
            month=month
        )
        
        # Calculate spent amounts for each budget
        status_list = []
        for budget_item in budgets:
            # Get start and end of month
            year, month_num = map(int, month.split('-'))
            month_start = datetime(year, month_num, 1)
            if month_num == 12:
                month_end = datetime(year + 1, 1, 1) - timedelta(days=1)
            else:
                month_end = datetime(year, month_num + 1, 1) - timedelta(days=1)
            
            # Calculate spent amount for this category in this month
            spent = (
                db.query(func.sum(Expense.amount))
                .filter(
                    Expense.user_id == current_user.id,
                    Expense.category == budget_item.category,
                    func.date(Expense.date) >= month_start.date(),
                    func.date(Expense.date) <= month_end.date()
                )
                .scalar() or 0.0
            )
            
            status_list.append({
                "budget_id": budget_item.id,
                "category": budget_item.category.value if hasattr(budget_item.category, 'value') else str(budget_item.category),
                "month": budget_item.month,
                "limit": float(budget_item.limit_amount),
                "spent": float(spent),
                "remaining": float(budget_item.limit_amount - spent),
                "percentage_used": float((spent / budget_item.limit_amount * 100) if budget_item.limit_amount > 0 else 0),
            })
        
        return status_list
        
    except Exception as e:
        logger.error(f"Error fetching budget status: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch budget status"
        )


@router.get("/{budget_id}", response_model=BudgetResponse)
async def get_budget(
    budget_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific budget by ID.
    
    Args:
        budget_id: Budget ID
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        Budget data
        
    Raises:
        HTTPException: If budget not found or access denied
    """
    db_budget = budget.get(db, id=budget_id)
    
    if not db_budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    if db_budget.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return db_budget


@router.put("/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: int,
    budget_update: BudgetUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update an existing budget.
    
    Args:
        budget_id: Budget ID
        budget_update: Budget update data
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        Updated budget data
        
    Raises:
        HTTPException: If budget not found or access denied
    """
    db_budget = budget.get(db, id=budget_id)
    
    if not db_budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    if db_budget.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Check for conflicts if category or month is being changed
    if budget_update.category or budget_update.month:
        new_category = budget_update.category.value if budget_update.category else db_budget.category
        new_month = budget_update.month if budget_update.month else db_budget.month
        
        existing_budget = budget.get_by_user_category_and_month(
            db,
            user_id=current_user.id,
            category=new_category,
            month=new_month
        )
        
        if existing_budget and existing_budget.id != budget_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Budget already exists for this category and month"
            )
    
    try:
        updated_budget = budget.update(
            db, 
            db_obj=db_budget, 
            obj_in=budget_update
        )
        
        logger.info(f"Budget updated: {budget_id} by user {current_user.id}")
        return updated_budget
        
    except Exception as e:
        logger.error(f"Error updating budget: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update budget"
        )


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    budget_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> None:
    """
    Delete a budget.
    
    Args:
        budget_id: Budget ID
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        None (204 No Content)
        
    Raises:
        HTTPException: If budget not found or access denied
    """
    db_budget = budget.get(db, id=budget_id)
    
    if not db_budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    if db_budget.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        budget.remove(db, id=budget_id)
        logger.info(f"Budget deleted: {budget_id} by user {current_user.id}")
        
    except Exception as e:
        logger.error(f"Error deleting budget: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete budget"
        )