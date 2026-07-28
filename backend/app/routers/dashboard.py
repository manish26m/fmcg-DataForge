"""
Dashboard endpoints – each one queries a Databricks SQL View and returns JSON.
──────────────────────────────────────────────────────────────────────────────
Integration flow:
  Frontend  →  GET /api/dashboard/<metric>
            →  FastAPI
            →  DatabricksService.query_sql(SQL)
            →  Databricks SQL Warehouse (POST /api/2.0/sql/statements)
            →  SQL View (Gold layer)
            →  JSON rows
            →  Chart data

Views used (must exist in Databricks Gold layer):
  vw_revenue_by_month, vw_revenue_by_category, vw_top_products,
  vw_top_customers, vw_city_revenue, vw_kpis

When MOCK_MODE=true, realistic sample data is returned so the UI can be
developed and demonstrated without a live Databricks connection.
"""

import logging
import random
from fastapi import APIRouter, HTTPException
from app.services.databricks_service import DatabricksService
from app.models.schemas import (
    DashboardKPIs, RevenueByMonth, RevenueByCategory,
    TopProduct, TopCustomer, CityRevenue, DashboardSummary,
)
from app.config import get_settings

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
logger = logging.getLogger(__name__)
db = DatabricksService()
settings = get_settings()


# ─── Embed Token (minted server-side, never exposed in client env) ────────────
@router.get("/embed-token")
async def get_embed_token():
    """Return the Databricks PAT so the browser can initialise the AI/BI dashboard embed."""
    return {"token": settings.databricks_token}


