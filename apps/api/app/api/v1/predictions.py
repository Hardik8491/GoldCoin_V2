"""
Predictions API routes.
"""
import logging
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_active_user
from app.crud import prediction
from app.db.session import get_db
from app.models.user import User
from app.schemas.prediction import PredictionResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=List[PredictionResponse])
async def get_predictions(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    month: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}$", description="Filter by month (YYYY-MM)"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get user's spending predictions with optional filtering.
    
    Args:
        skip: Number of records to skip
        limit: Number of records to return
        month: Optional month filter (YYYY-MM format)
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        List of user's predictions
    """
    try:
        if month:
            predictions = prediction.get_by_user_and_month(
                db, 
                user_id=current_user.id, 
                month=month
            )
        else:
            predictions = prediction.get_by_user(
                db, 
                user_id=current_user.id, 
                skip=skip, 
                limit=limit
            )
        
        return predictions
        
    except Exception as e:
        logger.error(f"Error fetching predictions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch predictions"
        )


@router.get("/{prediction_id}", response_model=PredictionResponse)
async def get_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get a specific prediction by ID.
    
    Args:
        prediction_id: Prediction ID
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        Prediction data
        
    Raises:
        HTTPException: If prediction not found or access denied
    """
    db_prediction = prediction.get(db, id=prediction_id)
    
    if not db_prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    if db_prediction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return db_prediction


@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> None:
    """
    Delete a prediction.
    
    Args:
        prediction_id: Prediction ID
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        None (204 No Content)
        
    Raises:
        HTTPException: If prediction not found or access denied
    """
    db_prediction = prediction.get(db, id=prediction_id)
    
    if not db_prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    if db_prediction.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        prediction.remove(db, id=prediction_id)
        logger.info(f"Prediction deleted: {prediction_id} by user {current_user.id}")
        
    except Exception as e:
        logger.error(f"Error deleting prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete prediction"
        )