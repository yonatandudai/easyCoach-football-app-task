import type { Team } from '../types/team';

export default function TeamLogo({ team }: { team: Team }) {
  if (team.logo) {
    return (
      <img
        src={team.logo}
        alt={team.name}
        className="w-12 h-12 rounded-full bg-gray-100 p-1"
      />
    );
  }
  const initials = team.name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 3);
  const initial = initials || '?';
  const colors = [
    'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500',
  ];
  const colorIndex = team.id % colors.length;
  
  return (
    <div className={`w-12 h-12 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-xl`}>
      {initial}
    </div>
  );
};