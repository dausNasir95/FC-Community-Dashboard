import { CollectionCard } from "@/components/public/content-cards";
import { getCollections } from "@/lib/data/public";

export default async function CollectionsPage() {
  const collections = await getCollections();
  return (
    <section className="container py-12">
      <h1 className="text-4xl font-black text-white">Collections</h1>
      <p className="mt-3 text-[#9fb6a7]">Published payment collection campaigns and public-safe collection summaries.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {collections.rows.map((collection) => <CollectionCard key={collection.id} collection={collection} />)}
      </div>
    </section>
  );
}
