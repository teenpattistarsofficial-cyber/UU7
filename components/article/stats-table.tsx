export type StatsTableData = { title: string; columns: string[]; rows: string[][] };

/** GEO Module — a real semantic <table>, not a screenshot, so both search
 * engines and AI assistants can actually parse the data. */
export function StatsTable({ title, columns, rows }: StatsTableData) {
  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {title && <caption className="mb-2 text-left text-sm font-semibold">{title}</caption>}
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="border border-border bg-muted px-3 py-2 text-left font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border border-border px-3 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
