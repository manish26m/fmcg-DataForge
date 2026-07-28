import { useCallback, useRef, useEffect, useState } from "react";

/**
 * usePolling – repeatedly calls `fetchFn` every `intervalMs` milliseconds.
 * Stops polling when `shouldStop` returns true.
 *
 * Usage:
 *   const { data, loading, error } = usePolling(
 *     () => getPipelineStatus(runId),
 *     (data) => data?.state === "TERMINATED",
 *     5000
 *   );
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  shouldStop: (data: T | null) => boolean,
  intervalMs: number = 5000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const poll = useCallback(async () => {
    try {
      const result = await fetchFn();
      if (!mountedRef.current) return;
      setData(result);
      setError(null);
      setLoading(false);

      if (!shouldStop(result)) {
        timerRef.current = setTimeout(poll, intervalMs);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
      // Retry even on error
      timerRef.current = setTimeout(poll, intervalMs);
    }
  }, [fetchFn, shouldStop, intervalMs]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;
    poll();
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [poll]);

  return { data, loading, error };
}
