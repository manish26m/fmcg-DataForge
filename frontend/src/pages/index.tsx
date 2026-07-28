import Head from "next/head";
import Link from "next/link";
import {
  Database, Cloud, Zap, BarChart3, Shield, ArrowRight,
  CheckCircle, GitBranch, Upload, Activity,
} from "lucide-react";

const stack = [
  { label: "Databricks", icon: "🧱", desc: "Medallion architecture on Delta Lake" },
  { label: "AWS S3",     icon: "☁️",  desc: "Scalable object storage for raw CSVs" },
  { label: "FastAPI",    icon: "⚡",  desc: "High-performance Python REST API" },
  { label: "Next.js",    icon: "▲",   desc: "React framework with SSR & routing" },
];

const features = [
  { icon: Upload,    title: "CSV Upload",         desc: "Drag-and-drop files directly into the pipeline from your browser." },
  { icon: Cloud,     title: "S3 Integration",     desc: "Files land automatically in the correct S3 bucket folder." },
  { icon: Zap,       title: "Auto Job Trigger",   desc: "Databricks Workflow fires the moment your upload completes." },
  { icon: Activity,  title: "Live Monitoring",    desc: "Watch Bronze → Silver → Gold progress in real time." },
  { icon: BarChart3, title: "Analytics Dashboard",desc: "Interactive charts powered by live SQL views." },
  { icon: Shield,    title: "Secure & Modular",   desc: "All credentials in env vars; service layer swappable anytime." },
];

const flow = [
  "Upload CSV",
  "AWS S3",
  "Databricks Job",
  "Bronze Layer",
  "Silver Layer",
  "Gold Layer",
  "SQL Views",
  "Dashboard",
];

export default function HomePage() {
  return (
    <>
      <Head>
        <title>DataForge – Enterprise Data Lakehouse Platform</title>
        <meta
          name="description"
          content="DataForge is the enterprise web interface for the FMCG Medallion Architecture pipeline running on Databricks. Upload, trigger, monitor, and analyse – all in one place."
        />
      </Head>

      <div className="min-h-screen">
        {/* ── Top nav ─────────────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4
                        border-b border-white/5 bg-surface-950/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-cyan-400
                            flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Database className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">DataForge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="btn-ghost text-sm">Dashboard</Link>
            <Link href="/upload"    className="btn-primary text-sm">Get Started</Link>
          </div>
        </nav>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="relative px-8 pt-28 pb-24 text-center overflow-hidden">
          {/* Background grid */}
          <div className="absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-40 pointer-events-none" />

          <div className="relative max-w-4xl mx-auto animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30
                             bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300 mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              Enterprise Medallion Architecture
            </span>

            <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
              The Interface for Your{" "}
              <span className="gradient-text">Databricks Pipeline</span>
            </h1>

            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              Upload raw CSV data, trigger the existing Databricks Workflow, monitor every
              medallion layer, and explore analytics — all from a single professional interface.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/upload"    className="btn-primary px-7 py-3 text-base">
                Upload Dataset <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/dashboard" className="btn-ghost px-7 py-3 text-base">
                View Analytics
              </Link>
            </div>
          </div>
        </section>

        {/* ── Pipeline Flow ────────────────────────────────────────────────── */}
        <section className="px-8 py-16 max-w-6xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-white mb-10">
            End-to-End Data Flow
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {flow.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`glass px-4 py-2 text-sm font-semibold rounded-xl
                  ${i === 0 ? "text-brand-300 border-brand-500/30" :
                    i === flow.length - 1 ? "text-cyan-300 border-cyan-500/30" :
                    "text-slate-300"}`}>
                  {step}
                </div>
                {i < flow.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────────── */}
        <section className="px-8 py-16 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-3 text-center">Platform Features</h2>
          <p className="text-slate-400 text-center mb-12">
            Everything a data engineer needs in one unified interface.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="glass p-6 flex flex-col gap-3 animate-slide-up opacity-0"
                style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center
                                justify-center text-brand-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tech Stack ───────────────────────────────────────────────────── */}
        <section className="px-8 py-16 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">Technology Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {stack.map(({ label, icon, desc }) => (
              <div key={label} className="glass p-5 flex flex-col items-center text-center gap-2">
                <span className="text-3xl">{icon}</span>
                <span className="font-semibold text-white text-sm">{label}</span>
                <span className="text-xs text-slate-500 leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="px-8 py-20 text-center">
          <div className="max-w-xl mx-auto glass p-10">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">
              Pipeline Already Running
            </h2>
            <p className="text-slate-400 mb-6 text-sm">
              The Databricks Medallion ETL is complete. This interface connects to it —
              no code changes required.
            </p>
            <Link href="/upload" className="btn-primary">
              Upload Your First Dataset <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/5 px-8 py-6 text-center text-xs text-slate-600">
          DataForge © {new Date().getFullYear()} — FMCG Medallion Architecture Platform
        </footer>
      </div>
    </>
  );
}
