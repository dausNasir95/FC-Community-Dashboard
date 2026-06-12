import { ResourceManager } from "@/components/admin/resource-manager";
import { listAdminTable } from "@/lib/data/admin";
import { toInt } from "@/lib/utils";

export default async function AdminParticipantsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const data = await listAdminTable("participants", { page: toInt(params.page), search: params.search, status: params.status });
  return <ResourceManager resource="participants" title="Participants" rows={data.rows as Record<string, unknown>[]} columns={["display_name", "ea_id", "psn_id", "platform", "status"]} searchParams={params} />;
}
