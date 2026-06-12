import { ResourceManager } from "@/components/admin/resource-manager";
import { listAdminTable } from "@/lib/data/admin";
import { toInt } from "@/lib/utils";

export default async function AdminCollectionsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const data = await listAdminTable("collections", { page: toInt(params.page), search: params.search, status: params.status });
  return <ResourceManager resource="collections" title="Collections" rows={data.rows as Record<string, unknown>[]} columns={["title", "category", "target_amount", "status", "is_published", "due_date"]} searchParams={params} />;
}
