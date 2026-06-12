import { describe, expect, it } from "vitest";
import { fixtureInputSchema, isDuplicateFixture, validateFixtureParticipants } from "@/lib/services/fixtures";
import { hasDuplicateAssignment } from "@/lib/services/duplicates";
import { sanitizeParticipant } from "@/lib/services/sanitize";
import { isAdminRole } from "@/lib/permissions/admin";
import { calculateCollectionSummary, calculateParticipantPayment, formatMYR } from "@/lib/services/payments";
import { recalculateStandings } from "@/lib/services/standings";
import type { Collection, CollectionParticipant, Fixture, Participant, Payment, PublicParticipant } from "@/types/domain";

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

describe("payment collection calculations", () => {
  const collection: Collection = {
    id: "c1",
    title: "Registration Fee",
    slug: "registration-fee",
    description: "Season payment campaign",
    category: "Registration fee",
    currency: "MYR",
    target_amount: 10000,
    start_date: null,
    due_date: null,
    tournament_id: null,
    status: "Open",
    is_published: true,
    created_at: "now",
    updated_at: "now",
  };
  const collectionParticipants: CollectionParticipant[] = players.map((player) => ({
    id: `cp-${player.id}`,
    collection_id: "c1",
    participant_id: player.id,
    required_amount: 5000,
    payment_status: "Unpaid",
    due_date: null,
    is_waived: false,
    joined_at: "now",
    updated_at: "now",
    participant: player,
  }));
  const basePayment = {
    collection_id: "c1",
    payment_date: "now",
    payment_method: "Cash" as const,
    payment_reference: "private-ref",
    receipt_url: "private-receipt",
    verified_by: "admin",
    verified_at: "now",
    internal_notes: "private",
    created_by: "admin",
    created_at: "now",
    updated_at: "now",
  };

  it("counts only verified payments toward totals", () => {
    const payments: Payment[] = [
      { ...basePayment, id: "pay1", collection_participant_id: "cp-p1", participant_id: "p1", amount: 2000, verification_status: "Verified" },
      { ...basePayment, id: "pay2", collection_participant_id: "cp-p2", participant_id: "p2", amount: 3000, verification_status: "Pending" },
    ];
    const summary = calculateCollectionSummary(collection, collectionParticipants, payments);
    expect(summary.collection.total_collected).toBe(2000);
    expect(summary.collection.remaining_amount).toBe(8000);
    expect(summary.participants[0].payment_status).toBe("Partially Paid");
  });

  it("does not show negative remaining amount and detects overpaid records", () => {
    const result = calculateParticipantPayment(5000, 6000);
    expect(result.outstanding_amount).toBe(0);
    expect(result.payment_status).toBe("Overpaid");
  });

  it("handles waived records and formats Malaysian Ringgit", () => {
    expect(calculateParticipantPayment(5000, 0, true).payment_status).toBe("Waived");
    expect(formatMYR(12345)).toBe("RM 123.45");
  });
});
