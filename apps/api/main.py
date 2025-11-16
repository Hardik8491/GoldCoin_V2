"""
AI Finance Assistant Backend Application

A professional FastAPI backend for personal finance management with AI capabilities.
This module contains the main FastAPI application setup with middleware, routing,
and error handling.
"""

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1 import api_router
from app.core.config import get_settings, setup_logging
from app.db.session import create_tables
from app.middleware.logging import RealTimeLoggingMiddleware

# Initialize logging
setup_logging()
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    
    Args:
        app: FastAPI application instance
    """
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    
    # Create database tables
    try:
        create_tables()
        logger.info("Database tables created/verified successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise
    
    # Initialize Sentry if configured
    if settings.SENTRY_DSN:
        try:
            import sentry_sdk
            from sentry_sdk.integrations.fastapi import FastApiIntegration
            from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
            
            sentry_sdk.init(
                dsn=settings.SENTRY_DSN,
                integrations=[
                    FastApiIntegration(auto_enabling=True),
                    SqlalchemyIntegration(),
                ],
                traces_sample_rate=0.1,
                environment=settings.ENVIRONMENT,
            )
            logger.info("Sentry initialized successfully")
        except Exception as e:
            logger.warning(f"Failed to initialize Sentry: {e}")
    
    yield
    
    # Shutdown
    logger.info(f"Shutting down {settings.APP_NAME}")


def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application.
    
    Returns:
        Configured FastAPI application instance
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="AI-powered personal finance management API",
        version=settings.APP_VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.DEBUG else None,
        docs_url=f"{settings.API_V1_STR}/docs" if settings.DEBUG else None,
        redoc_url=f"{settings.API_V1_STR}/redoc" if settings.DEBUG else None,
        lifespan=lifespan,
    )
    
    # Add security middleware
    if not settings.DEBUG:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=["*"]  # Configure based on your deployment
        )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        max_age=settings.CORS_MAX_AGE,
    )
    
    # Add compression middleware
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # Add real-time logging middleware
    app.add_middleware(RealTimeLoggingMiddleware)
    
    # Add request timing middleware
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response
    
    # Add request logging middleware
    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"from {request.client.host if request.client else 'unknown'}"
        )
        
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(
            f"Response: {response.status_code} "
            f"({process_time:.4f}s)"
        )
        
        return response
    
    # Include API routes
    app.include_router(api_router, prefix=settings.API_V1_STR)
    
    return app


# Create the application instance
app = create_application()


# Exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions."""
    logger.warning(f"HTTP exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors."""
    logger.warning(f"Validation error: {exc.errors()}")
    # Convert validation errors to JSON-serializable format
    errors = []
    for error in exc.errors():
        error_dict = {
            "loc": error.get("loc", []),
            "msg": error.get("msg", ""),
            "type": error.get("type", ""),
        }
        # Convert bytes to string if present
        if "input" in error:
            input_val = error["input"]
            if isinstance(input_val, bytes):
                error_dict["input"] = input_val.decode("utf-8", errors="replace")
            else:
                error_dict["input"] = str(input_val)
        errors.append(error_dict)
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": errors
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    if settings.DEBUG:
        return JSONResponse(
            status_code=500,
            content={
                "detail": f"Internal server error: {str(exc)}",
                "type": type(exc).__name__
            }
        )
    else:
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )


# Health check endpoints
@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        Health status information
    """
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }


@app.get("/")
async def root():
    """
    Root endpoint with basic application information.
    
    Returns:
        Application information
    """
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "docs_url": f"{settings.API_V1_STR}/docs" if settings.DEBUG else None,
        "health_check": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
