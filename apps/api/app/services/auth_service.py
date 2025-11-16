"""
Authentication service layer.
"""
import logging
from datetime import timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token, create_refresh_token, authenticate_user
from app.crud import user
from app.models.user import User
from app.schemas.auth import TokenResponse
from app.schemas.user import UserCreate

logger = logging.getLogger(__name__)
settings = get_settings()


class AuthService:
    """Authentication service for handling user registration and login."""
    
    def __init__(self):
        self.settings = settings
    
    async def register_user(self, db: Session, user_data: UserCreate) -> tuple[User, TokenResponse]:
        """
        Register a new user and return user with tokens.
        
        Args:
            db: Database session
            user_data: User registration data
            
        Returns:
            Tuple of created user and token response
            
        Raises:
            ValueError: If email is already registered
        """
        # Check if user already exists
        existing_user = user.get_by_email(db, email=user_data.email)
        if existing_user:
            raise ValueError("Email already registered")
        
        # Create new user
        db_user = user.create(db, obj_in=user_data)
        logger.info(f"New user registered: {db_user.email}")
        
        # Generate tokens
        tokens = await self._generate_tokens(db_user)
        
        return db_user, tokens
    
    async def login_user(self, db: Session, email: str, password: str) -> tuple[User, TokenResponse]:
        """
        Authenticate user and return user with tokens.
        
        Args:
            db: Database session
            email: User email
            password: User password
            
        Returns:
            Tuple of authenticated user and token response
            
        Raises:
            ValueError: If authentication fails
        """
        # Authenticate user
        db_user = authenticate_user(email, password, db)
        
        if not db_user:
            raise ValueError("Invalid email or password")
        
        if not user.is_active(db_user):
            raise ValueError("User account is inactive")
        
        # Generate tokens
        tokens = await self._generate_tokens(db_user)
        
        logger.info(f"User logged in: {db_user.email}")
        return db_user, tokens
    
    async def refresh_user_token(self, db: Session, user_id: int) -> TokenResponse:
        """
        Generate new tokens for user.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            New token response
            
        Raises:
            ValueError: If user not found or inactive
        """
        # Get user
        db_user = user.get(db, id=user_id)
        if not db_user:
            raise ValueError("User not found")
        
        if not user.is_active(db_user):
            raise ValueError("User account is inactive")
        
        # Generate new tokens
        tokens = await self._generate_tokens(db_user)
        
        logger.info(f"Tokens refreshed for user: {db_user.email}")
        return tokens
    
    async def _generate_tokens(self, user_obj: User) -> TokenResponse:
        """
        Generate access and refresh tokens for user.
        
        Args:
            user_obj: User object
            
        Returns:
            Token response with access and refresh tokens
        """
        # Generate access token
        access_token_expires = timedelta(minutes=self.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user_obj.id)},
            expires_delta=access_token_expires
        )
        
        # Generate refresh token
        refresh_token = create_refresh_token(data={"sub": str(user_obj.id)})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )