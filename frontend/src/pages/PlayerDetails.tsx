import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Player } from '../types/player';
import RadarChart from '../components/RadarChart';
import { playerService } from '../services/playerService';

export default function PlayerDetails() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editableSkills, setEditableSkills] = useState<Player['skills'] | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      try {
        const data = await playerService.getPlayerById(playerId!);
        setPlayer(data);
        setEditableSkills(data.skills);
        setLoading(false);
      } catch (err) {
        setError('Failed to load player details');
        setLoading(false);
      }
    };

    if (playerId) {
      fetchPlayerDetails();
    }
  }, [playerId]);

  const handleSkillChange = (skill: keyof Player['skills'], value: number) => {
    if (editableSkills) {
      setEditableSkills({
        ...editableSkills,
        [skill]: value,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading player details...</div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl text-red-500">{error || 'Player not found'}</div>
      </div>
    );
  }

  // Get all unique teams the player has played for
  const playerTeams = Array.from(
    new Set(player.matches_played.map(match => match.player_team || player.team_name))
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
      >
        ← Back
      </button>

      {/* Player Header */}
      <div className="bg-gray-800 rounded-lg p-8 mb-8 flex items-center gap-8">
        {/* Placeholder Avatar */}
        <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center text-6xl">
          👤
        </div>

        {/* Player Info */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold">{player.name}</h1>
            {player.is_captain && (
              <span className="px-3 py-1 bg-yellow-600 rounded-full text-sm font-semibold">
                Captain
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-lg mt-4">
            <div>
              <span className="text-gray-400">Position:</span>{' '}
              <span className="font-semibold">{player.position}</span>
            </div>
            <div>
              <span className="text-gray-400">{playerTeams.length > 1 ? 'Teams:' : 'Team:'}</span>{' '}
              <span className="font-semibold">{playerTeams.join(', ')}</span>
            </div>
          </div>

          {/* Career Stats */}
          <div className="mt-6 flex gap-6 text-center">
            <div className="bg-gray-700 px-4 py-2 rounded">
              <div className="text-2xl font-bold text-blue-400">{player.total_stats.matches}</div>
              <div className="text-sm text-gray-400">Matches</div>
            </div>
            <div className="bg-gray-700 px-4 py-2 rounded">
              <div className="text-2xl font-bold text-green-400">{player.total_stats.goals}</div>
              <div className="text-sm text-gray-400">Goals</div>
            </div>
            <div className="bg-gray-700 px-4 py-2 rounded">
              <div className="text-2xl font-bold text-yellow-400">{player.total_stats.yellow_cards}</div>
              <div className="text-sm text-gray-400">Yellow Cards</div>
            </div>
            <div className="bg-gray-700 px-4 py-2 rounded">
              <div className="text-2xl font-bold text-red-400">{player.total_stats.red_cards}</div>
              <div className="text-sm text-gray-400">Red Cards</div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-gray-800 rounded-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Player Skills</h2>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            {showComparison ? 'Hide Comparison' : 'Show Comparison vs Average'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-semibold mb-4">
              {showComparison ? 'Player vs Average' : 'Player Skills'}
            </h3>
            {editableSkills && (
              <RadarChart skills={editableSkills} showComparison={showComparison} />
            )}
            {showComparison && (
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span>Player</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span>Average</span>
                </div>
              </div>
            )}
          </div>

          {/* Editable Skills Sliders */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Edit Skills (1-10)</h3>
            {editableSkills && (
              <div className="space-y-4">
                {Object.entries(editableSkills).map(([skill, value]) => (
                  <div key={skill} className="flex items-center gap-4">
                    <label className="w-28 capitalize font-medium text-gray-300">{skill}:</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={value}
                      onChange={(e) => handleSkillChange(skill as keyof Player['skills'], Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={value}
                      onChange={(e) => handleSkillChange(skill as keyof Player['skills'], Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-center"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="bg-gray-800 rounded-lg p-8">
        <h2 className="text-3xl font-bold mb-6">Match History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Opponent</th>
                <th className="text-left py-3 px-4">Competition</th>
                <th className="text-center py-3 px-4">Home/Away</th>
                <th className="text-center py-3 px-4">Started</th>
                <th className="text-center py-3 px-4">Minutes</th>
                <th className="text-center py-3 px-4">Goals</th>
                <th className="text-center py-3 px-4">Cards</th>
              </tr>
            </thead>
            <tbody>
              {player.matches_played.map((match, index) => {
                // Show minutes only when available (not null/undefined)
                const hasMinutes = match.minutes_played !== null && match.minutes_played !== undefined;
                
                return (
                  <tr
                    key={index}
                    className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => navigate(`/matches/${match.match_id}`)}
                  >
                    <td className="py-3 px-4">{match.match_date}</td>
                    <td className="py-3 px-4 font-semibold">{match.opponent}</td>
                    <td className="py-3 px-4 text-gray-400">{match.competition}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          match.home_away === 'home'
                            ? 'bg-green-900 text-green-300'
                            : 'bg-blue-900 text-blue-300'
                        }`}
                      >
                        {match.home_away.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {match.started ? (
                        <span className="text-green-400">✓</span>
                      ) : (
                        <span className="text-gray-500">Sub</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {hasMinutes ? (
                        <span>{match.minutes_played}'</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {match.goals > 0 && <span className="text-green-400">⚽ {match.goals}</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {match.yellow_cards > 0 && <span className="text-yellow-400">🟨 {match.yellow_cards}</span>}
                      {match.red_cards > 0 && <span className="text-red-400 ml-1">🟥 {match.red_cards}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
