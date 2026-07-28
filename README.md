# DataForge – Enterprise Data Lakehouse Platform

> The professional web interface for the **FMCG Medallion Architecture** pipeline running on Databricks.

---

## What This Project Does

The Databricks ETL pipeline (Bronze → Silver → Gold → SQL Views) already exists and is fully operational.

**DataForge** provides the web interface on top of it:

| Step | What Happens |
|------|-------------|
| 1 | User uploads a CSV through the website |
| 2 | Backend uploads the file to AWS S3 (`incoming/` folder) |
| 3 | Backend triggers the existing Databricks Workflow via the Jobs API |
| 4 | Frontend polls pipeline status every 5 seconds |
| 5 | When the job completes, the dashboard auto-refreshes with live data from Databricks SQL Views |

---

## Project Structure

```
fmcg-DataForge/
├── backend/                  # FastAPI REST API
│   ├── app/
│   │   ├── main.py           # FastAPI factory
│   │   ├── config.py         # Pydantic settings from .env
│   │   ├── models/schemas.py # Request / response schemas
│   │   ├── routers/
│   │   │   ├── upload.py     # POST /api/upload
│   │   │   ├── pipeline.py   # GET/POST /api/pipeline/*
│   │   │   └── dashboard.py  # GET /api/dashboard/*
│   │   └── services/
│   │       ├── s3_service.py           # boto3 wrapper
│   │       └── databricks_service.py  # Jobs API + SQL API
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/                 # Next.js TypeScript app
│   ├── src/
│   │   ├── pages/            # index, upload, monitor, dashboard, architecture, docs
│   │   ├── components/       # Sidebar, AppLayout, MetricCard, StatusBadge
│   │   ├── hooks/            # usePolling
│   │   ├── lib/api.ts        # Axios API client
│   │   └── styles/globals.css
│   ├── tailwind.config.ts
│   ├── next.config.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Quick Start (Local Development)

### 1. Configure backend

```bash
cd backend
cp .env.example .env
# Edit .env with your AWS + Databricks credentials
# Set MOCK_MODE=true to run without real credentials
```

### 2. Run backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# API: http://localhost:8000
# Swagger: http://localhost:8000/docs
```

### 3. Run frontend

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
# Frontend: http://localhost:3000
```

### 4. Docker (both services)

```bash
cp backend/.env.example backend/.env
# fill in credentials (or keep MOCK_MODE=true)
docker-compose up --build
```

---

## How the Frontend Gets Dashboard Data

This is the full integration chain:

```
Browser (chart component)
    │
    └── GET /api/dashboard/revenue-by-month
            │
            └── FastAPI (dashboard.py router)
                    │
                    └── DatabricksService.query_sql(sql)
                            │
                            └── POST https://<workspace>/api/2.0/sql/statements
                                  warehouse_id = DATABRICKS_WAREHOUSE_ID
                                  statement    = "SELECT month, revenue FROM vw_revenue_by_month"
                                  wait_timeout = "30s"
                                    │
                                    └── Databricks SQL Warehouse
                                            │
                                            └── SQL View (Gold Layer)
                                                    │
                                                    └── JSON → charts
```

**Authentication:** Databricks Personal Access Token (PAT) in `Authorization: Bearer` header. Stored in `.env`, never sent to the browser.

**Dashboard refresh after pipeline completion:**  
- `monitor.tsx` polls `GET /api/pipeline/status/{run_id}` every 5 s  
- When `state == TERMINATED && result_state == SUCCESS`, it fires `window.dispatchEvent(new Event('pipelineComplete'))`  
- `dashboard.tsx` listens for this event and re-fetches all metrics

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_DEFAULT_REGION` | S3 bucket region |
| `S3_BUCKET` | S3 bucket name |
| `DATABRICKS_WORKSPACE` | `https://adb-xxxx.xx.azuredatabricks.net` |
| `DATABRICKS_TOKEN` | Databricks Personal Access Token |
| `DATABRICKS_JOB_ID` | ID of the existing Databricks job |
| `DATABRICKS_WAREHOUSE_ID` | SQL Warehouse ID for dashboard queries |
| `MOCK_MODE` | `true` = use mock data (no real AWS/Databricks needed) |
| `FRONTEND_URL` | CORS allowed origin (default: `http://localhost:3000`) |

---

## Databricks SQL Views Required

For the live dashboard to work, these views must exist in your Databricks Gold schema:

```sql
CREATE OR REPLACE VIEW vw_kpis AS ...
CREATE OR REPLACE VIEW vw_revenue_by_month AS ...
CREATE OR REPLACE VIEW vw_revenue_by_category AS ...
CREATE OR REPLACE VIEW vw_top_products AS ...
CREATE OR REPLACE VIEW vw_top_customers AS ...
CREATE OR REPLACE VIEW vw_city_revenue AS ...
```

---

## Deployment

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import in Vercel → set `NEXT_PUBLIC_API_URL` to your backend URL
3. Deploy

### Backend → Render / Railway
1. Push `backend/` to GitHub
2. Set all env vars in the Render/Railway dashboard
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts |
| Backend | FastAPI, Python 3.11, Pydantic |
| Storage | AWS S3 (boto3) |
| Pipeline | Databricks (existing notebooks – not modified) |
| Container | Docker, Docker Compose |

---

*DataForge does NOT rebuild the ETL. The Databricks notebooks, Delta tables, and SQL Views already exist and are fully functional.*
