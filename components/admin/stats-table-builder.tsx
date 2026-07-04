"use client";

import { Plus, Trash2, ChevronUp, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export type StatsTableItem = { title: string; columns: string[]; rows: string[][] };

const EMPTY_TABLE: StatsTableItem = { title: "", columns: ["Column 1", "Column 2"], rows: [["", ""]] };

/** GEO Module — real semantic <table> data the writer fills in as a small
 * grid, instead of pasting a screenshot of a spreadsheet. A post can have
 * more than one (e.g. separate "RTP by Game" and "Deposit Limits" tables). */
export function StatsTableBuilder({ value, onChange }: { value: StatsTableItem[]; onChange: (tables: StatsTableItem[]) => void }) {
  function updateTable(index: number, patch: Partial<StatsTableItem>) {
    onChange(value.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function removeTable(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function moveTable(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function addTable() {
    onChange([...value, { ...EMPTY_TABLE, columns: [...EMPTY_TABLE.columns], rows: EMPTY_TABLE.rows.map((r) => [...r]) }]);
  }

  function addColumn(tableIndex: number) {
    const table = value[tableIndex];
    updateTable(tableIndex, {
      columns: [...table.columns, `Column ${table.columns.length + 1}`],
      rows: table.rows.map((row) => [...row, ""]),
    });
  }

  function removeColumn(tableIndex: number, colIndex: number) {
    const table = value[tableIndex];
    if (table.columns.length <= 1) return;
    updateTable(tableIndex, {
      columns: table.columns.filter((_, i) => i !== colIndex),
      rows: table.rows.map((row) => row.filter((_, i) => i !== colIndex)),
    });
  }

  function updateColumnHeader(tableIndex: number, colIndex: number, header: string) {
    const table = value[tableIndex];
    updateTable(tableIndex, { columns: table.columns.map((c, i) => (i === colIndex ? header : c)) });
  }

  function addRow(tableIndex: number) {
    const table = value[tableIndex];
    updateTable(tableIndex, { rows: [...table.rows, table.columns.map(() => "")] });
  }

  function removeRow(tableIndex: number, rowIndex: number) {
    const table = value[tableIndex];
    updateTable(tableIndex, { rows: table.rows.filter((_, i) => i !== rowIndex) });
  }

  function updateCell(tableIndex: number, rowIndex: number, colIndex: number, cellValue: string) {
    const table = value[tableIndex];
    updateTable(tableIndex, {
      rows: table.rows.map((row, i) => (i === rowIndex ? row.map((c, j) => (j === colIndex ? cellValue : c)) : row)),
    });
  }

  return (
    <div className="space-y-4">
      {value.map((table, tableIndex) => (
        <div key={tableIndex} className="space-y-2.5 rounded-lg border border-border p-3">
          <div className="flex items-center gap-1.5">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => moveTable(tableIndex, -1)}
                disabled={tableIndex === 0}
                className="text-muted-foreground disabled:opacity-30"
              >
                <ChevronUp className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveTable(tableIndex, 1)}
                disabled={tableIndex === value.length - 1}
                className="text-muted-foreground disabled:opacity-30"
              >
                <ChevronDown className="size-3.5" />
              </button>
            </div>
            <Input
              placeholder="Table title"
              value={table.title}
              onChange={(e) => updateTable(tableIndex, { title: e.target.value })}
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => removeTable(tableIndex)}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title="Remove table"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  {table.columns.map((col, colIndex) => (
                    <th key={colIndex} className="p-0.5">
                      <div className="flex items-center gap-0.5">
                        <Input
                          value={col}
                          onChange={(e) => updateColumnHeader(tableIndex, colIndex, e.target.value)}
                          className="h-7 text-xs font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => removeColumn(tableIndex, colIndex)}
                          disabled={table.columns.length <= 1}
                          className="shrink-0 text-muted-foreground hover:text-destructive disabled:opacity-30"
                          title="Remove column"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="w-8 p-0.5">
                    <button type="button" onClick={() => addColumn(tableIndex)} title="Add column" className="text-muted-foreground hover:text-foreground">
                      <Plus className="size-3.5" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="p-0.5">
                        <Input
                          value={cell}
                          onChange={(e) => updateCell(tableIndex, rowIndex, colIndex, e.target.value)}
                          className="h-7 text-xs"
                        />
                      </td>
                    ))}
                    <td className="p-0.5 text-center">
                      <button type="button" onClick={() => removeRow(tableIndex, rowIndex)} title="Remove row" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => addRow(tableIndex)} className="gap-1.5">
            <Plus className="size-3.5" />
            Add row
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addTable} className="gap-1.5">
        <Plus className="size-4" />
        Add stats table
      </Button>

      {value.length === 0 && <p className="text-xs text-muted-foreground">No stats tables yet.</p>}
    </div>
  );
}
