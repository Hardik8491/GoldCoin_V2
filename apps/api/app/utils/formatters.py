"""
Formatting utilities for display and output.
"""
from datetime import datetime
from typing import Optional


def format_currency(amount: float, currency: str = "USD", locale: str = "en_US") -> str:
    """
    Format amount as currency.
    
    Args:
        amount: Amount to format
        currency: Currency code
        locale: Locale for formatting
        
    Returns:
        Formatted currency string
    """
    if currency == "USD":
        return f"${amount:,.2f}"
    elif currency == "EUR":
        return f"€{amount:,.2f}"
    elif currency == "GBP":
        return f"£{amount:,.2f}"
    else:
        return f"{currency} {amount:,.2f}"


def format_percentage(value: float, decimal_places: int = 2) -> str:
    """
    Format value as percentage.
    
    Args:
        value: Value to format (0-1 or 0-100)
        decimal_places: Number of decimal places
        
    Returns:
        Formatted percentage string
    """
    if value <= 1:
        value = value * 100
    return f"{value:.{decimal_places}f}%"


def format_date(date: datetime, format_string: str = "%Y-%m-%d") -> str:
    """
    Format datetime object as string.
    
    Args:
        date: Datetime to format
        format_string: Format string
        
    Returns:
        Formatted date string
    """
    if not date:
        return ""
    return date.strftime(format_string)


def format_month(year: int, month: int) -> str:
    """
    Format month as YYYY-MM string.
    
    Args:
        year: Year
        month: Month (1-12)
        
    Returns:
        Formatted month string
    """
    return f"{year:04d}-{month:02d}"