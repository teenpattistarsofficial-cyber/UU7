import { Wifi, Monitor, Smartphone, Tablet } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const DEVICE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function RecentVisitorsSection({
  visitors,
  deviceBreakdown,
}: {
  visitors: { visitorId: string; ip: string | null; device: string; path: string; lastSeen: Date; visits: number }[];
  deviceBreakdown: { device: string; count: number; pct: number }[];
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <Wifi className="size-3.5 text-brand" />
          Recent Visitors
        </h3>
        {visitors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No visitors tracked yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP Address</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Last Page</TableHead>
                <TableHead className="text-right">Visits</TableHead>
                <TableHead className="text-right">Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitors.map((v) => {
                const Icon = DEVICE_ICON[v.device] ?? Monitor;
                return (
                  <TableRow key={v.visitorId}>
                    <TableCell className="font-mono text-sm">{v.ip || "—"}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                        <Icon className="size-3.5" />
                        {v.device[0].toUpperCase() + v.device.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">{v.path}</TableCell>
                    <TableCell className="text-right font-semibold">{v.visits}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{timeAgo(v.lastSeen)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <Monitor className="size-3.5 text-brand" />
          Device Breakdown
        </h3>
        {deviceBreakdown.length === 0 ? (
          <p className="text-sm text-muted-foreground">No visits tracked yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {deviceBreakdown.map((d) => {
              const Icon = DEVICE_ICON[d.device] ?? Monitor;
              return (
                <div key={d.device} className="flex min-w-[220px] flex-1 items-center gap-3 rounded-lg bg-muted/40 p-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{d.device[0].toUpperCase() + d.device.slice(1)}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-brand" style={{ width: `${d.pct}%` }} />
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">{d.pct}%</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-lg font-bold text-brand">{d.count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
