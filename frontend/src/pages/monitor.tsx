import { useRouter } from "next/router";
import { useCallback } from "react";
import Head from "next/head";
import { CheckCircle, Loader2, AlertCircle, Clock, RefreshCw } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import StatusBadge from "@/components/StatusBadge";
import { usePolling } from "@/hooks/usePolling";
import { getPipelineStatus } from "@/lib/api";
import { clsx } from "clsx";

const stageIcons: Record<string, string> = {
  Bronze:      "🥉",
  Silver:      "🥈",
  Gold:        "🥇",
  "SQL Views": "📊",
  Dashboard:   "📈",
};

export default function MonitorPage() {
  const router = useRouter();
  const runId = Number(router.query.run_id);

  const fetchStatus = useCallback(
    () => getPipelineStatus(runId),
    [runId]
  );

  const { data, loading, error } = usePolling(
    fetchStatus,
    (d) => d?.state === "TERMINATED" || d?.state === "INTERNAL_ERROR" || d?.state === "SKIPPED",
    5000
  );

  const pipelineDone = data?.state === "TERMINATED";

  return (
    <>
      <Head>
        <title>Pipeline Monitor – DataForge</title>
        <meta name="description" content="Monitor the real-time execution status of your Databricks data pipeline." />
      </Head>

      <AppLayout>
        <div className="p-8 max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Pipeline Monitor</h1>
              <p className="text-slate-400 text-sm">
                Databricks Job Run{" "}
                <code className="font-mono text-brand-300 bg-brand-500/10 px-1.5 py-0.5 rounded">
                  #{runId || "–"}
                </code>
              </p>
            </div>
            {data && (
              <StatusBadge status={data.result_state ?? data.state} />
            )}
          </div>

          {/* Loading */}
          {loading && !data && (
            <div className="glass p-12 rounded-2xl text-center animate-fade-in">
              <Loader2 className="w-10 h-10 text-brand-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Connecting to Databricks…</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="glass p-8 rounded-2xl text-center border border-red-500/20 animate-fade-in">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Stages */}
          {data && (
            <div className="space-y-4 animate-fade-in">
              {data.stages.map((stage, i) => (
                <div
                  key={stage.name}
                  className={clsx(
                    "glass p-5 rounded-xl flex items-center gap-4 transition-all duration-300",
                    stage.status === "running" && "border-brand-500/40 shadow-brand-500/10 shadow-lg"
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className="text-2xl">{stageIcons[stage.name] ?? "🔹"}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{stage.name}</p>
                    {stage.status === "running" && (
                      <div className="mt-2 w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full animate-pulse w-3/4" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {stage.status === "running" && (
                      <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
                    )}
                    {stage.status === "success" && (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    )}
                    {stage.status === "pending" && (
                      <Clock className="w-4 h-4 text-slate-600" />
                    )}
                    {stage.status === "failed" && (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <StatusBadge status={stage.status} />
                  </div>
                </div>
              ))}

              {/* Run details */}
              <div className="glass p-5 rounded-xl grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Run ID</p>
                  <p className="font-mono text-brand-300">{data.run_id}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Overall State</p>
                  <StatusBadge status={data.result_state ?? data.state} />
                </div>
                {data.duration_ms && (
                  <div>
                    <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Duration</p>
                    <p className="text-white">{(data.duration_ms / 1000).toFixed(1)} s</p>
                  </div>
                )}
                {!pipelineDone && (
                  <div className="col-span-2 flex items-center gap-2 text-slate-400 text-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                    Polling every 5 s…
                  </div>
                )}
              </div>

              {/* Done banner */}
              {pipelineDone && data.result_state === "SUCCESS" && (
                <div className="glass p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5
                                flex items-center gap-4 animate-slide-up opacity-0"
                     style={{ animationFillMode: "forwards" }}>
                  <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-300">Pipeline completed successfully</p>
                    <p className="text-sm text-slate-400">Dashboard data has been refreshed.</p>
                  </div>
                  <a href="/dashboard" className="btn-primary" id="view-dashboard-btn">
                    View Dashboard
                  </a>
                </div>
              )}

              {pipelineDone && data.result_state !== "SUCCESS" && (
                <div className="glass p-5 rounded-xl border border-red-500/30 bg-red-500/5
                                flex items-center gap-4">
                  <AlertCircle className="w-8 h-8 text-red-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-300">Pipeline failed</p>
                    <p className="text-sm text-slate-400">Check Databricks for full logs.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}
