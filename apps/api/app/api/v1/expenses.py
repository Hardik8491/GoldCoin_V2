"""
Expense management API routes.
"""
import logging
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.crud import expense
from app.db.session import get_db
from app.models.user import User
from app.models.expense import CategoryEnum
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("", response_model=List[ExpenseResponse])
async def get_expenses(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    category: Optional[CategoryEnum] = Query(None, description="Filter by category"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get user's expenses with optional filtering.
    
    Args:
        skip: Number of records to skip
        limit: Number of records to return
        category: Optional category filter
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        List of user's expenses
    """
    try:
        if category:
            expenses = expense.get_by_user_and_category(
                db, 
                user_id=current_user.id, 
                category=category.value,
                skip=skip, 
                limit=limit
            )
        else:
            expenses = expense.get_by_user(
                db, 
                user_id=current_user.id, 
                skip=skip, 
                limit=limit
            )
        
        return expenses
        
    except Exception as e:
        logger.error(f"Error fetching expenses: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch expenses"
        )


@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense_data: ExpenseCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Create a new expense.
    
    Args:
        expense_data: Expense creation data
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        Created expense data
    """
    try:
        db_expense = expense.create_for_user(
            db, 
            obj_in=expense_data, 
            user_id=current_user.id
        )
        
        logger.info(f"Expense created: {db_expense.id} for user {current_user.id}")
        return db_expense
        
    except Exception as e:
        logger.error(f"Error creating expense: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create expense"
        )


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific expense by ID.
    
    Args:
        expense_id: Expense ID
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        Expense data
        
    Raises:
        HTTPException: If expense not found or access denied
    """
    db_expense = expense.get(db, id=expense_id)
    
    if not db_expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    if db_expense.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return db_expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: int,
    expense_update: ExpenseUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update an existing expense.
    
    Args:
        expense_id: Expense ID
        expense_update: Expense update data
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        Updated expense data
        
    Raises:
        HTTPException: If expense not found or access denied
    """
    db_expense = expense.get(db, id=expense_id)
    
    if not db_expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    if db_expense.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        updated_expense = expense.update(
            db, 
            db_obj=db_expense, 
            obj_in=expense_update
        )
        
        logger.info(f"Expense updated: {expense_id} by user {current_user.id}")
        return updated_expense
        
    except Exception as e:
        logger.error(f"Error updating expense: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update expense"
        )


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> None:
    """
    Delete an expense.
    
    Args:
        expense_id: Expense ID
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        None (204 No Content)
        
    Raises:
        HTTPException: If expense not found or access denied
    """
    db_expense = expense.get(db, id=expense_id)
    
    if not db_expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    
    if db_expense.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        expense.remove(db, id=expense_id)
        logger.info(f"Expense deleted: {expense_id} by user {current_user.id}")
        
    except Exception as e:
        logger.error(f"Error deleting expense: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete expense"
        )


@router.get("/stats/monthly", response_model=dict)
async def get_monthly_stats(
    year: int = Query(..., ge=2020, le=2030, description="Year"),
    month: int = Query(..., ge=1, le=12, description="Month"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get monthly expense statistics.
    
    Args:
        year: Year for statistics
        month: Month for statistics
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        Monthly expense statistics
    """
    try:
        total_amount = expense.get_total_by_user_and_month(
            db, 
            user_id=current_user.id, 
            year=year, 
            month=month
        )
        
        return {
            "year": year,
            "month": month,
            "total_amount": total_amount,
            "user_id": current_user.id
        }
        
    except Exception as e:
        logger.error(f"Error fetching monthly stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch monthly statistics"
        )