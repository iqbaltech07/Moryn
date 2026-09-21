import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.config import get_settings
from app.routers.health import router as health_router
from app.routers.generate import router as generate_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("moryn.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info(f"Starting {settings.APP_NAME}...")
    logger.info(f"Loaded {len(settings.gemini_keys)} Gemini API keys.")
    logger.info(f"Default model: {settings.DEFAULT_GEMINI_MODEL}")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}...")

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Dedicated AI Generation and Agentic Engine for Moryn",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS Configuration for Next.js BFF & Local Dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "VALIDATION_ERROR",
            "message": "Payload does not match required schema.",
            "detail": exc.errors(),
        },
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "INTERNAL_SERVER_ERROR",
            "message": str(exc),
        },
    )

# Include Routers (support both /api/v1 and direct routes)
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(health_router, prefix="")
app.include_router(generate_router, prefix=settings.API_V1_STR)
app.include_router(generate_router, prefix="")

# Root ping
@app.get("/")
async def root():
    return {
        "service": settings.APP_NAME,
        "status": "healthy",
        "docs": "/docs",
    }
