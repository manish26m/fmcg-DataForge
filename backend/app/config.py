from typing import Optional
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # AWS
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_default_region: str = "us-east-1"
    s3_bucket: str = "dataforge-incoming"

    # Databricks
    databricks_workspace: str = ""
    databricks_token: str = ""
    databricks_job_id: int = 0
    databricks_warehouse_id: str = ""
    databricks_workspace_id: str = ""
    databricks_dashboard_id: str = ""

    # App
    mock_mode: bool = False
    mock_s3: Optional[bool] = None
    mock_databricks: Optional[bool] = None
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
