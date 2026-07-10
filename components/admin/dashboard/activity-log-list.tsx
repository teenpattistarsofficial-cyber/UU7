"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { describeAction, iconForAction, timeAgo } from "@/components/admin/dashboard/activity-section";

const PAGE_SIZE = 5;

export function ActivityLogList({
  entries,
}: {
  entries: { id: string; userName: string; action: string; entityLabel: string | null; createdAt: Date }[];
}) {
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(entries.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const visible = entries.slice(start, start + PAGE_SIZE);

  return (
    <div>
      <div className="space-y-1">
        {visible.map((e) => {
          const Icon = iconForAction(e.action);
          return (
            <div key={e.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-muted/40">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm">
                    <span className="font-semibold">{e.userName}</span> {describeAction(e.action, e.entityLabel)}
                  </p>
                  <p className="text-xs text-muted-foreground">{timeAgo(e.createdAt)}</p>
                </div>
              </div>
              <Badge variant="outline" className="shrink-0 text-[10px]">
                {e.action.split(".")[0].toUpperCase()}
              </Badge>
            </div>
          );
        })}
      </div>

      {pageCount > 1 && (
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <span className="text-xs text-muted-foreground">
            Page {page + 1} of {pageCount}
          </span>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-7"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-7"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
