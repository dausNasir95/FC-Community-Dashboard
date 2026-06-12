import { EmptyState } from "@/components/ui/empty-state";
import { PosterCard } from "@/components/public/content-cards";
import { getPosters } from "@/lib/data/public";
import { toInt } from "@/lib/utils";

export default async function PostersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const posters = await getPosters({ page: toInt(params.page), status: params.status as string | undefined, search: params.search as string | undefined });
  return (
    <section className="container py-12">
      <h1 className="text-4xl font-black text-white">Posters</h1>
      <p className="mt-3 text-[#9fb6a7]">Published community posters and event announcements.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posters.rows.map((poster) => <PosterCard key={poster.id} poster={poster} />)}
      </div>
      {!posters.rows.length ? <EmptyState title="No posters found" description="Published posters will appear here." /> : null}
    </section>
  );
}
