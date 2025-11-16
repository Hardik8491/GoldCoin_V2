"""
Real-time Logs API
Provides endpoints for accessing real-time application logs
"""

import logging
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json
import asyncio

from app.core.security import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.middleware.logging import get_recent_logs, clear_log_buffer, StructuredLogger

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/recent")
async def get_recent_logs_endpoint(
    limit: int = Query(100, ge=1, le=1000, description="Number of log entries to return"),
    log_type: Optional[str] = Query(None, description="Filter by log type (request, response, error, event)"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get recent application logs.
    
    Args:
        limit: Number of log entries to return
        log_type: Optional filter by log type
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        List of recent log entries
    """
    try:
        logs = get_recent_logs(limit=limit)
        
        # Filter by type if specified
        if log_type:
            logs = [log for log in logs if log.get("type") == log_type]
        
        return {
            "logs": logs,
            "count": len(logs),
            "total_available": len(get_recent_logs(limit=10000)),
        }
    except Exception as e:
        logger.error(f"Error fetching logs: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch logs"
        )


@router.get("/stream")
async def stream_logs(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Stream real-time logs using Server-Sent Events (SSE).
    
    Args:
        current_user: Currently authenticated user
        
    Returns:
        StreamingResponse with SSE format
    """
    async def event_generator():
        """Generate SSE events for log streaming."""
        last_count = 0
        
        while True:
            try:
                # Get new logs
                logs = get_recent_logs(limit=1000)
                new_logs = logs[last_count:]
                
                if new_logs:
                    for log_entry in new_logs:
                        yield f"data: {json.dumps(log_entry)}\n\n"
                    last_count = len(logs)
                
                # Wait before next check
                await asyncio.sleep(1)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in log stream: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
                await asyncio.sleep(5)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.post("/clear")
async def clear_logs(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Clear the log buffer.
    Requires authentication.
    
    Args:
        current_user: Currently authenticated user
        
    Returns:
        Success message
    """
    try:
        clear_log_buffer()
        StructuredLogger.log_event(
            event_type="logs_cleared",
            message=f"Log buffer cleared by user {current_user.id}",
            user_id=current_user.id,
        )
        return {"message": "Log buffer cleared successfully"}
    except Exception as e:
        logger.error(f"Error clearing logs: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to clear logs"
        )


@router.get("/stats")
async def get_log_stats(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Get log statistics.
    
    Args:
        current_user: Currently authenticated user
        
    Returns:
        Log statistics
    """
    try:
        logs = get_recent_logs(limit=10000)
        
        # Calculate statistics
        stats = {
            "total_logs": len(logs),
            "by_type": {},
            "by_status": {},
            "error_count": 0,
            "avg_response_time": 0,
        }
        
        response_times = []
        
        for log in logs:
            log_type = log.get("type", "unknown")
            stats["by_type"][log_type] = stats["by_type"].get(log_type, 0) + 1
            
            if log_type == "error":
                stats["error_count"] += 1
            
            if log_type == "response":
                status_code = log.get("status_code", 0)
                stats["by_status"][status_code] = stats["by_status"].get(status_code, 0) + 1
                
                process_time = log.get("process_time_ms", 0)
                if process_time > 0:
                    response_times.append(process_time)
        
        if response_times:
            stats["avg_response_time"] = round(sum(response_times) / len(response_times), 2)
        
        return stats
        
    except Exception as e:
        logger.error(f"Error calculating log stats: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate log statistics"
        )

