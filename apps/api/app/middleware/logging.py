"""
Real-time Logging Middleware
Provides structured logging with real-time log streaming capabilities
"""

import logging
import json
import time
from datetime import datetime
from typing import Callable, Dict, Any
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import StreamingResponse
from app.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# In-memory log buffer for real-time streaming (in production, use Redis or similar)
log_buffer: list[Dict[str, Any]] = []
MAX_BUFFER_SIZE = 1000


class RealTimeLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for real-time request/response logging.
    Logs all API requests and responses with timing information.
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Log request
        request_id = f"{int(time.time() * 1000)}-{id(request)}"
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": request_id,
            "method": request.method,
            "path": str(request.url.path),
            "query_params": dict(request.query_params),
            "client_ip": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent"),
            "type": "request",
        }
        
        # Add to buffer
        add_to_log_buffer(log_entry)
        
        # Log request details
        logger.info(
            f"Request: {request.method} {request.url.path}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "query_params": dict(request.query_params),
            }
        )
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Log response
            response_log = {
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": request_id,
                "status_code": response.status_code,
                "process_time_ms": round(process_time * 1000, 2),
                "type": "response",
            }
            
            # Add to buffer
            add_to_log_buffer(response_log)
            
            # Add X-Process-Time header
            response.headers["X-Process-Time"] = str(round(process_time * 1000, 2))
            response.headers["X-Request-ID"] = request_id
            
            # Log response details
            logger.info(
                f"Response: {request.method} {request.url.path} - {response.status_code} ({process_time*1000:.2f}ms)",
                extra={
                    "request_id": request_id,
                    "status_code": response.status_code,
                    "process_time_ms": round(process_time * 1000, 2),
                }
            )
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            
            # Log error
            error_log = {
                "timestamp": datetime.utcnow().isoformat(),
                "request_id": request_id,
                "error": str(e),
                "error_type": type(e).__name__,
                "process_time_ms": round(process_time * 1000, 2),
                "type": "error",
            }
            
            add_to_log_buffer(error_log)
            
            logger.error(
                f"Error: {request.method} {request.url.path} - {str(e)}",
                exc_info=True,
                extra={
                    "request_id": request_id,
                    "error": str(e),
                    "error_type": type(e).__name__,
                }
            )
            
            raise


def add_to_log_buffer(log_entry: Dict[str, Any]) -> None:
    """Add log entry to buffer, maintaining max size."""
    global log_buffer
    log_buffer.append(log_entry)
    
    # Keep buffer size manageable
    if len(log_buffer) > MAX_BUFFER_SIZE:
        log_buffer = log_buffer[-MAX_BUFFER_SIZE:]


def get_recent_logs(limit: int = 100) -> list[Dict[str, Any]]:
    """Get recent log entries."""
    return log_buffer[-limit:]


def clear_log_buffer() -> None:
    """Clear the log buffer."""
    global log_buffer
    log_buffer = []


class StructuredLogger:
    """
    Structured logger for application events.
    """
    
    @staticmethod
    def log_event(
        event_type: str,
        message: str,
        user_id: int = None,
        metadata: Dict[str, Any] = None,
        level: str = "INFO"
    ) -> None:
        """
        Log a structured event.
        
        Args:
            event_type: Type of event (e.g., "user_login", "expense_created")
            message: Human-readable message
            user_id: Optional user ID
            metadata: Additional metadata
            level: Log level (INFO, WARNING, ERROR, etc.)
        """
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "message": message,
            "user_id": user_id,
            "metadata": metadata or {},
            "level": level,
            "type": "event",
        }
        
        add_to_log_buffer(log_entry)
        
        log_method = getattr(logger, level.lower(), logger.info)
        log_method(
            f"[{event_type}] {message}",
            extra={
                "event_type": event_type,
                "user_id": user_id,
                "metadata": metadata,
            }
        )

