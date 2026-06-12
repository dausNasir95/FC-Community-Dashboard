import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { getCollectionDetail } from "@/lib/data/public";

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const detail = await getCollectionDetail(slug);
  if (!detail) notFound();
  return (
    <section className="container py-12">
      <div className="overflow-hidden rounded-lg border border-[#1d3326] bg-[#0c130f]">
        <div className="aspect-[16/6] bg-cover bg-center" style={{ backgroundImage: `url(${detail.collection.cover_image_url ?? ""})` }} />
        <div className="p-6 md:p-8">
          <StatusBadge status={detail.collection.status} />
          <h1 className="mt-4 text-4xl font-black text-white">{detail.collection.title}</h1>
          <p className="mt-3 max-w-3xl text-[#b5c8bc]">{detail.collection.description}</p>
          <p className="mt-4 text-[#39ff88]">{detail.participants.length} public participants</p>
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {detail.participants.map((row) => (
          <Card key={row.id}><CardContent className="pt-5">
            <h3 className="font-bold text-white">{row.participant?.display_name}</h3>
            <p className="text-sm text-[#9fb6a7]">{row.participant?.team_name} · {row.participant?.platform}</p>
            <p className="mt-3 text-sm text-[#cbe5d2]">{row.registration_status ?? "Registered"}</p>
          </CardContent></Card>
        ))}
      </div>
    </section>
  );
}
