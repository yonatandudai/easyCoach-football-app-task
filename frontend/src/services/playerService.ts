import api from './api';
import type { Player } from '../types/player';

export const playerService = {
  /**
   * Get player profile with stats and match history
   */
  getPlayerById: async (playerId: string): Promise<Player> => {
    const response = await api.get(`/players/${playerId}`);
    return response.data;
  },
};

export default playerService;
