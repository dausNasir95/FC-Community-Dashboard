import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";

export function AdminResourceTable({
  title,
  rows,
  columns,
  actions,
}: {
  title: string;
  rows: Record<string, unknown>[];
  columns: string[];
  actions?: (row: Record<string, unknown>) => ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-[#8fa298]">{rows.length} loaded</p>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <input name="search" placeholder="Search records" className="h-10 rounded-md border border-[#294434] bg-[#07100b] px-3 text-sm text-white" />
          <select name="status" className="h-10 rounded-md border border-[#294434] bg-[#07100b] px-3 text-sm text-white">
            <option value="">All statuses</option>
            <option>Active</option>
            <option>Upcoming</option>
            <option>Ongoing</option>
            <option>Completed</option>
            <option>Archived</option>
          </select>
        </div>
        <Table>
          <thead>
            <tr>
              {columns.map((column) => (
                <Th key={column}>{column.replaceAll("_", " ")}</Th>
              ))}
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={String(row.id ?? index)}>
                {columns.map((column) => (
                  <Td key={column}>
                    {column === "status" && typeof row[column] === "string" ? (
                      <StatusBadge status={row[column]} />
                    ) : column.includes("date") || column.includes("_at") ? (
                      formatDateTime(String(row[column] ?? ""))
                    ) : (
                      String(row[column] ?? "")
                    )}
                  </Td>
                ))}
                <Td>
                  <div className="flex flex-wrap gap-2">{actions?.(row)}</div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardContent>
    </Card>
  );
}
