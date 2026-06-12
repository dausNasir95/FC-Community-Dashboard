import { ResourceManager } from "@/components/admin/resource-manager";
import { listAdminTable } from "@/lib/data/admin";
import { toInt } from "@/lib/utils";

export default async function AdminFixturesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const data = await listAdminTable("fixtures", { page: toInt(params.page), search: params.search, status: params.status });
  return <ResourceManager resource="fixtures" title="Fixtures" rows={data.rows as Record<string, unknown>[]} columns={["matchday", "round_name", "status", "scheduled_at"]} searchParams={params} />;
}
