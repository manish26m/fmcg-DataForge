"""
DatabricksService – single integration point for all Databricks interactions.

Responsibilities
─────────────────
1. start_job(s3_key)           – Trigger the existing Databricks Workflow Job
2. get_run_status(run_id)      – Poll the Databricks Jobs API for status
3. query_sql(sql)              – Execute read-only SQL against the SQL Warehouse
                                 (used to pull Gold / View data for the dashboard)

When MOCK_MODE=true every method returns realistic stub data so the UI
can be built and tested without a live Databricks workspace.
"""

import logging
import time
import random
from typing import Any

import requests

from app.config import get_settings

logger = logging.getLogger(__name__)


class DatabricksService:
    def __init__(self):
        self.settings = get_settings()
        self._mock = self.settings.mock_databricks if self.settings.mock_databricks is not None else self.settings.mock_mode
        self._base = self.settings.databricks_workspace.rstrip("/")
        self._headers = {
            "Authorization": f"Bearer {self.settings.databricks_token}",
            "Content-Type": "application/json",
        }

    # ─── 1. Job Trigger ───────────────────────────────────────────────────────
    def start_job(self, s3_key: str = "") -> int:
        """
        Trigger the already-existing Databricks Workflow Job.
        The s3_key is passed as a notebook_param so the pipeline knows
        which file to process.
        Returns: run_id (int)
        """
        if self._mock:
            run_id = random.randint(100_000, 999_999)
            logger.info("[MOCK] Databricks job triggered. run_id=%s", run_id)
            return run_id

        payload: dict[str, Any] = {
            "job_id": self.settings.databricks_job_id,
        }
        if s3_key:
            payload["notebook_params"] = {"s3_input_key": s3_key}

        resp = requests.post(
            f"{self._base}/api/2.0/jobs/run-now",
            headers=self._headers,
            json=payload,
            timeout=15,
        )
        resp.raise_for_status()
        run_id: int = resp.json()["run_id"]
        logger.info("Databricks job started. run_id=%s", run_id)
        return run_id

    # ─── 2. Status Polling ────────────────────────────────────────────────────
    def get_run_status(self, run_id: int) -> dict:
        """
        Call GET /api/2.0/jobs/runs/get and return a normalised dict:
        {
            "run_id": int,
            "state": str,          # QUEUED | RUNNING | TERMINATED | …
            "result_state": str,   # SUCCESS | FAILED | … (only when TERMINATED)
            "start_time": int,
            "end_time": int,
        }
        """
        if self._mock:
            return self._mock_status(run_id)

        resp = requests.get(
            f"{self._base}/api/2.0/jobs/runs/get",
            headers=self._headers,
            params={"run_id": run_id},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        state_info = data.get("state", {})
        return {
            "run_id": run_id,
            "state": state_info.get("life_cycle_state", "UNKNOWN"),
            "result_state": state_info.get("result_state"),
            "start_time": data.get("start_time"),
            "end_time": data.get("end_time"),
        }

    # ─── 3. SQL Query ─────────────────────────────────────────────────────────
    def query_sql(self, sql: str) -> list[dict]:
        """
        Execute a SQL statement against the Databricks SQL Warehouse and
        return the result as a list of dicts.

        Integration:  POST /sql/2.0/warehouses/{warehouse_id}/execute
        Auth:         Bearer token (same PAT as Jobs API)
        """
        if self._mock:
            # Caller passes the SQL; we return empty list in mock
            # (each dashboard endpoint builds its own mock data)
            return []

        payload = {
            "warehouse_id": self.settings.databricks_warehouse_id,
            "statement": sql,
            "wait_timeout": "30s",
        }
        resp = requests.post(
            f"{self._base}/api/2.0/sql/statements",
            headers=self._headers,
            json=payload,
            timeout=60,
        )
        resp.raise_for_status()
        result = resp.json()

        # Parse column names + rows into list[dict]
        schema_cols = result.get("manifest", {}).get("schema", {}).get("columns", [])
        col_names = [c["name"] for c in schema_cols]
        rows = result.get("result", {}).get("data_array", [])
        return [dict(zip(col_names, row)) for row in rows]

    # ─── Mock helpers ─────────────────────────────────────────────────────────
    _mock_run_store: dict[int, dict] = {}

    def _mock_status(self, run_id: int) -> dict:
        """Simulate a pipeline that progresses over ~30 seconds."""
        store = DatabricksService._mock_run_store
        if run_id not in store:
            store[run_id] = {"start": time.time(), "state": "QUEUED"}

        elapsed = time.time() - store[run_id]["start"]
        if elapsed < 5:
            state, result = "QUEUED", None
        elif elapsed < 20:
            state, result = "RUNNING", None
        else:
            state, result = "TERMINATED", "SUCCESS"

        store[run_id]["state"] = state
        return {
            "run_id": run_id,
            "state": state,
            "result_state": result,
            "start_time": int(store[run_id]["start"] * 1000),
            "end_time": int(time.time() * 1000) if state == "TERMINATED" else None,
        }
