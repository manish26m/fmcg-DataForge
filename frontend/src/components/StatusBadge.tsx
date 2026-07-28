import { clsx } from "clsx";

type Status = "pending" | "running" | "success" | "failed" | "queued" | "QUEUED" | "RUNNING" | "TERMINATED";

const MAP: Record<string, string> = {
  pending:    "badge-pending",
  queued:     "badge-queued",
  QUEUED:     "badge-queued",
  running:    "badge-running",
  RUNNING:    "badge-running",
  success:    "badge-success",
  SUCCESS:    "badge-success",
  TERMINATED: "badge-success",
  failed:     "badge-failed",
  FAILED:     "badge-failed",
};

const LABEL: Record<string, string> = {
  pending:    "Pending",
  queued:     "Queued",
  QUEUED:     "Queued",
  running:    "Running",
  RUNNING:    "Running",
  success:    "Success",
  SUCCESS:    "Success",
  TERMINATED: "Completed",
  failed:     "Failed",
  FAILED:     "Failed",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        MAP[status] ?? "badge-pending"
      )}
    >
      {status === "running" || status === "RUNNING" ? (
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
      ) : null}
      {LABEL[status] ?? status}
    </span>
  );
}
