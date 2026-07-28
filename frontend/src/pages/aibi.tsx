import Head from "next/head";
import { ExternalLink, Sparkles } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const EMBED_URL =
  "https://dbc-30ce87c7-eef3.cloud.databricks.com/embed/dashboardsv3/01f187c195421ea29f213a25f957ce8c?o=7474657759892507";

const FULL_URL =
  "https://dbc-30ce87c7-eef3.cloud.databricks.com/sql/dashboardsv3/01f187c195421ea29f213a25f957ce8c?o=7474657759892507";

export default function AiBiPage() {
  return (
    <>
      <Head>
        <title>AI/BI Dashboard – DataForge</title>
        <meta
          name="description"
          content="Interactive Databricks AI/BI embedded dashboard – Gold layer analytics."
        />
      </Head>

      <AppLayout>
        <div className="flex flex-col h-full p-6 gap-4">
          {/* Header */}
          <div className="flex items-center justify-between animate-fade-in shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white leading-tight">AI/BI Dashboard</h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  Embedded Databricks AI/BI · Gold layer · live data
                </p>
              </div>
            </div>
            <a
              href={FULL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost gap-2 text-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Databricks
            </a>
          </div>

          {/* Iframe embed */}
          <div className="flex-1 glass rounded-2xl overflow-hidden animate-slide-up opacity-0"
               style={{ animationFillMode: "forwards", minHeight: "600px" }}>
            <iframe
              src={EMBED_URL}
              width="100%"
              height="100%"
              frameBorder="0"
              title="Databricks AI/BI Dashboard"
              style={{ minHeight: "600px", display: "block" }}
              allowFullScreen
            />
          </div>
        </div>
      </AppLayout>
    </>
  );
}
