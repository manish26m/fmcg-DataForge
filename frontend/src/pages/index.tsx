import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Database, Cloud, Zap, Shield, ArrowRight,
  CheckCircle, GitBranch, Upload, Sparkles, Layers,
  ChevronRight, Play, RefreshCw, Cpu, Server, FileSpreadsheet, BarChart2
} from "lucide-react";

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const pipelineSteps = [
    {
      id: "ingestion",
      stepNum: "01",
      title: "CSV Ingestion Layer",
      subtitle: "Web Interface & Raw Data Intake",
      icon: Upload,
      color: "from-blue-500 to-cyan-500",
      accent: "cyan",
      badge: "Ingestion",
      description: "Raw FMCG transaction, inventory, and sales data CSV files are uploaded via the DataForge client interface. Files are validated and streamed directly into secure AWS S3 landing storage.",
      tech: ["Next.js", "FastAPI", "Boto3"],
      details: {
        format: "UTF-8 CSV Format",
        throughput: "Up to 500 MB / batch",
        target: "s3://fmcg-dataforge-incoming/",
      },
      diagram3d: (
        <div className="relative w-full h-64 flex items-center justify-center perspective-1000">
          <div className="relative w-56 h-36 bg-gradient-to-tr from-slate-900 via-slate-800 to-cyan-950/80 rounded-2xl border border-cyan-500/30 shadow-[0_20px_50px_rgba(6,182,212,0.2)] transform rotate-x-12 rotate-y-6 hover:rotate-0 transition-transform duration-500 flex flex-col justify-between p-4 group">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">raw_fmcg_sales.csv</span>
            </div>
            <div className="space-y-1.5 font-mono text-[11px] text-slate-400">
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded">
                <span>records:</span>
                <span className="text-cyan-300">1,250,400</span>
              </div>
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded">
                <span>size:</span>
                <span className="text-cyan-300">42.8 MB</span>
              </div>
            </div>
            {/* Animated data particles */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
          </div>
        </div>
      )
    },
    {
      id: "s3",
      stepNum: "02",
      title: "AWS S3 Object Storage",
      subtitle: "Cloud Data Lake Foundation",
      icon: Cloud,
      color: "from-amber-500 to-orange-500",
      accent: "amber",
      badge: "Storage",
      description: "AWS S3 provides durable, high-throughput cloud storage acting as the raw landing zone. Automated event notifications signal the backend API to trigger downstream processing.",
      tech: ["AWS S3", "IAM Roles", "Boto3 SDK"],
      details: {
        bucket: "fmcg-data-lake-prod",
        redundancy: "99.999999999% durability",
        trigger: "FastAPI REST Dispatcher",
      },
      diagram3d: (
        <div className="relative w-full h-64 flex items-center justify-center perspective-1000">
          <div className="relative w-52 h-44 bg-gradient-to-tr from-slate-900 via-amber-950/40 to-slate-900 rounded-2xl border border-amber-500/30 shadow-[0_20px_50px_rgba(245,158,11,0.25)] transform -rotate-x-12 rotate-y-12 hover:rotate-0 transition-transform duration-500 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Cloud className="w-8 h-8 text-amber-400 animate-bounce" />
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div className="text-center my-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider">AWS S3 Bucket</div>
              <div className="text-[11px] text-amber-300/80 font-mono mt-1">/incoming/fmcg_batch_2026.csv</div>
            </div>
            <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 text-center text-[10px] font-mono text-amber-300">
              STATUS: READY_FOR_ETL
            </div>
          </div>
        </div>
      )
    },
    {
      id: "bronze",
      stepNum: "03",
      title: "Bronze Layer (Raw Ingestion)",
      subtitle: "Immutable Delta Lake Tables",
      icon: Server,
      color: "from-amber-600 to-yellow-700",
      accent: "yellow",
      badge: "Medallion - Raw",
      description: "Databricks auto-loader ingests S3 CSV data verbatim into Bronze Delta tables without modification. Preserves original data structure with lineage metadata and ingest timestamps.",
      tech: ["Databricks", "Delta Lake", "PySpark Auto-Loader"],
      details: {
        table: "fmcg_db.bronze_sales_raw",
        schema: "Schema Evolution (Merge)",
        storage: "Parquet + Transaction Log",
      },
      diagram3d: (
        <div className="relative w-full h-64 flex items-center justify-center perspective-1000">
          <div className="relative w-56 h-40 bg-gradient-to-br from-amber-950 via-slate-900 to-yellow-950 rounded-2xl border border-amber-600/40 shadow-[0_20px_50px_rgba(217,119,6,0.3)] transform rotate-x-6 -rotate-y-12 hover:rotate-0 transition-transform duration-500 p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">BRONZE_DELTA_TABLE</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-amber-900/50">
              <div className="text-amber-300">+ _ingest_timestamp</div>
              <div className="text-slate-400">+ _source_file_path</div>
              <div className="text-slate-400">+ raw_json_payload</div>
            </div>
            <div className="text-[10px] text-amber-400/70 font-mono text-right">Append-Only Immutable</div>
          </div>
        </div>
      )
    },
    {
      id: "silver",
      stepNum: "04",
      title: "Silver Layer (Cleaned & Curated)",
      subtitle: "Data Cleansing, Validation & Transformation",
      icon: Cpu,
      color: "from-slate-400 to-slate-200",
      accent: "slate",
      badge: "Medallion - Cleaned",
      description: "PySpark pipelines deduplicate, cast data types, enforce data quality constraints, and standardise schema structures. Raw values are transformed into enterprise-ready dimensions.",
      tech: ["PySpark", "Delta Live Tables", "Data Quality Rules"],
      details: {
        table: "fmcg_db.silver_transactions",
        quality: "Zero Null Keys Enforced",
        transform: "Deduplication & Type Casting",
      },
      diagram3d: (
        <div className="relative w-full h-64 flex items-center justify-center perspective-1000">
          <div className="relative w-56 h-40 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-700 rounded-2xl border border-slate-300/40 shadow-[0_20px_50px_rgba(203,213,225,0.25)] transform -rotate-x-6 rotate-y-12 hover:rotate-0 transition-transform duration-500 p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">SILVER_CLEAN_TABLE</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-700">
              <div className="text-emerald-400">✓ Deduplicated Records</div>
              <div className="text-emerald-400">✓ Null Integrity Verified</div>
              <div className="text-cyan-300">✓ ISO Date & Currency Cast</div>
            </div>
            <div className="text-[10px] text-slate-300 font-mono text-right">Data Quality Enforced</div>
          </div>
        </div>
      )
    },
    {
      id: "gold",
      stepNum: "05",
      title: "Gold Layer (Business Aggregates)",
      subtitle: "Dimensional Data Marts & KPIs",
      icon: Zap,
      color: "from-yellow-400 to-amber-300",
      accent: "gold",
      badge: "Medallion - Gold",
      description: "Star-schema dimensional models and business aggregations (revenue, inventory turnover, SKU performance) are calculated for high-speed sub-second reporting.",
      tech: ["Delta Lake", "Spark SQL", "Star Schema"],
      details: {
        tables: "fact_sales, dim_product, dim_store",
        performance: "Z-ORDER Indexing",
        latency: "< 100ms Query Times",
      },
      diagram3d: (
        <div className="relative w-full h-64 flex items-center justify-center perspective-1000">
          <div className="relative w-56 h-40 bg-gradient-to-br from-yellow-900 via-amber-950 to-slate-900 rounded-2xl border border-yellow-400/50 shadow-[0_20px_50px_rgba(250,204,21,0.35)] transform rotate-x-12 rotate-y-6 hover:rotate-0 transition-transform duration-500 p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50" />
              <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider font-mono">GOLD_BUSINESS_MART</span>
            </div>
            <div className="space-y-1 text-[11px] font-mono text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-yellow-700/50">
              <div className="text-yellow-300">dim_store & dim_product</div>
              <div className="text-yellow-300">fact_fmcg_daily_sales</div>
              <div className="text-amber-200">kpi_revenue_aggregates</div>
            </div>
            <div className="text-[10px] text-yellow-400 font-mono text-right">Star-Schema Aggregated</div>
          </div>
        </div>
      )
    },
    {
      id: "aibi",
      stepNum: "06",
      title: "Databricks AI/BI Analytics",
      subtitle: "Interactive Dashboards & Intelligence",
      icon: Sparkles,
      color: "from-purple-500 to-indigo-500",
      accent: "purple",
      badge: "Analytics & BI",
      description: "Databricks AI/BI Lakeview dashboards query Gold SQL views directly. Real-time FMCG revenue KPIs, product category trends, and regional metrics are visualised in an embedded UI.",
      tech: ["Databricks AI/BI", "SQL Warehouse", "DataForge UI"],
      details: {
        dashboard: "FMCG Executive Lakeview",
        warehouse: "Serverless SQL Warehouse",
        embed: "Live Responsive iFrame Integration",
      },
      diagram3d: (
        <div className="relative w-full h-64 flex items-center justify-center perspective-1000">
          <div className="relative w-60 h-44 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 rounded-2xl border border-purple-400/50 shadow-[0_20px_50px_rgba(168,85,247,0.35)] transform -rotate-x-6 rotate-y-6 hover:rotate-0 transition-transform duration-500 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span className="text-xs font-bold text-purple-200 font-mono">AI/BI LAKEVIEW</span>
              </div>
              <span className="text-[9px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded border border-purple-400/40">LIVE</span>
            </div>
            {/* Visual mini-chart bars */}
            <div className="flex items-end gap-2 h-16 bg-slate-950/80 p-2 rounded-lg border border-purple-900/40">
              <div className="w-1/5 bg-gradient-to-t from-purple-600 to-indigo-400 h-3/5 rounded-t" />
              <div className="w-1/5 bg-gradient-to-t from-purple-600 to-indigo-400 h-4/5 rounded-t" />
              <div className="w-1/5 bg-gradient-to-t from-purple-600 to-indigo-400 h-2/5 rounded-t" />
              <div className="w-1/5 bg-gradient-to-t from-purple-600 to-indigo-400 h-full rounded-t" />
              <div className="w-1/5 bg-gradient-to-t from-purple-600 to-indigo-400 h-4/5 rounded-t" />
            </div>
            <div className="text-[10px] text-purple-300 font-mono text-center">FMCG Executive Insights Ready</div>
          </div>
        </div>
      )
    }
  ];

  // Auto-play steps
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % pipelineSteps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlay, pipelineSteps.length]);

  const current = pipelineSteps[activeStep];

  return (
    <>
      <Head>
        <title>DataForge – FMCG Medallion Data Architecture Platform</title>
        <meta
          name="description"
          content="Enterprise 3D demonstration flow showing end-to-end FMCG Medallion Data Architecture with AWS S3, Databricks Delta Lake (Bronze, Silver, Gold), and AI/BI Analytics."
        />
      </Head>

      <div className="min-h-screen bg-surface-950 text-slate-100 selection:bg-brand-500 selection:text-white">
        {/* ── Top Navigation ──────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4
                        border-b border-white/5 bg-surface-950/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-cyan-400
                            flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Database className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">DataForge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/aibi" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              AI/BI Dashboard
            </Link>
            <Link href="/architecture" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Architecture
            </Link>
            <Link href="/upload" className="btn-primary text-sm">
              Upload Dataset <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </nav>

        {/* ── Hero Header ─────────────────────────────────────────────────── */}
        <section className="relative px-8 pt-20 pb-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-30 pointer-events-none" />

          <div className="relative max-w-4xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30
                             bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-300 mb-6 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              Interactive Architectural Demonstration
            </span>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              FMCG Medallion Data Pipeline{" "}
              <span className="gradient-text">Demonstration Flow</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Explore how raw FMCG datasets transition seamlessly from browser upload to
              AWS S3, through Databricks Bronze, Silver, and Gold Delta Lake layers, straight into AI/BI dashboards.
            </p>
          </div>
        </section>

        {/* ── 3D Interactive Pipeline Demonstration Section ───────────────── */}
        <section className="px-6 py-8 max-w-7xl mx-auto">
          {/* Timeline Step Controls */}
          <div className="glass p-4 mb-8 rounded-2xl border border-white/10 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[700px] gap-2">
              {pipelineSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep === index;
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      setActiveStep(index);
                      setIsAutoPlay(false);
                    }}
                    className={`flex-1 flex flex-col items-center p-3 rounded-xl transition-all duration-300 border text-left group relative ${
                      isActive
                        ? "bg-brand-500/15 border-brand-500/50 shadow-lg shadow-brand-500/10 scale-105"
                        : "bg-surface-900/40 border-white/5 hover:bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isActive ? "bg-brand-400 text-slate-950" : "bg-slate-800 text-slate-400"
                      }`}>
                        {step.stepNum}
                      </span>
                      <Icon className={`w-4 h-4 ${isActive ? "text-brand-300" : "text-slate-400 group-hover:text-slate-200"}`} />
                    </div>
                    <span className={`text-xs font-semibold tracking-tight ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    }`}>
                      {step.badge}
                    </span>

                    {/* Progress Bar Indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-400 rounded-b-xl animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3D Flow Showcase Display Card */}
          <div className="glass p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Ambient Background Blur */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Left Column: 3D Visualization */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
              <div className="w-full flex justify-between items-center mb-2 px-2">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">3D Model Visualiser</span>
                <button
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className="flex items-center gap-1.5 text-xs text-brand-300 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/30 hover:bg-brand-500/20 transition"
                >
                  {isAutoPlay ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {isAutoPlay ? "Auto Playing" : "Paused"}
                </button>
              </div>

              {current.diagram3d}

              {/* Step counter */}
              <div className="mt-4 flex items-center gap-2 text-xs font-mono text-slate-400">
                <span>STAGE {activeStep + 1} OF {pipelineSteps.length}</span>
                <span className="text-slate-600">•</span>
                <span className="text-brand-300 font-bold">{current.title}</span>
              </div>
            </div>

            {/* Right Column: Step Description & Tech Specs */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-brand-500/20 text-brand-300 border border-brand-500/40">
                    STEP {current.stepNum}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    {current.subtitle}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  {current.title}
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                  {current.description}
                </p>

                {/* Tech Stack Pills */}
                <div className="mb-6">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block mb-2">
                    Technologies Employed
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {current.tech.map((t) => (
                      <span key={t} className="text-xs font-medium px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Technical Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950/60 rounded-xl border border-white/5 text-xs">
                  {Object.entries(current.details).map(([key, val]) => (
                    <div key={key}>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">{key}</div>
                      <div className="font-mono text-slate-200 mt-0.5 truncate">{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                <button
                  disabled={activeStep === 0}
                  onClick={() => {
                    setActiveStep((prev) => Math.max(0, prev - 1));
                    setIsAutoPlay(false);
                  }}
                  className="btn-ghost text-xs px-4 py-2 disabled:opacity-30"
                >
                  Previous Stage
                </button>
                <div className="flex items-center gap-1.5">
                  {pipelineSteps.map((_, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setActiveStep(i);
                        setIsAutoPlay(false);
                      }}
                      className={`h-2 rounded-full cursor-pointer transition-all ${
                        i === activeStep ? "w-6 bg-brand-400" : "w-2 bg-slate-700 hover:bg-slate-500"
                      }`}
                    />
                  ))}
                </div>
                <button
                  disabled={activeStep === pipelineSteps.length - 1}
                  onClick={() => {
                    setActiveStep((prev) => Math.min(pipelineSteps.length - 1, prev + 1));
                    setIsAutoPlay(false);
                  }}
                  className="btn-primary text-xs px-4 py-2 disabled:opacity-30"
                >
                  Next Stage <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Architecture Summary Grid ───────────────────────────────────── */}
        <section className="px-6 py-16 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Medallion Architecture Highlights
            </h2>
            <p className="text-slate-400 text-sm">
              How the multi-stage Delta Lake processing ensures clean, aggregated, high-speed data delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Bronze Layer (Raw)</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Stores untouched raw CSV ingest records from S3 with metadata fields (`_ingest_time`, `_source_file`). Serves as historical single source of truth.
              </p>
              <span className="text-xs font-mono text-amber-400">Append-Only Delta Table</span>
            </div>

            <div className="glass p-6 rounded-2xl border border-slate-400/20 bg-gradient-to-b from-slate-400/5 to-transparent">
              <div className="w-10 h-10 rounded-xl bg-slate-400/20 border border-slate-400/40 flex items-center justify-center text-slate-200 font-bold mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Silver Layer (Cleaned)</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                Cleansed, deduplicated, and typed data. Enforces business constraint rules, handles nulls, and standardises currency/date formats.
              </p>
              <span className="text-xs font-mono text-slate-300">Enforced Quality Rules</span>
            </div>

            <div className="glass p-6 rounded-2xl border border-yellow-500/20 bg-gradient-to-b from-yellow-500/5 to-transparent">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-300 font-bold mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Gold Layer (Aggregated)</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                High-performance star-schema business marts. Pre-calculated KPI aggregates formatted for sub-second Databricks AI/BI queries.
              </p>
              <span className="text-xs font-mono text-yellow-300">Star-Schema Business Marts</span>
            </div>
          </div>
        </section>

        {/* ── Call to Action ──────────────────────────────────────────────── */}
        <section className="px-6 py-16 text-center">
          <div className="max-w-2xl mx-auto glass p-10 rounded-3xl border border-white/10">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">
              Ready to Run the Pipeline?
            </h2>
            <p className="text-slate-400 mb-8 text-sm max-w-lg mx-auto">
              Upload a new FMCG sales dataset to trigger the automated Databricks Workflow and view updated AI/BI analytics instantly.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/upload" className="btn-primary px-6 py-3">
                Upload FMCG Dataset <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/aibi" className="btn-ghost px-6 py-3">
                View AI/BI Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/5 px-8 py-6 text-center text-xs text-slate-600">
          DataForge © {new Date().getFullYear()} — FMCG Medallion Data Lakehouse Platform
        </footer>
      </div>
    </>
  );
}
