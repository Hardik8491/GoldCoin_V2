"""
User management API routes.
"""
import logging
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, get_current_active_user
from app.crud import user
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get current user profile.
    
    Args:
        current_user: Currently authenticated user
        
    Returns:
        Current user profile data
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Update current user profile.
    
    Args:
        user_update: User update data
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        Updated user profile data
        
    Raises:
        HTTPException: If email is already taken by another user
    """
    try:
        # Check if email is being changed to an existing email
        if user_update.email and user_update.email != current_user.email:
            existing_user = user.get_by_email(db, email=user_update.email)
            if existing_user and existing_user.id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Update user
        updated_user = user.update(db, db_obj=current_user, obj_in=user_update)
        logger.info(f"User profile updated: {updated_user.email}")
        
        return updated_user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"User update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile"
        )


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> None:
    """
    Delete current user account.
    
    Args:
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        None (204 No Content)
    """
    try:
        user.remove(db, id=current_user.id)
        logger.info(f"User account deleted: {current_user.email}")
        
        return None
        
    except Exception as e:
        logger.error(f"User deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user account"
        )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get user by ID (admin only or self).
    
    Args:
        user_id: User ID to retrieve
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        User profile data
        
    Raises:
        HTTPException: If user not found or access denied
    """
    # Allow users to access their own profile or require superuser for others
    if user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_user = user.get(db, id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return db_user