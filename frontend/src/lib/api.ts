/**
 * Centralised API client.
 * All requests go to NEXT_PUBLIC_API_URL (defaults to http://localhost:8000).
 */

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001";

export const api = axios.create({
  baseURL: API_URL,
});

// ─── Upload ──────────────────────────────────────────────────────────────────
export async function uploadCSV(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ success: boolean; s3_key: string; run_id: number; message: string }> {
  const form = new FormData();
  form.append("file", file);

  const resp = await api.post("/api/upload", form, {
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return resp.data;
}

// ─── Pipeline ────────────────────────────────────────────────────────────────
export async function triggerPipeline(s3_key?: string) {
  const resp = await api.post("/api/pipeline/trigger", { s3_key: s3_key ?? "" });
  return resp.data as { success: boolean; run_id: number; message: string };
}

export async function getPipelineStatus(runId: number) {
  const resp = await api.get(`/api/pipeline/status/${runId}`);
  return resp.data as {
    run_id: number;
    state: string;
    result_state: string | null;
    start_time: number | null;
    end_time: number | null;
    duration_ms: number | null;
    stages: { name: string; status: string }[];
  };
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export async function getDashboardKPIs() {
  const resp = await api.get("/api/dashboard/kpis");
  return resp.data as {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    total_products: number;
    avg_order_value: number;
  };
}

export async function getRevenueByMonth() {
  const resp = await api.get("/api/dashboard/revenue-by-month");
  return resp.data as { month: string; revenue: number }[];
}

export async function getRevenueByCategory() {
  const resp = await api.get("/api/dashboard/revenue-by-category");
  return resp.data as { category: string; revenue: number }[];
}

export async function getTopProducts() {
  const resp = await api.get("/api/dashboard/top-products");
  return resp.data as { product_name: string; revenue: number; units_sold: number }[];
}

export async function getTopCustomers() {
  const resp = await api.get("/api/dashboard/top-customers");
  return resp.data as { customer_name: string; city: string; total_spend: number }[];
}

export async function getCityRevenue() {
  const resp = await api.get("/api/dashboard/city-revenue");
  return resp.data as { city: string; revenue: number }[];
}
