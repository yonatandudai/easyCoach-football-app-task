import api from './api';
import type { Match, MatchDetails } from '../types/match';

export const matchService = {
  /**
   * Get all matches grouped by date
   */
  getAllMatches: async (): Promise<{ matches_by_day: Record<string, Match[]> }> => {
    const response = await api.get('/matches');
    return response.data;
  },

  /**
   * Get detailed match information by ID
   */
  getMatchById: async (matchId: string): Promise<MatchDetails> => {
    const response = await api.get(`/matches/${matchId}`);
    return response.data;
  },
};

export default matchService;
