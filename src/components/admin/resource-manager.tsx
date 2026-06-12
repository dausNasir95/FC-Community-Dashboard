import Link from "next/link";
import { archiveRecord, createRecord, togglePublished } from "@/lib/actions/admin-records";
import { AdminResourceTable } from "@/components/admin/admin-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";

type Resource = "posters" | "tournaments" | "participants" | "fixtures" | "collections";

export function ResourceManager({
  resource,
  title,
  rows,
  columns,
  searchParams,
}: {
  resource: Resource;
  title: string;
  rows: Record<string, unknown>[];
  columns: string[];
  searchParams: Record<string, string | undefined>;
}) {
  const create = createRecord.bind(null, resource);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">{title}</h1>
        <p className="mt-2 text-[#9fb6a7]">Create, search, publish, archive, and manage records with server-side validation.</p>
      </div>
      {searchParams.success ? <p className="rounded-md border border-[#39ff88]/40 bg-[#12381f] p-3 text-sm text-[#b9f7ca]">Action completed: {searchParams.success}</p> : null}
      {searchParams.error ? <p className="rounded-md border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-200">{searchParams.error}</p> : null}
      <Card>
        <CardHeader><CardTitle>Quick create</CardTitle></CardHeader>
        <CardContent>
          <form action={create} className="grid gap-4 md:grid-cols-2">
            <ResourceFields resource={resource} />
            <div className="md:col-span-2"><Button type="submit">Create {title.slice(0, -1)}</Button></div>
          </form>
        </CardContent>
      </Card>
      <AdminResourceTable
        title={`${title} table`}
        rows={rows}
        columns={columns}
        actions={(row) => (
          <>
            {["collections", "posters", "tournaments"].includes(resource) ? (
              <Button asChild variant="ghost">
                <Link href={`/admin/${resource}/${String(row.id)}`}>
                  {resource === "collections" || resource === "tournaments" ? "Manage / Edit" : "Edit"}
                </Link>
              </Button>
            ) : null}
            {["posters", "tournaments", "collections"].includes(resource) ? (
              <form action={togglePublished.bind(null, resource as "posters" | "tournaments" | "collections")}>
                <input type="hidden" name="id" value={String(row.id)} />
                <input type="hidden" name="is_published" value={String(row.is_published)} />
                <Button variant="secondary" type="submit">{row.is_published ? "Unpublish" : "Publish"}</Button>
              </form>
            ) : null}
            <form action={archiveRecord.bind(null, resource)}>
              <input type="hidden" name="id" value={String(row.id)} />
              <Button variant="danger" type="submit">Archive</Button>
            </form>
          </>
        )}
      />
    </div>
  );
}

