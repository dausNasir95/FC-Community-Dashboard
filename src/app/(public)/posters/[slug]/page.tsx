import { notFound } from "next/navigation";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { getPosterBySlug } from "@/lib/data/public";

export default async function PosterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const poster = await getPosterBySlug(slug);
  if (!poster) notFound();
  return (
    <article className="container py-12">
      <div className="overflow-hidden rounded-lg border border-[#1d3326] bg-[#0c130f]">
        <div className="aspect-[16/7] bg-cover bg-center" style={{ backgroundImage: `url(${poster.image_url})` }} />
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={poster.status} />
            <Badge>{poster.category}</Badge>
            {poster.is_featured ? <Badge>Featured</Badge> : null}
            {poster.is_published ? <Badge>Published</Badge> : null}
          </div>
          <h1 className="mt-4 text-4xl font-black text-white">{poster.title}</h1>
          <p className="mt-4 max-w-3xl text-lg text-[#b5c8bc]">{poster.description}</p>
          <dl className="mt-8 grid gap-4 text-sm md:grid-cols-3">
            <Info label="Event date" value={formatDate(poster.event_date)} />
            <Info label="Created" value={formatDateTime(poster.created_at)} />
            <Info label="Updated" value={formatDateTime(poster.updated_at)} />
          </dl>
        </div>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[#8fa298]">{label}</dt><dd className="mt-1 font-semibold text-white">{value}</dd></div>;
}
