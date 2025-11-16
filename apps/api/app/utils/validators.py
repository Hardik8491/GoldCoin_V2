"""
Validation utilities for data validation.
"""
import re
from datetime import datetime
from typing import Optional


def validate_email(email: str) -> bool:
    """
    Validate email address format.
    
    Args:
        email: Email address to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not email or not isinstance(email, str):
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password: str, min_length: int = 8) -> tuple[bool, list[str]]:
    """
    Validate password strength.
    
    Args:
        password: Password to validate
        min_length: Minimum password length
        
    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []
    
    if not password or not isinstance(password, str):
        errors.append("Password is required")
        return False, errors
    
    if len(password) < min_length:
        errors.append(f"Password must be at least {min_length} characters long")
    
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")
    
    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")
    
    if not re.search(r'\d', password):
        errors.append("Password must contain at least one digit")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append("Password must contain at least one special character")
    
    return len(errors) == 0, errors


def validate_date_range(start_date: datetime, end_date: datetime) -> bool:
    """
    Validate date range.
    
    Args:
        start_date: Start date
        end_date: End date
        
    Returns:
        True if valid range, False otherwise
    """
    if not start_date or not end_date:
        return False
    
    return start_date <= end_date


def validate_month_format(month: str) -> bool:
    """
    Validate month format (YYYY-MM).
    
    Args:
        month: Month string to validate
        
    Returns:
        True if valid format, False otherwise
    """
    if not month or not isinstance(month, str):
        return False
    
    pattern = r'^\d{4}-\d{2}$'
    if not re.match(pattern, month):
        return False
    
    try:
        year, month_num = month.split('-')
        year = int(year)
        month_num = int(month_num)
        
        # Validate ranges
        if year < 2000 or year > 2100:
            return False
        if month_num < 1 or month_num > 12:
            return False
        
        return True
    except (ValueError, IndexError):
        return False


def validate_amount(amount: float, min_value: float = 0.01) -> bool:
    """
    Validate monetary amount.
    
    Args:
        amount: Amount to validate
        min_value: Minimum allowed value
        
    Returns:
        True if valid, False otherwise
    """
    if amount is None:
        return False
    
    try:
        amount = float(amount)
        return amount >= min_value
    except (ValueError, TypeError):
        return False