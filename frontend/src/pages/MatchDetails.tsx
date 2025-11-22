import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { MatchDetails, MatchEvent, TabType } from '../types/match';
import TeamLogo from '../components/TeamLogo';
import { matchService } from '../services/matchService';


export default function MatchDetails() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('lineups');

  useEffect(() => {
    fetchMatchDetails();
  }, [matchId]);

  async function fetchMatchDetails() {
    try {
      const data = await matchService.getMatchById(matchId!);
      
      // Validate response structure
      if (!data.match_info) {
        throw new Error('Invalid response structure: missing match_info');
      }
      setMatchDetails(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching match details:', error);
      setError('Failed to load match details');
      setLoading(false);
    }
  }

  function handlePlayerClick(playerId: number) {
    navigate(`/players/${playerId}`);
  }

  function handleVideoSeek(event: MatchEvent) {
    if (!matchDetails?.match_info.pixellot_id) return;
    
    // Calculate timestamp - use provided or minute * 60
    const timestamp = event.video_timestamp || event.timestamp || (event.minute * 60);
    
    // Subtract 15 seconds to show context before the event
    const seekTime = Math.max(0, timestamp - 15);
    
    // Seek video to timestamp
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      // Don't auto-play - let user press play button to avoid browser blocking
      
      // Scroll video into view
      videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl">Loading match details...</div>
      </div>
    );
  }

  if (error || !matchDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl text-red-600">{error || 'Match not found'}</div>
      </div>
    );
  }

  const { match_info, lineups, events } = matchDetails;

  // Get team color based on team ID (same logic as TeamLogo)
  function getTeamColor(teamId: number) {
    const colors = [
      { bg: 'bg-red-100', border: 'border-red-400' },
      { bg: 'bg-green-100', border: 'border-green-400' },
      { bg: 'bg-blue-100', border: 'border-blue-400' },
      { bg: 'bg-yellow-100', border: 'border-yellow-400' },
      { bg: 'bg-purple-100', border: 'border-purple-400' },
      { bg: 'bg-pink-100', border: 'border-pink-400' },
      { bg: 'bg-indigo-100', border: 'border-indigo-400' },
      { bg: 'bg-teal-100', border: 'border-teal-400' },
      { bg: 'bg-orange-100', border: 'border-orange-400' },
      { bg: 'bg-cyan-100', border: 'border-cyan-400' },
    ];
    const colorIndex = teamId % colors.length;
    return colors[colorIndex];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/matches')}
        className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
      >
        ← Back to Matches
      </button>

      {/* Match Header */}
      <div className="rounded-xl shadow-lg p-6 mb-6">
        <div className="text-center text-gray-600 text-sm mb-4">
            {/* match time */}
            {new Date(match_info.kickoff_time).toLocaleString(undefined, {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center flex-1">
            <TeamLogo team={match_info.home_team} />
            <h2 className="mt-2 text-xl font-bold">{match_info.home_team.name}</h2>
          </div>
          
          <div className="text-center mx-8">
            <div className="text-4xl font-bold">
              {match_info.home_score} - {match_info.away_score}
            </div>
          </div>
          
          <div className="flex flex-col items-center flex-1">
            <TeamLogo team={match_info.away_team} />
            <h2 className="mt-2 text-xl font-bold">{match_info.away_team.name}</h2>
          </div>
        </div>
      </div>

      {/* Pixellot Video Player */}
      {match_info.pixellot_id ? (
        <div className="bg-black rounded-xl overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            className="w-full h-full"
            controls
            src={match_info.pixellot_id}
          >
            <source src={match_info.pixellot_id} type="application/x-mpegURL" />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div className="bg-gray-200 rounded-xl flex items-center justify-center mb-6" style={{ aspectRatio: '16/9' }}>
          <p className="text-gray-600 text-xl">No video available</p>
        </div>
      )}
      
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('lineups')}
            className={`flex-1 py-4 px-6 font-semibold transition ${
              activeTab === 'lineups'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lineups
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-4 px-6 font-semibold transition ${
              activeTab === 'events'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Match Events ({events.length})
          </button>
        </div>

        <div className="p-6">
          {/* Lineups Tab */}
          {activeTab === 'lineups' && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Home Team Lineup */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-center">{match_info.home_team.name}</h3>
                
                <div className="mb-6">
                  <h4 className="text-xl font-semibold mb-3 text-gray-700 text-center">Starting XI</h4>
                  <div className="space-y-2">
                    {lineups.home.first_11.map((player) => {
                      const homeColor = getTeamColor(match_info.home_team.id);
                      return (
                      <div
                        key={player.id}
                        onClick={() => handlePlayerClick(player.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg hover:opacity-80 cursor-pointer transition ${homeColor.bg}`}
                      >
                        <div className="flex-1 text-right">
                            <div className="font-semibold">{player.name}</div>
                            {player.position && (
                            <div className="text-sm text-gray-600">{player.position}</div>
                          )}
                          {player.captain && (
                            <div className="text-sm text-yellow-600">Captain</div>
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold">
                          {player.shirt_number}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>

                {lineups.home.substitutes.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-600 text-center">Bench</h4>
                    <div className="space-y-2">
                      {lineups.home.substitutes.map((player) => {
                        const homeColor = getTeamColor(match_info.home_team.id);
                        return (
                        <div
                          key={player.id}
                          onClick={() => handlePlayerClick(player.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg hover:opacity-80 cursor-pointer transition ${homeColor.bg} opacity-60`}
                        >
                          <div className="flex-1 text-right">
                            <div className="font-semibold">{player.name}</div>
                            {player.position && (
                              <div className="text-sm text-gray-600">{player.position}</div>
                            )}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold">
                            {player.shirt_number}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Away Team Lineup */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-center">{match_info.away_team.name}</h3>
                
                <div className="mb-6">
                  <h4 className="text-xl text-center font-semibold mb-3 text-gray-700">Starting XI</h4>
                  <div className="space-y-2">
                    {lineups.away.first_11.map((player) => {
                      const awayColor = getTeamColor(match_info.away_team.id);
                      return (
                      <div
                        key={player.id}
                        onClick={() => handlePlayerClick(player.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg hover:opacity-80 cursor-pointer transition ${awayColor.bg}`}
                      >
                        <div className="flex-1 text-right">
                          <div className="font-semibold">{player.name}</div>
                          {player.position && (
                            <div className="text-sm text-gray-600">{player.position}</div>
                          )}
                          {player.captain && (
                            <div className="text-sm text-yellow-600">Captain</div>
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold">
                          {player.shirt_number}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>

                {lineups.away.substitutes.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3 text-gray-600 text-center">Bench</h4>
                    <div className="space-y-2">
                      {lineups.away.substitutes.map((player) => {
                        const awayColor = getTeamColor(match_info.away_team.id);
                        return (
                        <div
                          key={player.id}
                          onClick={() => handlePlayerClick(player.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg hover:opacity-80 cursor-pointer transition ${awayColor.bg} opacity-60`}
                        >
                          <div className="flex-1 text-right">
                            <div className="font-semibold">{player.name}</div>
                            {player.position && (
                              <div className="text-sm text-gray-600">{player.position}</div>
                            )}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold">
                            {player.shirt_number}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-center text-gray-600 py-8">No events recorded</p>
              ) : (
                events.map((event) => {
                  const teamColor = getTeamColor(event.team_id);
                  return (
                  <div
                    key={event.id}
                    onClick={() => handleVideoSeek(event)}
                    className={`flex items-center gap-4 p-4 rounded-lg transition cursor-pointer ${
                      match_info.pixellot_id ? 'hover:opacity-80' : ''
                    } ${teamColor.bg} border-l-4 ${teamColor.border}`}
                  >
                    <div className="text-2xl font-bold text-gray-700 min-w-[60px]">
                      {event.minute}'
                    </div>
                    
                    <div className="text-3xl">
                      {event.event_type === 'goal' ? '⚽' : event.event_type === 'yellow_card' ? '🟨' : '🟥'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{event.player_name}</div>
                      <div className="text-sm text-gray-600">
                        {event.event_type === 'goal' ? 'Goal' : event.event_type === 'yellow_card' ? 'Yellow Card' : 'Red Card'}
                      </div>
                    </div>
                    
                    {match_info.pixellot_id && (
                      <div className="text-gray-700 text-sm font-medium">
                        Click to watch →
                      </div>
                    )}
                  </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

