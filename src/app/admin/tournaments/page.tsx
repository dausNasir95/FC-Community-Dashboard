import { ResourceManager } from "@/components/admin/resource-manager";
import { listAdminTable } from "@/lib/data/admin";
import { toInt } from "@/lib/utils";

export default async function AdminTournamentsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const data = await listAdminTable("tournaments", { page: toInt(params.page), search: params.search, status: params.status });
  return <ResourceManager resource="tournaments" title="Tournaments" rows={data.rows as Record<string, unknown>[]} columns={["name", "format", "status", "is_published", "start_date"]} searchParams={params} />;
}
