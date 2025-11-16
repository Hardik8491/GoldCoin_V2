"""
Prediction CRUD operations.
"""
from typing import List, Optional
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.prediction import SpendingPrediction
from app.schemas.prediction import PredictionResponse


class CRUDPrediction(CRUDBase[SpendingPrediction, None, None]):
    """CRUD operations for SpendingPrediction model."""
    
    def get_by_user(
        self, 
        db: Session, 
        *, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[SpendingPrediction]:
        """Get predictions by user ID."""
        return (
            db.query(SpendingPrediction)
            .filter(SpendingPrediction.user_id == user_id)
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
    ) -> List[SpendingPrediction]:
        """Get predictions by user ID and month."""
        return (
            db.query(SpendingPrediction)
            .filter(
                SpendingPrediction.user_id == user_id,
                SpendingPrediction.month == month
            )
            .all()
        )
    
    def create_prediction(
        self,
        db: Session,
        *,
        user_id: int,
        category: str,
        predicted_amount: float,
        confidence_score: float,
        month: str,
        model_version: Optional[str] = None
    ) -> SpendingPrediction:
        """Create a new spending prediction."""
        db_obj = SpendingPrediction(
            user_id=user_id,
            category=category,
            predicted_amount=predicted_amount,
            confidence_score=confidence_score,
            month=month,
            model_version=model_version
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_latest_by_user_and_category(
        self,
        db: Session,
        *,
        user_id: int,
        category: str
    ) -> SpendingPrediction:
        """Get latest prediction for user and category."""
        return (
            db.query(SpendingPrediction)
            .filter(
                SpendingPrediction.user_id == user_id,
                SpendingPrediction.category == category
            )
            .order_by(SpendingPrediction.created_at.desc())
            .first()
        )


prediction = CRUDPrediction(SpendingPrediction)