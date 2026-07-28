"""
S3Service – uploads CSV files to the existing AWS S3 bucket.
When MOCK_MODE=true it simulates the upload so the UI can be tested
without real AWS credentials.
"""

import io
import logging
from datetime import datetime

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.config import get_settings

logger = logging.getLogger(__name__)


class S3Service:
    def __init__(self):
        self.settings = get_settings()
        self._mock = self.settings.mock_s3 if self.settings.mock_s3 is not None else self.settings.mock_mode

        if not self._mock:
            self._client = boto3.client(
                "s3",
                aws_access_key_id=self.settings.aws_access_key_id,
                aws_secret_access_key=self.settings.aws_secret_access_key,
                region_name=self.settings.aws_default_region,
            )

    # ─── Public API ───────────────────────────────────────────────────────────
    def upload_file(self, file_data: bytes, original_filename: str) -> str:
        """
        Upload a file to S3 under incoming/<category>/<timestamp>_<filename>.
        Returns the S3 object key.
        """
        key = self._build_key(original_filename)

        if self._mock:
            logger.info("[MOCK] Would upload '%s' to s3://%s/%s",
                        original_filename, self.settings.s3_bucket, key)
            return key

        try:
            self._client.upload_fileobj(
                io.BytesIO(file_data),
                self.settings.s3_bucket,
                key,
                ExtraArgs={"ContentType": "text/csv"},
            )
            logger.info("Uploaded '%s' to s3://%s/%s",
                        original_filename, self.settings.s3_bucket, key)
            return key
        except (BotoCoreError, ClientError) as exc:
            logger.error("S3 upload failed: %s", exc)
            raise RuntimeError(f"S3 upload failed: {exc}") from exc

    def list_recent_uploads(self, prefix: str = "orders/landing/", limit: int = 20) -> list[dict]:
        """Return the most recent objects in the bucket."""
        if self._mock:
            return [
                {"key": "orders/landing/20250725_082900_sample_orders.csv", "size": 2048,
                 "last_modified": datetime.utcnow().isoformat()},
            ]

        resp = self._client.list_objects_v2(
            Bucket=self.settings.s3_bucket, Prefix=prefix, MaxKeys=limit
        )
        return [
            {"key": obj["Key"], "size": obj["Size"],
             "last_modified": obj["LastModified"].isoformat()}
            for obj in resp.get("Contents", [])
        ]

    # ─── Helpers ──────────────────────────────────────────────────────────────
    @staticmethod
    def _build_key(filename: str) -> str:
        """
        All raw CSVs land in  orders/landing/<timestamp>_<filename>
        matching the actual sportsbar-db-26 bucket structure.
        """
        ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        return f"orders/landing/{ts}_{filename}"
