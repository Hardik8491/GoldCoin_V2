"""
Budget CRUD operations.
"""
from typing import List, Optional
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.budget import Budget
from app.schemas.budget import BudgetCreate, BudgetUpdate


class CRUDBudget(CRUDBase[Budget, BudgetCreate, BudgetUpdate]):
    """CRUD operations for Budget model."""
    
    def get_by_user(
        self, 
        db: Session, 
        *, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Budget]:
        """Get budgets by user ID."""
        return (
            db.query(Budget)
            .filter(Budget.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_user_and_month(
        self,
        db: Session,
        *,
        user_id: int,
        month: str
    ) -> List[Budget]:
        """Get budgets by user ID and month."""
        return (
            db.query(Budget)
            .filter(Budget.user_id == user_id, Budget.month == month)
            .all()
        )
    
    def get_by_user_category_and_month(
        self,
        db: Session,
        *,
        user_id: int,
        category: str,
        month: str
    ) -> Optional[Budget]:
        """Get budget by user, category, and month."""
        return (
            db.query(Budget)
            .filter(
                Budget.user_id == user_id,
                Budget.category == category,
                Budget.month == month
            )
            .first()
        )
    
    def create_for_user(
        self, 
        db: Session, 
        *, 
        obj_in: BudgetCreate, 
        user_id: int
    ) -> Budget:
        """Create budget for specific user."""
        obj_in_data = obj_in.dict()
        obj_in_data["user_id"] = user_id
        db_obj = Budget(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


budget = CRUDBudget(Budget)