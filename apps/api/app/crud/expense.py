"""
Expense CRUD operations.
"""
from typing import List, Optional
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate


class CRUDExpense(CRUDBase[Expense, ExpenseCreate, ExpenseUpdate]):
    """CRUD operations for Expense model."""
    
    def get_by_user(
        self, 
        db: Session, 
        *, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Expense]:
        """Get expenses by user ID."""
        return (
            db.query(Expense)
            .filter(Expense.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_user_and_category(
        self,
        db: Session,
        *,
        user_id: int,
        category: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Expense]:
        """Get expenses by user ID and category."""
        return (
            db.query(Expense)
            .filter(Expense.user_id == user_id, Expense.category == category)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def create_for_user(
        self, 
        db: Session, 
        *, 
        obj_in: ExpenseCreate, 
        user_id: int
    ) -> Expense:
        """Create expense for specific user."""
        obj_in_data = obj_in.dict()
        obj_in_data["user_id"] = user_id
        db_obj = Expense(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_total_by_user_and_month(
        self,
        db: Session,
        *,
        user_id: int,
        year: int,
        month: int
    ) -> float:
        """Get total expenses for user in specific month."""
        from sqlalchemy import func, extract
        
        result = (
            db.query(func.sum(Expense.amount))
            .filter(
                Expense.user_id == user_id,
                extract('year', Expense.date) == year,
                extract('month', Expense.date) == month
            )
            .scalar()
        )
        return result or 0.0


expense = CRUDExpense(Expense)