# ─── KPIs ─────────────────────────────────────────────────────────────────────
@router.get("/kpis", response_model=DashboardKPIs)
async def get_kpis():
    if settings.mock_mode:
        return _mock_kpis()
    try:
        rows = db.query_sql("""
            SELECT total_revenue, total_orders, total_customers,
                   total_products, avg_order_value
            FROM vw_kpis LIMIT 1
        """)
        if not rows:
            return _mock_kpis()
        r = rows[0]
        return DashboardKPIs(**{k: float(v) if "revenue" in k or "value" in k else int(v)
                                for k, v in r.items()})
    except Exception as exc:
        logger.error("KPI query failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ─── Revenue by Month ─────────────────────────────────────────────────────────
@router.get("/revenue-by-month", response_model=list[RevenueByMonth])
async def get_revenue_by_month():
    if settings.mock_mode:
        return _mock_revenue_by_month()
    try:
        rows = db.query_sql(
            "SELECT month, revenue FROM vw_revenue_by_month ORDER BY month"
        )
        return [RevenueByMonth(month=r["month"], revenue=float(r["revenue"])) for r in rows]
    except Exception as exc:
        logger.error("Revenue-by-month query failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ─── Revenue by Category ──────────────────────────────────────────────────────
@router.get("/revenue-by-category", response_model=list[RevenueByCategory])
async def get_revenue_by_category():
    if settings.mock_mode:
        return _mock_revenue_by_category()
    try:
        rows = db.query_sql(
            "SELECT category, revenue FROM vw_revenue_by_category ORDER BY revenue DESC"
        )
        return [RevenueByCategory(category=r["category"], revenue=float(r["revenue"])) for r in rows]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ─── Top Products ─────────────────────────────────────────────────────────────
@router.get("/top-products", response_model=list[TopProduct])
async def get_top_products():
    if settings.mock_mode:
        return _mock_top_products()
    try:
        rows = db.query_sql("""
            SELECT product_name, revenue, units_sold
            FROM vw_top_products ORDER BY revenue DESC LIMIT 10
        """)
        return [TopProduct(product_name=r["product_name"],
                           revenue=float(r["revenue"]),
                           units_sold=int(r["units_sold"])) for r in rows]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ─── Top Customers ────────────────────────────────────────────────────────────
@router.get("/top-customers", response_model=list[TopCustomer])
async def get_top_customers():
    if settings.mock_mode:
        return _mock_top_customers()
    try:
        rows = db.query_sql("""
            SELECT customer_name, city, total_spend
            FROM vw_top_customers ORDER BY total_spend DESC LIMIT 10
        """)
        return [TopCustomer(customer_name=r["customer_name"],
                            city=r["city"],
                            total_spend=float(r["total_spend"])) for r in rows]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ─── City Revenue ─────────────────────────────────────────────────────────────
@router.get("/city-revenue", response_model=list[CityRevenue])
async def get_city_revenue():
    if settings.mock_mode:
        return _mock_city_revenue()
    try:
        rows = db.query_sql(
            "SELECT city, revenue FROM vw_city_revenue ORDER BY revenue DESC LIMIT 10"
        )
        return [CityRevenue(city=r["city"], revenue=float(r["revenue"])) for r in rows]
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


# ─── Summary (all-in-one) ─────────────────────────────────────────────────────
@router.get("/summary", response_model=DashboardSummary)
async def get_summary():
    """Convenience endpoint – returns all dashboard data in one call."""
    return DashboardSummary(
        kpis=await get_kpis(),
        revenue_by_month=await get_revenue_by_month(),
        revenue_by_category=await get_revenue_by_category(),
        top_products=await get_top_products(),
        top_customers=await get_top_customers(),
        city_revenue=await get_city_revenue(),
    )


# ─── Mock data ────────────────────────────────────────────────────────────────
def _mock_kpis():
    return DashboardKPIs(
        total_revenue=4_872_340.50,
        total_orders=18_450,
        total_customers=3_210,
        total_products=142,
        avg_order_value=264.07,
    )


def _mock_revenue_by_month():
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    base = [320000, 295000, 410000, 385000, 430000, 465000,
            520000, 498000, 510000, 570000, 615000, 654000]
    return [RevenueByMonth(month=m, revenue=float(v + random.randint(-5000, 5000)))
            for m, v in zip(months, base)]


def _mock_revenue_by_category():
    return [
        RevenueByCategory(category="Beverages", revenue=1_245_000),
        RevenueByCategory(category="Snacks", revenue=987_500),
        RevenueByCategory(category="Dairy", revenue=756_200),
        RevenueByCategory(category="Personal Care", revenue=643_800),
        RevenueByCategory(category="Household", revenue=520_100),
        RevenueByCategory(category="Frozen Foods", revenue=397_400),
    ]


def _mock_top_products():
    products = [
        ("Premium Cola 2L", 312_000, 12_400),
        ("Oat Biscuits 250g", 245_600, 18_900),
        ("Full-Cream Milk 1L", 198_400, 24_300),
        ("Sparkling Water 500ml", 187_200, 31_200),
        ("Energy Bar Pack", 156_900, 14_100),
        ("Shampoo Silk 400ml", 143_200, 9_800),
        ("Frozen Pizza 400g", 138_700, 7_600),
        ("Greek Yogurt 500g", 129_400, 16_400),
        ("Laundry Pods 30ct", 118_000, 6_200),
        ("Granola Bars x6", 107_300, 12_100),
    ]
    return [TopProduct(product_name=p, revenue=float(r), units_sold=u)
            for p, r, u in products]


def _mock_top_customers():
    customers = [
        ("Retail Giant PLC", "London", 487_200),
        ("FreshMart Group", "Manchester", 364_500),
        ("QuickShop Ltd", "Birmingham", 298_100),
        ("Metro Stores", "Leeds", 241_800),
        ("Value Foods UK", "Glasgow", 198_400),
        ("Corner Shop Chain", "Bristol", 167_300),
        ("E-Grocer Direct", "Liverpool", 143_900),
        ("Health Hub Co.", "Edinburgh", 121_000),
        ("Budget Basket", "Cardiff", 98_600),
        ("Local Pantry", "Sheffield", 76_200),
    ]
    return [TopCustomer(customer_name=c, city=ci, total_spend=float(s))
            for c, ci, s in customers]


def _mock_city_revenue():
    return [
        CityRevenue(city="London", revenue=987_000),
        CityRevenue(city="Manchester", revenue=654_000),
        CityRevenue(city="Birmingham", revenue=543_000),
        CityRevenue(city="Leeds", revenue=421_000),
        CityRevenue(city="Glasgow", revenue=387_000),
        CityRevenue(city="Bristol", revenue=312_000),
        CityRevenue(city="Liverpool", revenue=298_000),
        CityRevenue(city="Edinburgh", revenue=243_000),
        CityRevenue(city="Cardiff", revenue=198_000),
        CityRevenue(city="Sheffield", revenue=165_000),
    ]
