import type { Participant, PublicParticipant } from "@/types/domain";

export function sanitizeParticipant(participant: Participant): PublicParticipant {
  return {
    id: participant.id,
    display_name: participant.display_name,
    ea_id: participant.ea_id,
    psn_id: participant.psn_id,
    platform: participant.platform,
    team_name: participant.team_name,
    social_username: participant.social_username,
    status: participant.status,
  };
}
