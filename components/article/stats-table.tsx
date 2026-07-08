export type StatsTableData = { title: string; columns: string[]; rows: string[][] };

/** GEO Module — a real semantic <table>, not a screenshot, so both search
 * engines and AI assistants can actually parse the data. Wrapped in a
 * rounded/bordered card (borders moved from every cell onto row dividers
 * only) so it reads as one designed unit instead of a raw HTML table
 * dropped into the page. */
export function StatsTable({ title, columns, rows }: StatsTableData) {
  return (
    <div className="my-8 overflow-hidden rounded-xl border border-border/70">
      {title && <p className="border-b border-border/70 bg-muted/40 px-4 py-3 text-sm font-semibold">{title}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-brand/5">
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-2.5 text-left font-semibold text-foreground">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/50 last:border-b-0 even:bg-muted/20">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-2.5">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
