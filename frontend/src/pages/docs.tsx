import Head from "next/head";
import AppLayout from "@/components/AppLayout";

const sections = [
  {
    title: "Medallion Architecture",
    content: `The Medallion Architecture organises data into three layers:

**Bronze** – Raw data is ingested from the source (CSV files via S3) with minimal or no transformation. This is the landing zone for all data.

**Silver** – Data is cleaned, deduplicated, and standardised. Business rules are applied (e.g. column renaming, type casting, null handling). Validated records flow downstream.

**Gold** – Business-ready data lives here as a Star Schema (fact + dimension tables). Incremental MERGE operations ensure idempotency. Analytics queries run against this layer.`,
  },
  {
    title: "Delta Lake & MERGE",
    content: `Delta Lake provides ACID transactions on top of cloud storage. The pipeline uses MERGE (upsert) to handle incremental loads:

\`\`\`sql
MERGE INTO gold.fact_orders AS target
USING staging AS source
ON target.order_id = source.order_id
WHEN MATCHED THEN UPDATE SET ...
WHEN NOT MATCHED THEN INSERT ...
\`\`\`

This guarantees no duplicate rows and supports late-arriving data without a full reload.`,
  },
  {
    title: "Star Schema",
    content: `The Gold layer implements a Star Schema:

**Fact table** – \`fact_orders\` (order_id, order_placement_date, customer_id, product_id, order_qty)

**Dimensions** – \`dim_customers\`, \`dim_products\`, \`dim_product_pricing\`, \`dim_date\`

Dimension tables support Slowly Changing Dimensions (SCD) type 1 overwrite via MERGE.`,
  },
  {
    title: "SQL Views",
    content: `Business-friendly views are created over Gold tables to power the dashboard:

- \`vw_kpis\` – Total revenue, orders, avg order value
- \`vw_revenue_by_month\` – Monthly aggregated revenue
- \`vw_revenue_by_category\` – Revenue per product category
- \`vw_top_products\` – Best-selling products by revenue
- \`vw_top_customers\` – Highest-spend customers
- \`vw_city_revenue\` – Revenue distribution by city

The FastAPI backend queries these views via the Databricks SQL API and returns JSON to the frontend.`,
  },
  {
    title: "Data Lineage",
    content: `Every data asset can be traced back to its source:

S3 CSV files → Bronze Delta table → Silver Delta table → Gold fact/dim tables → SQL Views → Dashboard charts

This lineage ensures auditability: you can always answer "where did this number come from?" by traversing the pipeline from Gold back to the raw CSV.`,
  },
  {
    title: "API Integration",
    content: `The website communicates with Databricks using two official APIs:

**Jobs API 2.0** (trigger & monitor)
\`POST https://<workspace>/api/2.0/jobs/run-now\`
\`GET  https://<workspace>/api/2.0/jobs/runs/get\`

**SQL Statements API 2.0** (dashboard data)
\`POST https://<workspace>/api/2.0/sql/statements\`

Both use a **Personal Access Token (PAT)** stored as an environment variable – never exposed to the client browser.`,
  },
];

export default function DocsPage() {
  return (
    <>
      <Head>
        <title>Documentation – DataForge</title>
        <meta name="description" content="Technical documentation for the DataForge FMCG Medallion Architecture platform." />
      </Head>

      <AppLayout>
        <div className="p-8 max-w-3xl mx-auto space-y-8">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">Documentation</h1>
            <p className="text-slate-400 text-sm">
              Technical reference for the DataForge platform and the underlying
              Databricks Medallion Architecture.
            </p>
          </div>

          {sections.map(({ title, content }, i) => (
            <div
              key={title}
              className="glass p-6 rounded-2xl animate-slide-up opacity-0"
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
            >
              <h2 className="text-lg font-semibold text-brand-300 mb-4">{title}</h2>
              <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
                {content.split("\n\n").map((para, j) => {
                  if (para.startsWith("```")) {
                    const code = para.replace(/```sql\n?/, "").replace(/```/, "").trim();
                    return (
                      <pre key={j} className="bg-white/5 rounded-xl p-4 overflow-x-auto text-xs font-mono text-cyan-300 my-3">
                        {code}
                      </pre>
                    );
                  }
                  return (
                    <p key={j} className="mb-3 last:mb-0"
                       dangerouslySetInnerHTML={{
                         __html: para
                           .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                           .replace(/`(.+?)`/g, '<code class="bg-white/10 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
                           .replace(/\n/g, "<br/>"),
                       }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </AppLayout>
    </>
  );
}
