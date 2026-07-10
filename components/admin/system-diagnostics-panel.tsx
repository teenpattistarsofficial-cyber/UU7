"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Activity, RefreshCw, Server, Database, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runSystemDiagnostics } from "@/lib/actions/diagnostics";
import { ControlCard } from "@/components/admin/control-card";

type DiagnosticsResult = Awaited<ReturnType<typeof runSystemDiagnostics>>;

function formatUptime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function SystemDiagnosticsPanel() {
  const [result, setResult] = useState<DiagnosticsResult | null>(null);
  const [apiLatencyMs, setApiLatencyMs] = useState<number | null>(null);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [pending, startTransition] = useTransition();

  function handleRunCheck() {
    startTransition(async () => {
      const start = performance.now();
      try {
        const data = await runSystemDiagnostics();
        const now = new Date();
        setApiLatencyMs(Math.round(performance.now() - start));
        setResult(data);
        setCheckedAt(now);
        setStartedAt(new Date(now.getTime() - data.uptimeSeconds * 1000));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Diagnostics check failed");
      }
    });
  }

  return (
    <ControlCard
      icon={Activity}
      iconClassName="bg-indigo-500/10 text-indigo-600"
      title="System Diagnostics"
      description="Check server, database & API health in real time."
      action={
        <Button
          type="button"
          onClick={handleRunCheck}
          disabled={pending}
          className="gap-1.5 rounded-full bg-indigo-600 px-5 text-white hover:bg-indigo-600/90"
        >
          <RefreshCw className={pending ? "size-4 animate-spin" : "size-4"} />
          {pending ? "Checking…" : "Run check"}
        </Button>
      }
    >
      {result && (
        <div className="border-t border-border px-5 py-4">
          <div className="space-y-3">
            <DiagnosticRow
              icon={Server}
              label="API Server"
              subtitle={`Node ${result.nodeVersion} · ${result.env}`}
              value="Online"
              tone="emerald"
            />
            <DiagnosticRow
              icon={Database}
              label="Database"
              subtitle={result.dbOk ? `${result.dbLatencyMs} ms query latency` : "Query failed"}
              value={result.dbOk ? "Connected" : "Error"}
              tone={result.dbOk ? "emerald" : "destructive"}
            />
            {apiLatencyMs !== null && (
              <DiagnosticRow
                icon={Activity}
                label="API Latency"
                subtitle={apiLatencyMs < 200 ? "Excellent" : apiLatencyMs < 800 ? "Good" : "Slow"}
                value={`${apiLatencyMs} ms`}
                tone="emerald"
              />
            )}
            <DiagnosticRow
              icon={Clock}
              label="Server Uptime"
              subtitle={startedAt ? `Since ${startedAt.toLocaleTimeString()}` : ""}
              value={formatUptime(result.uptimeSeconds)}
              tone="blue"
            />
          </div>
          {checkedAt && (
            <p className="mt-3 text-right text-xs text-muted-foreground">Checked at {checkedAt.toLocaleTimeString()}</p>
          )}
        </div>
      )}
    </ControlCard>
  );
}

function DiagnosticRow({
  icon: Icon,
  label,
  subtitle,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  subtitle: string;
  value: string;
  tone: "emerald" | "blue" | "destructive";
}) {
  const toneClass = tone === "emerald" ? "text-emerald-600" : tone === "blue" ? "text-blue-600" : "text-destructive";
  const StatusIcon = tone === "destructive" ? XCircle : CheckCircle2;
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className={cnTone(tone)} />
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className={`flex items-center gap-1.5 font-semibold ${toneClass}`}>
        {value}
        <StatusIcon className="size-4" />
      </div>
    </div>
  );
}

function cnTone(tone: "emerald" | "blue" | "destructive") {
  return tone === "emerald" ? "size-4 text-emerald-600" : tone === "blue" ? "size-4 text-blue-600" : "size-4 text-destructive";
}
