import Head from "next/head";
import AppLayout from "@/components/AppLayout";
import { ArrowRight } from "lucide-react";

const layers = [
  {
    name: "User / Website",
    color: "border-brand-500/40 bg-brand-500/10 text-brand-300",
    desc: "Next.js frontend — upload, monitor, analyse",
  },
  {
    name: "FastAPI Backend",
    color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    desc: "REST API — upload to S3, trigger & poll Databricks",
  },
  {
    name: "AWS S3",
    color: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    desc: "incoming/orders | customers | products | pricing",
  },
  {
    name: "Databricks Workflow",
    color: "border-purple-500/40 bg-purple-500/10 text-purple-300",
    desc: "Existing job — triggered by Jobs API run-now",
  },
  {
    name: "Bronze Layer",
    color: "border-orange-700/40 bg-orange-700/10 text-orange-300",
    desc: "Raw CSV landing — no transformation",
  },
  {
    name: "Silver Layer",
    color: "border-slate-400/40 bg-slate-400/10 text-slate-300",
    desc: "Cleaned, deduplicated, standardised data",
  },
  {
    name: "Gold Layer",
    color: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
    desc: "Star schema — fact_orders + dim tables with MERGE",
  },
  {
    name: "SQL Views",
    color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    desc: "vw_revenue_by_month, vw_top_products, vw_kpis …",
  },
  {
    name: "Dashboard",
    color: "border-pink-500/40 bg-pink-500/10 text-pink-300",
    desc: "Live charts — queried via Databricks SQL API",
  },
];

const integrations = [
  {
    title: "Upload → S3",
    detail: "POST /api/upload → boto3 → s3.upload_fileobj()",
    note: "File routed to incoming/<category>/<timestamp>_<filename>.csv",
  },
  {
    title: "S3 → Databricks",
    detail: "POST /api/2.0/jobs/run-now with notebook_params: {s3_input_key}",
    note: "Existing job picks up the file path from the parameter",
  },
  {
    title: "Job Status Polling",
    detail: "GET /api/2.0/jobs/runs/get?run_id=<id> every 5 s",
    note: "Frontend stops polling when life_cycle_state == TERMINATED",
  },
  {
    title: "Dashboard Data",
    detail: "POST /api/2.0/sql/statements with warehouse_id",
    note: "Queries Databricks SQL Views; result parsed to JSON",
  },
];

export default function ArchitecturePage() {
  return (
    <>
      <Head>
        <title>Architecture – DataForge</title>
        <meta name="description" content="Interactive architecture diagram of the DataForge FMCG Medallion pipeline." />
      </Head>

      <AppLayout>
        <div className="p-8 max-w-4xl mx-auto space-y-10">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">System Architecture</h1>
            <p className="text-slate-400 text-sm">
              DataForge is the presentation & integration layer on top of a
              fully operational Databricks Medallion pipeline.
            </p>
          </div>

          {/* Flow diagram */}
          <div className="glass p-8 rounded-2xl animate-slide-up opacity-0"
               style={{ animationFillMode: "forwards" }}>
            <h2 className="text-lg font-semibold text-white mb-6">End-to-End Data Flow</h2>
            <div className="flex flex-col items-center gap-0">
              {layers.map((layer, i) => (
                <div key={layer.name} className="flex flex-col items-center w-full max-w-md">
                  <div className={`w-full rounded-xl border px-5 py-3.5 text-center ${layer.color}`}>
                    <p className="font-semibold text-sm">{layer.name}</p>
                    <p className="text-xs opacity-70 mt-0.5">{layer.desc}</p>
                  </div>
                  {i < layers.length - 1 && (
                    <div className="flex flex-col items-center py-1 text-slate-700">
                      <div className="w-px h-4 bg-white/10" />
                      <ArrowRight className="w-4 h-4 rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Integration details */}
          <div className="animate-slide-up opacity-0"
               style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            <h2 className="text-lg font-semibold text-white mb-4">Integration Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {integrations.map(({ title, detail, note }) => (
                <div key={title} className="glass p-5 rounded-xl space-y-2">
                  <p className="font-semibold text-brand-300 text-sm">{title}</p>
                  <code className="block text-xs text-slate-400 font-mono bg-white/5 px-3 py-2 rounded-lg leading-relaxed">
                    {detail}
                  </code>
                  <p className="text-xs text-slate-500">{note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
