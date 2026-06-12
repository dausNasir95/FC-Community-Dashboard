export function hasDuplicateAssignment<T extends { participant_id: string }>(rows: T[], participantId: string) {
  return rows.some((row) => row.participant_id === participantId);
}

export function findParticipantDuplicate(
  candidate: { display_name: string; ea_id?: string | null; psn_id?: string | null },
  rows: Array<{ display_name: string; ea_id?: string | null; psn_id?: string | null }>,
) {
  const norm = (value?: string | null) => value?.trim().toLowerCase();
  return rows.find(
    (row) =>
      (candidate.ea_id && norm(candidate.ea_id) === norm(row.ea_id)) ||
      (candidate.psn_id && norm(candidate.psn_id) === norm(row.psn_id)) ||
      norm(candidate.display_name) === norm(row.display_name),
  );
}
