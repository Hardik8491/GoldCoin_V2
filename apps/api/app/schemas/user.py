"""
User schemas for API requests and responses.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8, description="Password must be at least 8 characters")
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """Schema for user API responses."""
    id: int
    is_onboarded: Optional[bool] = False
    currency: Optional[str] = "USD"
    theme: Optional[str] = "system"
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserInDB(UserBase):
    """Schema for user data stored in database."""
    id: int
    hashed_password: str
    is_superuser: bool = False
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True