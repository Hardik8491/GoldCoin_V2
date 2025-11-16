"""
Analytics API routes.
"""
import logging
from typing import Any, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract, case

from app.core.security import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.models.expense import Expense
from app.models.budget import Budget
from app.models.expense import CategoryEnum

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/overview")
async def get_analytics_overview(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
) -> Any:
    """
    Get analytics overview with summary statistics.
    
    Args:
        current_user: Currently authenticated user
        db: Database session
        start_date: Optional start date filter
        end_date: Optional end date filter
        
    Returns:
        Analytics overview data
    """
    try:
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.utcnow().date()
        else:
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
            
        if not start_date:
            start_date = end_date - timedelta(days=30)
        else:
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        
        # Build query
        query = db.query(Expense).filter(Expense.user_id == current_user.id)
        query = query.filter(
            func.date(Expense.date) >= start_date,
            func.date(Expense.date) <= end_date
        )
        
        # Total expenses
        total_expenses = query.with_entities(func.sum(Expense.amount)).scalar() or 0.0
        
        # Expense count
        expense_count = query.count()
        
        # Average expense
        avg_expense = total_expenses / expense_count if expense_count > 0 else 0.0
        
        # Get current month budgets
        current_month = datetime.utcnow().strftime("%Y-%m")
        budgets = db.query(Budget).filter(
            Budget.user_id == current_user.id,
            Budget.month == current_month
        ).all()
        
        total_budget = sum(budget.limit_amount for budget in budgets)
        
        # Get expenses for current month
        current_month_start = datetime.utcnow().replace(day=1).date()
        current_month_expenses = db.query(func.sum(Expense.amount)).filter(
            Expense.user_id == current_user.id,
            func.date(Expense.date) >= current_month_start
        ).scalar() or 0.0
        
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
            },
            "expenses": {
                "total": float(total_expenses),
                "count": expense_count,
                "average": float(avg_expense),
            },
            "budget": {
                "total": float(total_budget),
                "spent": float(current_month_expenses),
                "remaining": float(total_budget - current_month_expenses),
                "percentage_used": float((current_month_expenses / total_budget * 100) if total_budget > 0 else 0),
            },
        }
    except Exception as e:
        logger.error(f"Error fetching analytics overview: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch analytics overview"
        )


@router.get("/trends")
async def get_analytics_trends(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    months: int = Query(6, ge=1, le=12, description="Number of months to analyze"),
) -> Any:
    """
    Get spending trends over time.
    
    Args:
        current_user: Currently authenticated user
        db: Database session
        months: Number of months to analyze
        
    Returns:
        Spending trends data
    """
    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=months * 30)
        
        # Query expenses grouped by month (using extract for cross-database compatibility)
        trends = (
            db.query(
                extract('year', Expense.date).label('year'),
                extract('month', Expense.date).label('month'),
                func.sum(Expense.amount).label('total'),
                func.count(Expense.id).label('count'),
            )
            .filter(
                Expense.user_id == current_user.id,
                Expense.date >= start_date
            )
            .group_by(
                extract('year', Expense.date),
                extract('month', Expense.date)
            )
            .order_by(
                extract('year', Expense.date),
                extract('month', Expense.date)
            )
            .all()
        )
        
        return {
            "period_months": months,
            "trends": [
                {
                    "month": f"{int(trend.year)}-{int(trend.month):02d}",
                    "total": float(trend.total),
                    "count": trend.count,
                }
                for trend in trends
            ],
        }
    except Exception as e:
        logger.error(f"Error fetching analytics trends: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch analytics trends"
        )


@router.get("/categories")
async def get_analytics_categories(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
) -> Any:
    """
    Get spending breakdown by category.
    
    Args:
        current_user: Currently authenticated user
        db: Database session
        start_date: Optional start date filter
        end_date: Optional end date filter
        
    Returns:
        Category spending breakdown
    """
    try:
        # Default to last 30 days if no dates provided
        if not end_date:
            end_date = datetime.utcnow().date()
        else:
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
            
        if not start_date:
            start_date = end_date - timedelta(days=30)
        else:
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        
        # Query expenses grouped by category
        category_stats = (
            db.query(
                Expense.category,
                func.sum(Expense.amount).label('total'),
                func.count(Expense.id).label('count'),
            )
            .filter(
                Expense.user_id == current_user.id,
                func.date(Expense.date) >= start_date,
                func.date(Expense.date) <= end_date
            )
            .group_by(Expense.category)
            .order_by(func.sum(Expense.amount).desc())
            .all()
        )
        
        total = sum(stat.total for stat in category_stats)
        
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
            },
            "total": float(total),
            "categories": [
                {
                    "category": stat.category.value if isinstance(stat.category, CategoryEnum) else stat.category,
                    "total": float(stat.total),
                    "count": stat.count,
                    "percentage": float((stat.total / total * 100) if total > 0 else 0),
                }
                for stat in category_stats
            ],
        }
    except Exception as e:
        logger.error(f"Error fetching category analytics: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch category analytics"
        )


@router.get("/monthly")
async def get_analytics_monthly(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    year: Optional[int] = Query(None, description="Year to analyze"),
) -> Any:
    """
    Get monthly spending breakdown for a year.
    
    Args:
        current_user: Currently authenticated user
        db: Database session
        year: Year to analyze (defaults to current year)
        
    Returns:
        Monthly spending breakdown
    """
    try:
        if not year:
            year = datetime.utcnow().year
        
        # Query expenses grouped by month
        monthly_stats = (
            db.query(
                extract('month', Expense.date).label('month'),
                func.sum(Expense.amount).label('total'),
                func.count(Expense.id).label('count'),
            )
            .filter(
                Expense.user_id == current_user.id,
                extract('year', Expense.date) == year
            )
            .group_by(extract('month', Expense.date))
            .order_by(extract('month', Expense.date))
            .all()
        )
        
        return {
            "year": year,
            "months": [
                {
                    "month": int(stat.month),
                    "total": float(stat.total),
                    "count": stat.count,
                }
                for stat in monthly_stats
            ],
        }
    except Exception as e:
        logger.error(f"Error fetching monthly analytics: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch monthly analytics"
        )

