"""
Logging utilities and configuration.
"""
import logging
import logging.handlers
import os
from typing import Optional

from app.core.config import get_settings

settings = get_settings()


def get_logger(name: str, level: Optional[str] = None) -> logging.Logger:
    """
    Get a configured logger instance.
    
    Args:
        name: Logger name (usually __name__)
        level: Optional logging level override
        
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    
    if level:
        logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    
    return logger


def setup_file_logging(
    log_file: str,
    max_bytes: int = 10485760,  # 10MB
    backup_count: int = 10,
    level: str = "INFO"
) -> logging.Handler:
    """
    Set up rotating file logging handler.
    
    Args:
        log_file: Path to log file
        max_bytes: Maximum size before rotation
        backup_count: Number of backup files to keep
        level: Logging level
        
    Returns:
        Configured file handler
    """
    # Create directory if it doesn't exist
    log_dir = os.path.dirname(log_file)
    if log_dir:
        os.makedirs(log_dir, exist_ok=True)
    
    # Create rotating file handler
    handler = logging.handlers.RotatingFileHandler(
        log_file,
        maxBytes=max_bytes,
        backupCount=backup_count
    )
    
    # Set format
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    handler.setLevel(getattr(logging, level.upper(), logging.INFO))
    
    return handler