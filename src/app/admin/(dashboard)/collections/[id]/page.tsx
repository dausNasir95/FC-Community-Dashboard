import { notFound } from "next/navigation";
import { addCollectionParticipant, updateCollectionParticipant } from "@/lib/actions/admin-records";
import { getAdminCollectionDetail } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";
import { formatMYR } from "@/lib/services/payments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { StatusBadge } from "@/components/ui/badge";

const paymentStatuses = ["Unpaid", "Partially Paid", "Paid", "Overpaid", "Waived", "Refunded", "Cancelled"];

export default async function AdminCollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const detail = await getAdminCollectionDetail(id);
  if (!detail.collection) notFound();
  const assignedIds = new Set(detail.collectionParticipants.map((row) => row.participant_id));
  const availableParticipants = detail.participants.filter((participant) => !assignedIds.has(participant.id));
  const addParticipant = addCollectionParticipant.bind(null, id);
  const updateParticipant = updateCollectionParticipant.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[#39ff88]">Payment collection</p>
        <h1 className="text-3xl font-black text-white">{detail.collection.title}</h1>
        <p className="mt-2 text-[#9fb6a7]">
          {detail.collection.category} · Target {formatMYR(toCents(detail.collection.target_amount))} · Due{" "}
          {formatDate(detail.collection.due_date)}
        </p>
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
          <CardTitle>Add participant to collection</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addParticipant} className="grid gap-4 md:grid-cols-2">
            <Field label="Participant">
              <Select name="participant_id" required>
                <option value="">Select participant</option>
                {availableParticipants.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    {participant.display_name} {participant.ea_id ? `(${participant.ea_id})` : ""}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Required amount (sen)">
              <Input name="required_amount" type="number" min="0" step="1" placeholder="5000 = RM50.00" required />
            </Field>
            <Field label="Due date">
              <Input name="due_date" type="datetime-local" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Admin notes">
                <Textarea name="admin_notes" placeholder="Internal notes, not shown publicly" />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Add participant</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned participants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {detail.collectionParticipants.map((row) => (
            <form key={row.id} action={updateParticipant} className="rounded-lg border border-[#1d3326] p-4">
              <input type="hidden" name="id" value={row.id} />
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-white">{row.participant?.display_name ?? row.participant_id}</h3>
                  <p className="text-sm text-[#8fa298]">
                    {row.participant?.team_name ?? "No team"} · {row.participant?.platform ?? "No platform"}
                  </p>
                </div>
                <StatusBadge status={row.payment_status} />
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <Field label="Required amount (sen)">
                  <Input name="required_amount" type="number" min="0" step="1" defaultValue={String(toCents(row.required_amount))} />
                </Field>
                <Field label="Payment status">
                  <Select name="payment_status" defaultValue={row.payment_status}>
                    {paymentStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Due date">
                  <Input name="due_date" type="datetime-local" defaultValue={row.due_date?.slice(0, 16) ?? ""} />
                </Field>
                <label className="mt-7 flex items-center gap-2 text-sm text-[#cde8d4]">
                  <input name="is_waived" type="checkbox" value="true" defaultChecked={row.is_waived} /> Waived
                </label>
                <div className="md:col-span-4">
                  <Field label="Admin notes">
                    <Textarea name="admin_notes" defaultValue={row.admin_notes ?? ""} />
                  </Field>
                </div>
                <div className="md:col-span-4">
                  <Button type="submit" variant="secondary">
                    Save entry
                  </Button>
                </div>
              </div>
            </form>
          ))}
          {!detail.collectionParticipants.length ? (
            <p className="rounded-md border border-[#1d3326] p-4 text-sm text-[#9fb6a7]">
              No participants assigned yet. Add one above to start tracking required amount and payment status.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function toCents(amount: number) {
  return Number.isInteger(amount) && amount > 1000 ? amount : Math.round(amount * 100);
}
