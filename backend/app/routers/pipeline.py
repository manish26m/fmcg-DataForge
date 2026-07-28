"""
Pipeline monitoring endpoints
──────────────────────────────
POST /api/pipeline/trigger        – Manually re-trigger the job
GET  /api/pipeline/status/{run_id} – Poll Databricks for the run status

The frontend polls /status every 5 s until state == TERMINATED.
"""

import logging
from fastapi import APIRouter, HTTPException

from app.services.databricks_service import DatabricksService
from app.models.schemas import (
    TriggerRequest, TriggerResponse,
    PipelineStatusResponse, StageStatus,
)

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])
logger = logging.getLogger(__name__)

db = DatabricksService()


@router.post("/trigger", response_model=TriggerResponse)
async def trigger_pipeline(body: TriggerRequest = TriggerRequest()):
    """Manually trigger the existing Databricks Workflow."""
    try:
        run_id = db.start_job(s3_key=body.s3_key or "")
    except Exception as exc:  # noqa: BLE001
        logger.error("Pipeline trigger failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return TriggerResponse(
        success=True,
        run_id=run_id,
        message=f"Databricks job triggered successfully (run_id={run_id}).",
    )


@router.get("/status/{run_id}", response_model=PipelineStatusResponse)
async def get_pipeline_status(run_id: int):
    """
    Poll the Databricks Jobs API for the run's current state.
    Returns normalised stage-level statuses inferred from the lifecycle state.
    """
    try:
        status = db.get_run_status(run_id)
    except Exception as exc:  # noqa: BLE001
        logger.error("Status poll failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    stages = _infer_stages(status["state"], status.get("result_state"))

    start = status.get("start_time")
    end = status.get("end_time")
    duration = (end - start) if (start and end) else None

    return PipelineStatusResponse(
        run_id=run_id,
        state=status["state"],
        result_state=status.get("result_state"),
        start_time=start,
        end_time=end,
        duration_ms=duration,
        stages=stages,
    )


# ─── Helpers ──────────────────────────────────────────────────────────────────
def _infer_stages(state: str, result_state: str | None) -> list[StageStatus]:
    """
    Databricks doesn't expose individual notebook-task statuses through a simple
    endpoint (that requires iterating tasks).  We infer a visual-only progress
    sequence from the overall lifecycle state.
    """
    stage_names = ["Bronze", "Silver", "Gold", "SQL Views", "Dashboard"]

    if state == "QUEUED":
        return [StageStatus(name=n, status="pending") for n in stage_names]

    if state == "RUNNING":
        # Show first two complete, third running, rest pending
        statuses = ["success", "success", "running", "pending", "pending"]
        return [StageStatus(name=n, status=s) for n, s in zip(stage_names, statuses)]

    if state == "TERMINATED":
        final = "success" if result_state == "SUCCESS" else "failed"
        statuses = [final] * len(stage_names)
        if final == "failed":
            statuses = ["success", "success", "failed", "pending", "pending"]
        return [StageStatus(name=n, status=s) for n, s in zip(stage_names, statuses)]

    return [StageStatus(name=n, status="pending") for n in stage_names]
