"use client";
import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, ShoppingCart, Users, Package, RefreshCw, DollarSign,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import MetricCard from "@/components/MetricCard";
import {
  getDashboardKPIs, getRevenueByMonth, getRevenueByCategory,
  getTopProducts, getTopCustomers, getCityRevenue,
} from "@/lib/api";

const CHART_COLORS = [
  "hsl(214,80%,55%)", "hsl(184,72%,48%)", "hsl(262,72%,60%)",
  "hsl(34,90%,55%)", "hsl(154,64%,50%)", "hsl(344,80%,60%)",
];

const fmt = (n: number) =>
  n >= 1_000_000 ? `£${(n / 1_000_000).toFixed(2)}M` :
  n >= 1_000    ? `£${(n / 1_000).toFixed(1)}k` : `£${n.toFixed(0)}`;

export default function DashboardPage() {
  const [kpis, setKpis]         = useState<any>(null);
  const [monthly, setMonthly]   = useState<any[]>([]);
  const [category, setCategory] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [cities, setCities]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [k, m, c, p, cu, ci] = await Promise.all([
        getDashboardKPIs(),
        getRevenueByMonth(),
        getRevenueByCategory(),
        getTopProducts(),
        getTopCustomers(),
        getCityRevenue(),
      ]);
      setKpis(k); setMonthly(m); setCategory(c);
      setProducts(p); setCustomers(cu); setCities(ci);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    // Auto-refresh when pipeline completes
    const handler = () => fetchAll();
    window.addEventListener("pipelineComplete", handler);
    return () => window.removeEventListener("pipelineComplete", handler);
  }, [fetchAll]);

  return (
    <>
      <Head>
        <title>Analytics Dashboard – DataForge</title>
        <meta name="description" content="Live analytics dashboard powered by Databricks Gold layer SQL views." />
      </Head>

      <AppLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Live data from Databricks SQL Views (Gold Layer)
                {lastRefresh && (
                  <span className="ml-2 text-slate-600">
                    · Last refreshed {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={fetchAll}
              disabled={loading}
              className="btn-ghost gap-2"
              id="refresh-dashboard-btn"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* KPIs */}
          {kpis && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <MetricCard label="Total Revenue"    value={fmt(kpis.total_revenue)}    icon={<DollarSign className="w-4 h-4" />} delay={0} />
              <MetricCard label="Total Orders"     value={kpis.total_orders.toLocaleString()} icon={<ShoppingCart className="w-4 h-4" />} delay={80} />
              <MetricCard label="Customers"        value={kpis.total_customers.toLocaleString()} icon={<Users className="w-4 h-4" />} delay={160} />
              <MetricCard label="Products"         value={kpis.total_products.toLocaleString()} icon={<Package className="w-4 h-4" />} delay={240} />
              <MetricCard label="Avg Order Value"  value={`£${kpis.avg_order_value.toFixed(0)}`} icon={<TrendingUp className="w-4 h-4" />} delay={320} />
            </div>
          )}

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Monthly Revenue */}
            <div className="glass p-5 rounded-2xl animate-slide-up opacity-0"
                 style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                Revenue by Month
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `£${(v/1000).toFixed(0)}k`} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(220,24%,8%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}
                    labelStyle={{ color: "#e2e8f0" }}
                    formatter={(v: number) => [fmt(v), "Revenue"]}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(214,80%,55%)" strokeWidth={2.5}
                        dot={{ fill: "hsl(214,80%,55%)", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue by Category */}
            <div className="glass p-5 rounded-2xl animate-slide-up opacity-0"
                 style={{ animationDelay: "160ms", animationFillMode: "forwards" }}>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                Revenue by Category
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={category} cx="50%" cy="50%" outerRadius={80} dataKey="revenue"
                       nameKey="category" label={({ category: c, percent }: any) =>
                         `${c} ${(percent * 100).toFixed(0)}%`}>
                    {category.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [fmt(v), "Revenue"]}
                    contentStyle={{ background: "hsl(220,24%,8%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Top Products */}
            <div className="glass p-5 rounded-2xl animate-slide-up opacity-0"
                 style={{ animationDelay: "220ms", animationFillMode: "forwards" }}>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                Top Products by Revenue
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={products.slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `£${(v/1000).toFixed(0)}k`}
                         tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="product_name" width={130}
                         tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => [fmt(v), "Revenue"]}
                    contentStyle={{ background: "hsl(220,24%,8%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                    {products.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* City Revenue */}
            <div className="glass p-5 rounded-2xl animate-slide-up opacity-0"
                 style={{ animationDelay: "280ms", animationFillMode: "forwards" }}>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                Revenue by City
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={cities.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="city" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `£${(v/1000).toFixed(0)}k`}
                         tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: number) => [fmt(v), "Revenue"]}
                    contentStyle={{ background: "hsl(220,24%,8%)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }} />
                  <Bar dataKey="revenue" fill="hsl(184,72%,48%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Customers table */}
          <div className="glass p-5 rounded-2xl animate-slide-up opacity-0"
               style={{ animationDelay: "340ms", animationFillMode: "forwards" }}>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
              Top Customers
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase tracking-wide border-b border-white/5">
                    <th className="pb-3 pr-4">Rank</th>
                    <th className="pb-3 pr-4">Customer</th>
                    <th className="pb-3 pr-4">City</th>
                    <th className="pb-3 text-right">Total Spend</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={c.customer_name}
                        className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="py-3 pr-4 text-slate-500 font-mono">#{i + 1}</td>
                      <td className="py-3 pr-4 font-medium text-white">{c.customer_name}</td>
                      <td className="py-3 pr-4 text-slate-400">{c.city}</td>
                      <td className="py-3 text-right font-semibold text-brand-300">{fmt(c.total_spend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
