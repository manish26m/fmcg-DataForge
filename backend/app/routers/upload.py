"""
POST /api/upload
─────────────────
1. Accept CSV via multipart/form-data
2. Upload bytes → S3 via S3Service
3. Trigger Databricks job → DatabricksService.start_job()
4. Return { success, s3_key, run_id, message }
"""

import logging
from fastapi import APIRouter, File, UploadFile, HTTPException

from app.services.s3_service import S3Service
from app.services.databricks_service import DatabricksService
from app.models.schemas import UploadResponse

router = APIRouter(prefix="/api", tags=["upload"])
logger = logging.getLogger(__name__)

s3 = S3Service()
db = DatabricksService()


@router.post("/upload", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    """Upload a CSV to S3 and immediately trigger the Databricks pipeline."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are accepted.")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        s3_key = s3.upload_file(contents, file.filename)
    except RuntimeError as exc:
        logger.error("S3 upload failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    try:
        run_id = db.start_job(s3_key=s3_key)
    except Exception as exc:  # noqa: BLE001
        logger.error("Databricks trigger failed: %s", exc)
        raise HTTPException(status_code=502,
                            detail=f"File uploaded to S3 but pipeline trigger failed: {exc}") from exc

    return UploadResponse(
        success=True,
        s3_key=s3_key,
        run_id=run_id,
        message=f"File uploaded to S3 and Databricks job started (run_id={run_id}).",
    )
