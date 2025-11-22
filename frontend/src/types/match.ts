import type { Team } from './team';
import type { LineupPlayer } from './player';

interface Match {
  id: number;
  home_team: Team;
  away_team: Team;
  home_score: number;
  away_score: number;
  kickoff_time: string;
  competition_name: string;
  stadium: string;
  pixellot_id?: string;
  video_url?: string;
}

interface MatchesByDay {
  [date: string]: Match[];
}

interface MatchEvent {
  id: number;
  minute: number;
  player_id: number;
  player_name: string;
  team_id: number;
  event_type: 'goal' | 'yellow_card' | 'red_card';
  timestamp?: number;
  video_timestamp?: number;
}

interface MatchEventsProps {
  videoUrl?: string;
  events: MatchEvent[];
}

interface MatchDetails {
  match_info: Match;
  lineups: {
    home: {
      first_11: LineupPlayer[];
      substitutes: LineupPlayer[];
    };
    away: {
      first_11: LineupPlayer[];
      substitutes: LineupPlayer[];
    };
  };
  events: MatchEvent[];
}

type TabType = 'lineups' | 'events';

export type { Match, MatchesByDay, MatchEvent, MatchEventsProps, MatchDetails, TabType };