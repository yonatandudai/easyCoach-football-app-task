// Player in lineup (simple version for match lineups)
interface LineupPlayer {
    id: number;
    name: string;
    shirt_number: number;
    position?: string;
    captain?: boolean;
}

// Full player profile with all details
interface Player {
  _id: string;
  name: string;
  position: string;
  shirt_number: number;
  team_id: string;
  team_name: string;
  date_of_birth: string;
  is_captain: boolean;
  matches_played: MatchAppearance[];
  total_stats: {
    matches: number;
    goals: number;
    yellow_cards: number;
    red_cards: number;
    minutes_played: number;
  };
  skills: {
    passing: number;
    dribbling: number;
    speed: number;
    strength: number;
    vision: number;
    defending: number;
  };
}

// Player appearance in a specific match
interface MatchAppearance {
  match_id: string;
  match_date: string;
  player_team: string;
  opponent: string;
  home_away: string;
  competition: string;
  minutes_played: number;
  started: boolean;
  goals: number;
  yellow_cards: number;
  red_cards: number;
}

export type { LineupPlayer, Player, MatchAppearance };