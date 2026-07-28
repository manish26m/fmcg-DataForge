"use client";
import { useState, useRef, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Upload, FileText, CheckCircle, AlertCircle, X, CloudUpload, Activity } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { uploadCSV } from "@/lib/api";

type UploadState = "idle" | "uploading" | "success" | "error";

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile]         = useState<File | null>(null);
  const [state, setState]       = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [runId, setRunId]       = useState<number | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // ── Drop handling ──────────────────────────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith(".csv")) setFile(dropped);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  // ── Upload ─────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;
    setState("uploading");
    setProgress(0);
    setError(null);

    try {
      const result = await uploadCSV(file, (pct) => setProgress(pct));
      setRunId(result.run_id ?? null);
      setState("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      setState("error");
    }
  };

  const reset = () => {
    setFile(null);
    setState("idle");
    setProgress(0);
    setError(null);
    setRunId(null);
  };

  const goToDashboard = () => {
    router.push("/aibi");
  };

  return (
    <>
      <Head>
        <title>Upload Dataset – DataForge</title>
        <meta name="description" content="Upload a CSV file to trigger the Databricks data pipeline." />
      </Head>

      <AppLayout>
        <div className="p-8 max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Upload Dataset</h1>
            <p className="text-slate-400 text-sm">
              Select a CSV file. It will be uploaded to AWS S3 and the Databricks
              pipeline will start automatically.
            </p>
          </div>

          {/* Drop Zone */}
          {state === "idle" && (
            <div
              className={`glass rounded-2xl p-10 text-center cursor-pointer transition-all
                ${dragging ? "border-brand-500/60 bg-brand-500/10" : "border-dashed border-2 border-white/10 hover:border-brand-500/40 hover:bg-brand-500/5"}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
                id="csv-input"
              />
              <CloudUpload className="w-14 h-14 text-brand-400/60 mx-auto mb-4" />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-brand-300" />
                  <p className="font-semibold text-white">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <>
                  <p className="text-white font-semibold mb-1">Drop CSV here or click to browse</p>
                  <p className="text-sm text-slate-500">Only .csv files are accepted</p>
                </>
              )}
            </div>
          )}

          {/* File preview + Upload button */}
          {state === "idle" && file && (
            <div className="mt-4 flex items-center justify-between glass p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-brand-400" />
                <div>
                  <p className="text-sm font-medium text-white">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB · CSV</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={reset} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
                <button onClick={handleUpload} id="upload-btn" className="btn-primary">
                  <Upload className="w-4 h-4" /> Upload & Trigger Pipeline
                </button>
              </div>
            </div>
          )}

          {/* Uploading */}
          {state === "uploading" && (
            <div className="glass p-8 rounded-2xl text-center animate-fade-in">
              <CloudUpload className="w-10 h-10 text-brand-400 mx-auto mb-4 animate-pulse" />
              <p className="font-semibold text-white mb-2">Uploading to AWS S3…</p>
              <p className="text-sm text-slate-400 mb-6">{file?.name}</p>
              {/* Progress bar */}
              <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">{progress}%</p>
            </div>
          )}

          {/* Success */}
          {state === "success" && (
            <div className="glass p-8 rounded-2xl text-center animate-slide-up opacity-0"
                 style={{ animationFillMode: "forwards" }}>
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Uploaded Successfully!</h2>
              <p className="text-sm text-slate-400 mb-1">{file?.name} landed in AWS S3</p>
              {runId && (
                <p className="text-sm text-slate-500 mb-6">
                  Databricks job started · <span className="text-brand-300 font-mono">run_id: {runId}</span>
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {runId && (
                  <button onClick={goToDashboard} className="btn-primary" id="monitor-btn">
                    <Activity className="w-4 h-4" /> View AI/BI Dashboard
                  </button>
                )}
                <button onClick={reset} className="btn-ghost" id="upload-another-btn">
                  Upload Another File
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <div className="glass p-8 rounded-2xl text-center animate-fade-in border border-red-500/20">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Upload Failed</h2>
              <p className="text-sm text-red-400 mb-6">{error}</p>
              <button onClick={reset} className="btn-ghost" id="try-again-btn">Try Again</button>
            </div>
          )}

          {/* Info card */}
          <div className="mt-8 glass p-5 rounded-xl text-sm text-slate-400 space-y-1.5">
            <p className="text-white font-semibold text-xs uppercase tracking-widest mb-2">What happens next</p>
            {[
              "CSV → uploaded to S3 bucket (incoming/ folder)",
              "Backend triggers the existing Databricks Workflow via Jobs API",
              "Bronze → Silver → Gold layers run automatically",
              "Dashboard refreshes with the latest processed data",
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-[10px] shrink-0">{i + 1}</span>
                {s}
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    </>
  );
}