function ResourceFields({ resource }: { resource: Resource }) {
  if (resource === "participants") {
    return (
      <>
        <Field label="Display name"><Input name="display_name" required /></Field>
        <Field label="EA ID"><Input name="ea_id" /></Field>
        <Field label="PSN ID"><Input name="psn_id" /></Field>
        <Field label="Platform"><Input name="platform" /></Field>
        <Field label="Team name"><Input name="team_name" /></Field>
        <Field label="Phone number"><Input name="phone_number" /></Field>
        <Field label="Social username"><Input name="social_username" /></Field>
        <Field label="Status"><StatusSelect name="status" values={["Active", "Inactive", "Suspended", "Archived"]} /></Field>
        <div className="md:col-span-2"><Field label="Notes"><Textarea name="notes" /></Field></div>
      </>
    );
  }
  if (resource === "fixtures") {
    return (
      <>
        <Field label="Tournament ID"><Input name="tournament_id" required /></Field>
        <Field label="Matchday"><Input name="matchday" type="number" min="1" /></Field>
        <Field label="Round"><Input name="round_name" /></Field>
        <Field label="Home participant ID"><Input name="home_participant_id" required /></Field>
        <Field label="Away participant ID"><Input name="away_participant_id" required /></Field>
        <Field label="Home score"><Input name="home_score" type="number" min="0" /></Field>
        <Field label="Away score"><Input name="away_score" type="number" min="0" /></Field>
        <Field label="Scheduled at"><Input name="scheduled_at" type="datetime-local" required /></Field>
        <Field label="Status"><StatusSelect name="status" values={["Scheduled", "Live", "Completed", "Postponed", "Cancelled"]} /></Field>
      </>
    );
  }
  const isPoster = resource === "posters";
  const isTournament = resource === "tournaments";
  if (resource === "collections") {
    return (
      <>
        <Field label="Collection title"><Input name="title" required /></Field>
        <Field label="Slug"><Input name="slug" placeholder="auto-generated when empty" /></Field>
        <div className="md:col-span-2"><Field label="Description"><Textarea name="description" required /></Field></div>
        <Field label="Category">
          <StatusSelect name="category" values={["Tournament fee", "Registration fee", "Venue fee", "Jersey payment", "Event contribution", "Prize pool", "Other"]} />
        </Field>
        <Field label="Target amount (RM)"><Input name="target_amount" type="number" min="0" step="0.01" placeholder="35.00" required /></Field>
        <Field label="Start date"><Input name="start_date" type="datetime-local" /></Field>
        <Field label="Due date"><Input name="due_date" type="datetime-local" /></Field>
        <Field label="Related tournament ID"><Input name="tournament_id" /></Field>
        <Field label="Status">
          <StatusSelect name="status" values={["Draft", "Open", "Partially Collected", "Fully Collected", "Overdue", "Closed", "Cancelled", "Archived"]} />
        </Field>
        <input type="hidden" name="currency" value="MYR" />
        <label className="flex items-center gap-2 text-sm text-[#cde8d4]"><input name="is_published" type="checkbox" value="true" /> Published</label>
      </>
    );
  }
  return (
    <>
      <Field label={isTournament ? "Name" : "Title"}><Input name={isTournament ? "name" : "title"} required /></Field>
      <Field label="Slug"><Input name="slug" placeholder="auto-generated when empty" /></Field>
      <div className="md:col-span-2"><Field label="Description"><Textarea name="description" required /></Field></div>
      <Field label={isPoster ? "Image URL" : "Cover image URL"}><Input name={isPoster ? "image_url" : "cover_image_url"} type="url" required={isPoster} /></Field>
      {isPoster ? <Field label="Event date"><Input name="event_date" type="datetime-local" required /></Field> : null}
      {isPoster ? <Field label="Category"><Input name="category" required /></Field> : null}
      {isPoster ? <Field label="Status"><StatusSelect name="status" values={["Upcoming", "Ongoing", "Completed", "Cancelled"]} /></Field> : null}
      {isTournament ? <Field label="Format"><Input name="format" required /></Field> : null}
      {isTournament ? <Field label="Rules"><Textarea name="rules" required /></Field> : null}
      {isTournament ? <Field label="Start date"><Input name="start_date" type="datetime-local" required /></Field> : null}
      {isTournament ? <Field label="End date"><Input name="end_date" type="datetime-local" required /></Field> : null}
      {isTournament ? <Field label="Registration URL"><Input name="registration_url" type="url" /></Field> : null}
      {isTournament ? <Field label="Maximum participants"><Input name="maximum_participants" type="number" min="1" /></Field> : null}
      {isTournament ? <Field label="Status"><StatusSelect name="status" values={["Draft", "Upcoming", "Ongoing", "Completed", "Cancelled", "Archived"]} /></Field> : null}
      <label className="flex items-center gap-2 text-sm text-[#cde8d4]"><input name="is_published" type="checkbox" value="true" /> Published</label>
      {isPoster ? <label className="flex items-center gap-2 text-sm text-[#cde8d4]"><input name="is_featured" type="checkbox" value="true" /> Featured</label> : null}
    </>
  );
}

function StatusSelect({ name, values }: { name: string; values: string[] }) {
  return <Select name={name} required>{values.map((value) => <option key={value}>{value}</option>)}</Select>;
}
