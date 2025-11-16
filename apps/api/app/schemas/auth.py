"""
Authentication schemas for API requests and responses.
"""
from typing import Optional
from pydantic import BaseModel


class TokenData(BaseModel):
    """Schema for token data."""
    user_id: Optional[int] = None


class TokenResponse(BaseModel):
    """Schema for authentication token responses."""
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    """Schema for login requests."""
    email: str
    password: str


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token requests."""
    refresh_token: str