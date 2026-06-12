import type { Fixture, PublicParticipant, Standing } from "@/types/domain";

type StandingSeed = Pick<Standing, "participant_id" | "manual_adjustment" | "position"> & Partial<Standing>;

function blankStanding(tournamentId: string, participant: PublicParticipant, seed?: StandingSeed): Standing {
  return {
    id: seed?.id ?? `${tournamentId}-${participant.id}`,
    tournament_id: tournamentId,
    participant_id: participant.id,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goals_for: 0,
    goals_against: 0,
    goal_difference: 0,
    calculated_points: 0,
    manual_adjustment: seed?.manual_adjustment ?? 0,
    points: seed?.manual_adjustment ?? 0,
    position: seed?.position ?? null,
    participant,
  };
}

export function recalculateStandings(
  tournamentId: string,
  participants: PublicParticipant[],
  fixtures: Fixture[],
  existing: StandingSeed[] = [],
) {
  const existingByParticipant = new Map(existing.map((standing) => [standing.participant_id, standing]));
  const standings = new Map(
    participants.map((participant) => [
      participant.id,
      blankStanding(tournamentId, participant, existingByParticipant.get(participant.id)),
    ]),
  );

  for (const fixture of fixtures) {
    if (
      fixture.status !== "Completed" ||
      fixture.home_score == null ||
      fixture.away_score == null ||
      !standings.has(fixture.home_participant_id) ||
      !standings.has(fixture.away_participant_id)
    ) {
      continue;
    }

    const home = standings.get(fixture.home_participant_id)!;
    const away = standings.get(fixture.away_participant_id)!;
    home.played += 1;
    away.played += 1;
    home.goals_for += fixture.home_score;
    home.goals_against += fixture.away_score;
    away.goals_for += fixture.away_score;
    away.goals_against += fixture.home_score;

    if (fixture.home_score > fixture.away_score) {
      home.won += 1;
      away.lost += 1;
      home.calculated_points += 3;
    } else if (fixture.home_score < fixture.away_score) {
      away.won += 1;
      home.lost += 1;
      away.calculated_points += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.calculated_points += 1;
      away.calculated_points += 1;
    }
  }

  return Array.from(standings.values())
    .map((standing) => ({
      ...standing,
      goal_difference: standing.goals_for - standing.goals_against,
      points: standing.calculated_points + standing.manual_adjustment,
    }))
    .sort(compareStandings)
    .map((standing, index) => ({ ...standing, position: index + 1 }));
}

export function compareStandings(a: Standing, b: Standing) {
  return (
    b.points - a.points ||
    b.goal_difference - a.goal_difference ||
    b.goals_for - a.goals_for ||
    (a.participant?.display_name ?? "").localeCompare(b.participant?.display_name ?? "")
  );
}
