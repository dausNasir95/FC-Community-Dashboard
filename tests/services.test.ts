import { describe, expect, it } from "vitest";
import { fixtureInputSchema, isDuplicateFixture, validateFixtureParticipants } from "@/lib/services/fixtures";
import { hasDuplicateAssignment } from "@/lib/services/duplicates";
import { sanitizeParticipant } from "@/lib/services/sanitize";
import { isAdminRole } from "@/lib/permissions/admin";
import { recalculateStandings } from "@/lib/services/standings";
import type { Fixture, Participant, PublicParticipant } from "@/types/domain";

const players: PublicParticipant[] = [
  { id: "p1", display_name: "Alpha", ea_id: "A", psn_id: null, platform: "PS5", team_name: "A FC", social_username: null, status: "Active" },
  { id: "p2", display_name: "Bravo", ea_id: "B", psn_id: null, platform: "PS5", team_name: "B FC", social_username: null, status: "Active" },
];

describe("fixture validation", () => {
  it("rejects same home and away participant", () => {
    const result = fixtureInputSchema.safeParse({
      tournament_id: "11111111-1111-1111-1111-111111111111",
      home_participant_id: "22222222-2222-2222-2222-222222222222",
      away_participant_id: "22222222-2222-2222-2222-222222222222",
      scheduled_at: "2026-07-01T20:00",
      status: "Scheduled",
    });
    expect(result.success).toBe(false);
  });

  it("requires both participants to belong to selected tournament", () => {
    expect(validateFixtureParticipants({ home_participant_id: "p1", away_participant_id: "p2" }, ["p1"])).toBe(false);
  });

  it("detects accidental duplicate fixtures", () => {
    const fixture = { tournament_id: "t1", home_participant_id: "p1", away_participant_id: "p2", scheduled_at: "2026-07-01" };
    expect(isDuplicateFixture(fixture, [fixture])).toBe(true);
  });
});

describe("duplicate assignments", () => {
  it("prevents duplicate tournament and collection participants", () => {
    expect(hasDuplicateAssignment([{ participant_id: "p1" }], "p1")).toBe(true);
    expect(hasDuplicateAssignment([{ participant_id: "p1" }], "p2")).toBe(false);
  });
});

describe("standings calculation", () => {
  it("calculates match results and applies manual adjustments", () => {
    const fixtures: Fixture[] = [
      {
        id: "f1",
        tournament_id: "t1",
        matchday: 1,
        round_name: null,
        home_participant_id: "p1",
        away_participant_id: "p2",
        home_score: 2,
        away_score: 2,
        scheduled_at: "2026-07-01",
        status: "Completed",
      },
      {
        id: "f2",
        tournament_id: "t1",
        matchday: 2,
        round_name: null,
        home_participant_id: "p1",
        away_participant_id: "p2",
        home_score: 3,
        away_score: 1,
        scheduled_at: "2026-07-02",
        status: "Completed",
      },
    ];
    const standings = recalculateStandings("t1", players, fixtures, [{ participant_id: "p2", manual_adjustment: 2, position: null }]);
    expect(standings[0].participant_id).toBe("p1");
    expect(standings[0].points).toBe(4);
    expect(standings[1].points).toBe(3);
  });
});

describe("public data safety", () => {
  it("removes private participant fields from public participant records", () => {
    const participant: Participant = {
      ...players[0],
      phone_number: "555",
      notes: "private",
      created_by: "admin",
      created_at: "now",
      updated_at: "now",
    };
    expect(sanitizeParticipant(participant)).not.toHaveProperty("phone_number");
    expect(sanitizeParticipant(participant)).not.toHaveProperty("notes");
    expect(sanitizeParticipant(participant)).not.toHaveProperty("created_by");
  });
});

describe("admin authorization helpers", () => {
  it("recognizes only supported admin roles", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("viewer")).toBe(false);
  });
});
