from pydantic import BaseModel
from typing import Optional, Any


# ─── Upload ───────────────────────────────────────────────────────────────────
class UploadResponse(BaseModel):
    success: bool
    s3_key: str
    run_id: Optional[int] = None
    message: str


# ─── Pipeline ─────────────────────────────────────────────────────────────────
class TriggerRequest(BaseModel):
    s3_key: Optional[str] = None


class TriggerResponse(BaseModel):
    success: bool
    run_id: int
    message: str


class StageStatus(BaseModel):
    name: str
    status: str  # "pending" | "running" | "success" | "failed"


class PipelineStatusResponse(BaseModel):
    run_id: int
    state: str          # QUEUED | RUNNING | TERMINATED | SKIPPED | INTERNAL_ERROR
    result_state: Optional[str] = None  # SUCCESS | FAILED | TIMEDOUT | CANCELED
    start_time: Optional[int] = None
    end_time: Optional[int] = None
    duration_ms: Optional[int] = None
    stages: list[StageStatus] = []


# ─── Dashboard ────────────────────────────────────────────────────────────────
class MetricValue(BaseModel):
    label: str
    value: Any


class DashboardKPIs(BaseModel):
    total_revenue: float
    total_orders: int
    total_customers: int
    total_products: int
    avg_order_value: float


class RevenueByMonth(BaseModel):
    month: str
    revenue: float


class RevenueByCategory(BaseModel):
    category: str
    revenue: float


class TopProduct(BaseModel):
    product_name: str
    revenue: float
    units_sold: int


class TopCustomer(BaseModel):
    customer_name: str
    city: str
    total_spend: float


class CityRevenue(BaseModel):
    city: str
    revenue: float


class DashboardSummary(BaseModel):
    kpis: DashboardKPIs
    revenue_by_month: list[RevenueByMonth]
    revenue_by_category: list[RevenueByCategory]
    top_products: list[TopProduct]
    top_customers: list[TopCustomer]
    city_revenue: list[CityRevenue]
