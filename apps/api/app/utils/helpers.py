"""
Helper utilities and miscellaneous functions.
"""
import uuid
import re
from datetime import datetime
from typing import Optional


def generate_unique_id() -> str:
    """
    Generate a unique identifier.
    
    Returns:
        UUID string
    """
    return str(uuid.uuid4())


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename by removing special characters.
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename
    """
    # Remove special characters
    filename = re.sub(r'[^\w\s.-]', '', filename)
    # Replace spaces with underscores
    filename = re.sub(r'\s+', '_', filename)
    # Remove leading/trailing underscores
    filename = filename.strip('_')
    
    return filename


def calculate_age(birth_date: datetime) -> int:
    """
    Calculate age from birth date.
    
    Args:
        birth_date: Birth date
        
    Returns:
        Age in years
    """
    today = datetime.now()
    age = today.year - birth_date.year
    
    # Adjust if birthday hasn't occurred this year
    if (today.month, today.day) < (birth_date.month, birth_date.day):
        age -= 1
    
    return age


def truncate_string(text: str, max_length: int = 50, suffix: str = "...") -> str:
    """
    Truncate string to maximum length.
    
    Args:
        text: Text to truncate
        max_length: Maximum length
        suffix: Suffix to add when truncated
        
    Returns:
        Truncated string
    """
    if not text or len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def parse_month_string(month_str: str) -> Optional[tuple[int, int]]:
    """
    Parse month string (YYYY-MM) to year and month integers.
    
    Args:
        month_str: Month string in YYYY-MM format
        
    Returns:
        Tuple of (year, month) or None if invalid
    """
    try:
        parts = month_str.split('-')
        if len(parts) != 2:
            return None
        
        year = int(parts[0])
        month = int(parts[1])
        
        if month < 1 or month > 12:
            return None
        
        return (year, month)
    except (ValueError, IndexError):
        return None