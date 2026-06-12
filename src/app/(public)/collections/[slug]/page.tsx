import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { getCollectionDetail } from "@/lib/data/public";
import { formatDate } from "@/lib/utils";
import { formatMYR } from "@/lib/services/payments";

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = await getCollectionDetail(slug);
  if (!detail) notFound();
  return (
    <section className="container py-12">
      <div className="overflow-hidden rounded-lg border border-[#1d3326] bg-[#0c130f]">
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={detail.collection.status} />
            <Badge>{detail.collection.category}</Badge>
          </div>
          <h1 className="mt-4 text-4xl font-black text-white">{detail.collection.title}</h1>
          <p className="mt-3 max-w-3xl text-[#b5c8bc]">{detail.collection.description}</p>
          <p className="mt-4 text-[#39ff88]">
            {detail.collection.tournament?.name ?? "Community activity"} · Due {formatDate(detail.collection.due_date)}
          </p>
          <div className="mt-8 h-3 overflow-hidden rounded-full bg-[#17261c]">
            <div className="h-full bg-[#39ff88]" style={{ width: `${Math.min(detail.collection.progress_percentage ?? 0, 100)}%` }} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric label="Target" value={formatMYR(detail.collection.target_amount)} />
            <Metric label="Collected" value={formatMYR(detail.collection.total_collected ?? 0)} />
            <Metric label="Remaining" value={formatMYR(detail.collection.remaining_amount ?? 0)} />
            <Metric label="Progress" value={`${Math.round(detail.collection.progress_percentage ?? 0)}%`} />
          </div>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <MetricCard label="Participants" value={String(detail.collection.participant_count ?? detail.participants.length)} />
        <MetricCard label="Paid" value={String(detail.collection.paid_participant_count ?? 0)} />
        <MetricCard label="Unpaid" value={String(detail.collection.unpaid_participant_count ?? 0)} />
      </div>
      <h2 className="mt-10 text-2xl font-bold text-white">Participant payment summary</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {detail.participants.map((row) => (
          <Card key={row.id}><CardContent className="pt-5">
            <h3 className="font-bold text-white">{row.participant?.display_name}</h3>
            <p className="text-sm text-[#9fb6a7]">{row.participant?.team_name} · {row.participant?.platform}</p>
            <p className="mt-3 text-sm text-[#cbe5d2]">Required: {formatMYR(row.required_amount)}</p>
            <p className="text-sm text-[#cbe5d2]">Outstanding: {formatMYR(row.outstanding_amount ?? row.required_amount)}</p>
            <div className="mt-3"><StatusBadge status={row.payment_status} /></div>
          </CardContent></Card>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-sm text-[#8fa298]">{label}</p><p className="mt-1 text-xl font-black text-white">{value}</p></div>;
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return <Card><CardContent className="pt-5"><p className="text-sm text-[#8fa298]">{label}</p><p className="mt-2 text-3xl font-black text-[#39ff88]">{value}</p></CardContent></Card>;
}
