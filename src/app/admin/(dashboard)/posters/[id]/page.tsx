import { notFound } from "next/navigation";
import { updateRecord } from "@/lib/actions/admin-records";
import { getAdminRecord, type EditablePoster } from "@/lib/data/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";

export default async function AdminPosterEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const poster = (await getAdminRecord("posters", id)) as EditablePoster | null;
  if (!poster) notFound();
  const updatePoster = updateRecord.bind(null, "posters", id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[#39ff88]">Poster editor</p>
        <h1 className="text-3xl font-black text-white">{poster.title}</h1>
        <p className="mt-2 text-[#9fb6a7]">Edit poster fields, image URL, status, featured flag, and publish state.</p>
      </div>

      {query.success ? (
        <p className="rounded-md border border-[#39ff88]/40 bg-[#12381f] p-3 text-sm text-[#b9f7ca]">
          Action completed: {query.success}
        </p>
      ) : null}
      {query.error ? (
        <p className="rounded-md border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-200">{query.error}</p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Edit poster fields</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updatePoster} className="grid gap-4 md:grid-cols-2">
            <Field label="Title">
              <Input name="title" required defaultValue={poster.title} />
            </Field>
            <Field label="Slug">
              <Input name="slug" required defaultValue={poster.slug} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <Textarea name="description" required defaultValue={poster.description} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Image URL">
                <Input name="image_url" type="url" required defaultValue={poster.image_url} />
              </Field>
            </div>
            <Field label="Event date">
              <Input name="event_date" type="datetime-local" required defaultValue={poster.event_date.slice(0, 16)} />
            </Field>
            <Field label="Category">
              <Input name="category" required defaultValue={poster.category} />
            </Field>
            <Field label="Status">
              <Select name="status" required defaultValue={poster.status}>
                {["Upcoming", "Ongoing", "Completed", "Cancelled"].map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </Select>
            </Field>
            <label className="mt-7 flex items-center gap-2 text-sm text-[#cde8d4]">
              <input name="is_published" type="checkbox" value="true" defaultChecked={poster.is_published} /> Published
            </label>
            <label className="flex items-center gap-2 text-sm text-[#cde8d4]">
              <input name="is_featured" type="checkbox" value="true" defaultChecked={poster.is_featured} /> Featured
            </label>
            <div className="md:col-span-2">
              <Button type="submit">Save poster</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
