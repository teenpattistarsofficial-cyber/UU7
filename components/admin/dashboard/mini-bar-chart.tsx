"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export function MiniBarChart({ data, color = "var(--brand)" }: { data: { label: string; count: number }[]; color?: string }) {
  const hasData = data.some((d) => d.count > 0);
  if (!hasData) {
    return <p className="flex h-32 items-center justify-center text-sm text-muted-foreground">No activity yet.</p>;
  }
  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
