import { z } from "zod";
import type { Fixture } from "@/types/domain";

export const fixtureInputSchema = z
  .object({
    tournament_id: z.uuid(),
    matchday: z.coerce.number().int().positive().nullable().optional(),
    round_name: z.string().max(80).nullable().optional(),
    home_participant_id: z.uuid(),
    away_participant_id: z.uuid(),
    home_score: z.coerce.number().int().min(0).nullable().optional(),
    away_score: z.coerce.number().int().min(0).nullable().optional(),
    scheduled_at: z.string().min(1, "Scheduled date is required"),
    status: z.enum(["Scheduled", "Live", "Completed", "Postponed", "Cancelled"]),
  })
  .superRefine((value, ctx) => {
    if (value.home_participant_id === value.away_participant_id) {
      ctx.addIssue({
        code: "custom",
        path: ["away_participant_id"],
        message: "Home and away participants must be different.",
      });
    }
    if (value.status === "Completed" && (value.home_score == null || value.away_score == null)) {
      ctx.addIssue({
        code: "custom",
        path: ["home_score"],
        message: "Completed matches should include both scores.",
      });
    }
  });

export function validateFixtureParticipants(
  fixture: Pick<Fixture, "home_participant_id" | "away_participant_id">,
  tournamentParticipantIds: string[],
) {
  const membership = new Set(tournamentParticipantIds);
  return membership.has(fixture.home_participant_id) && membership.has(fixture.away_participant_id);
}

export function isDuplicateFixture(
  candidate: Pick<Fixture, "tournament_id" | "home_participant_id" | "away_participant_id" | "scheduled_at">,
  fixtures: Array<Pick<Fixture, "tournament_id" | "home_participant_id" | "away_participant_id" | "scheduled_at">>,
) {
  return fixtures.some(
    (fixture) =>
      fixture.tournament_id === candidate.tournament_id &&
      fixture.scheduled_at === candidate.scheduled_at &&
      ((fixture.home_participant_id === candidate.home_participant_id &&
        fixture.away_participant_id === candidate.away_participant_id) ||
        (fixture.home_participant_id === candidate.away_participant_id &&
          fixture.away_participant_id === candidate.home_participant_id)),
  );
}
