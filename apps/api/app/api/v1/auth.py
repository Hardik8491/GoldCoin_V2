"""
Authentication API routes.
"""
import logging
from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token, create_refresh_token, get_current_user
from app.crud import user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import TokenResponse, LoginRequest, RefreshTokenRequest
from app.schemas.user import UserCreate, UserResponse

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """
    Register a new user.
    
    Args:
        user_data: User registration data
        db: Database session
        
    Returns:
        JWT tokens for the new user
        
    Raises:
        HTTPException: If email is already registered
    """
    try:
        # Check if user already exists
        existing_user = user.get_by_email(db, email=user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        db_user = user.create(db, obj_in=user_data)
        logger.info(f"New user registered: {db_user.email}")
        
        # Generate tokens
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(db_user.id)},
            expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(data={"sub": str(db_user.id)})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Login with email and password.
    
    Args:
        login_data: Login credentials
        db: Database session
        
    Returns:
        JWT tokens for authenticated user
        
    Raises:
        HTTPException: If authentication fails
    """
    try:
        # Authenticate user
        db_user = user.authenticate(
            db, email=login_data.email, password=login_data.password
        )
        
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        if not user.is_active(db_user):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        # Generate tokens
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(db_user.id)},
            expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(data={"sub": str(db_user.id)})
        
        logger.info(f"User logged in: {db_user.email}")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/login/form", response_model=TokenResponse)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    
    Args:
        form_data: OAuth2 form data
        db: Database session
        
    Returns:
        JWT tokens for authenticated user
    """
    db_user = user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active(db_user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(db_user.id)}, expires_delta=access_token_expires
    )
    
    return TokenResponse(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Get current user information.
    
    Args:
        current_user: Currently authenticated user
        
    Returns:
        Current user data
    """
    return current_user


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
) -> Any:
    """
    Refresh access token using refresh token.
    
    Args:
        refresh_data: Refresh token data
        db: Database session
        
    Returns:
        New JWT tokens
        
    Raises:
        HTTPException: If refresh token is invalid
    """
    try:
        from app.core.security import verify_token
        
        # Verify refresh token
        payload = verify_token(refresh_data.refresh_token)
        user_id = payload.get("sub")
        token_type = payload.get("type")
        
        if user_id is None or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Get user
        db_user = user.get(db, id=int(user_id))
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if not user.is_active(db_user):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        # Generate new tokens
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(db_user.id)},
            expires_delta=access_token_expires
        )
        new_refresh_token = create_refresh_token(data={"sub": str(db_user.id)})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not refresh token"
        )