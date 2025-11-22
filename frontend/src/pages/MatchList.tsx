import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MatchesByDay } from '../types/match';
import TeamLogo from '../components/TeamLogo';
import { matchService } from '../services/matchService';

export default function MatchList() {
  const [matchesByDay, setMatchesByDay] = useState<MatchesByDay>({});
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  async function fetchMatches() {
    try {
      const data = await matchService.getAllMatches();
      setMatchesByDay(data.matches_by_day);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to fetch matches. Please try again later.');
      setLoading(false);
    }
  }

  function formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

function formatDateTime(dateString: string): string {
    const date = new Date(dateString).toLocaleDateString();
    const time = new Date(dateString).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${date} - ${time}`;
  }

  function handleMatchClick(matchId: number) {
    navigate(`/matches/${matchId}`);
  }

  // Added loading state check
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl">Loading matches...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Match Schedule</h1>

      {Object.entries(matchesByDay).map(([date, matches]) => (
        <div key={date} className="mb-12">
          <h2 className="text-2xl text-center font-semibold mb-6 border-b-2 border-purple-500 pb-2">
            {formatDate(date)}
          </h2>

          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                onClick={() => handleMatchClick(match.id)}
                className="rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-500 hover:-translate-y-1 p-6"
              >
                <div className="text-center text-gray-600 text-sm mb-4 font-medium">
                  {match.competition_name}
                </div>
                
                <div className="flex items-center justify-between gap-4">
                  {/* Home Team */}
                  <div className="flex items-center gap-4 flex-1">
                    <TeamLogo team={match.home_team} />
                    <span className="font-semibold text-lg flex-1">
                      {match.home_team.name}
                    </span>
                    {match.home_score !== null && (
                      <span className="text-2xl font-bold text-purple-600 min-w-[30px] text-center">
                        {match.home_score}
                      </span>
                    )}
                  </div>

{/* Match Info - Kick-off Date & Time */}
                  <div className="flex flex-col items-center gap-1 min-w-[150px]">
                    <div className="text-sm font-semibold text-gray-700">
                      {formatDateTime(match.kickoff_time)}
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center gap-4 flex-1 justify-end">
                    {match.away_score !== null && (
                      <span className="text-2xl font-bold text-purple-600 min-w-[30px] text-center">
                        {match.away_score}
                      </span>
                    )}
                    <span className="font-semibold text-lg flex-1 text-right">
                      {match.away_team.name}
                    </span>
                    <TeamLogo team={match.away_team} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}