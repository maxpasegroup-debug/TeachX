import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type DataTableProps = {
  columns: string[];
  rows: ReactNode[][];
};

export function DataTable({ columns, rows }: DataTableProps) {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted/70 text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th className="px-5 py-4 font-medium" key={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, rowIndex) => (
              <tr className="bg-surface" key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td className="px-5 py-4" key={cellIndex}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
