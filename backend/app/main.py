"""
DataForge – FastAPI Application Entry Point
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import upload, pipeline, dashboard

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s – %(message)s",
)

settings = get_settings()

app = FastAPI(
    title="DataForge API",
    description=(
        "Presentation & integration layer for the FMCG Medallion Architecture "
        "pipeline running in Databricks. "
        "Handles CSV upload → S3 → Databricks job trigger → dashboard data retrieval."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(upload.router)
app.include_router(pipeline.router)
app.include_router(dashboard.router)


# ─── Health check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health():
    return {
        "status": "ok",
        "mock_mode": settings.mock_mode,
        "version": "1.0.0",
    }
