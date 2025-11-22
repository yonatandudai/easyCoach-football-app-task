import type { Player } from '../types/player';

export const AVERAGE_SKILLS = {
  passing: 6,
  dribbling: 5,
  speed: 7,
  strength: 6,
  vision: 6,
  defending: 5,
};

interface RadarChartProps {
  skills: Player['skills'];
  showComparison: boolean;
}

export default function RadarChart({ skills, showComparison }: RadarChartProps) {
  const size = 400;
  const center = size / 2;
  const maxRadius = size / 2 - 40;
  const levels = 5;

  const skillNames = Object.keys(skills) as Array<keyof Player['skills']>;
  const angleStep = (Math.PI * 2) / skillNames.length;

  const getPoint = (value: number, index: number): { x: number; y: number } => {
    const angle = angleStep * index - Math.PI / 2;
    const radius = (value / 10) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const getPolygonPoints = (skillData: Player['skills']) => {
    return skillNames
      .map((skill, i) => {
        const point = getPoint(skillData[skill], i);
        return `${point.x},${point.y}`;
      })
      .join(' ');
  };

  const getLabelPosition = (index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const labelRadius = maxRadius + 25;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
    };
  };

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Background circles */}
      {[...Array(levels)].map((_, i) => {
        const radius = ((i + 1) / levels) * maxRadius;
        return (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#4B5563"
            strokeWidth="1"
          />
        );
      })}

      {/* Radial lines */}
      {skillNames.map((_, i) => {
        const point = getPoint(10, i);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={point.x}
            y2={point.y}
            stroke="#4B5563"
            strokeWidth="1"
          />
        );
      })}

      {/* Comparison polygon (average) */}
      {showComparison && (
        <polygon
          points={getPolygonPoints(AVERAGE_SKILLS)}
          fill="#F59E0B"
          fillOpacity="0.2"
          stroke="#F59E0B"
          strokeWidth="2"
        />
      )}

      {/* Player polygon */}
      <polygon
        points={getPolygonPoints(skills)}
        fill="#3B82F6"
        fillOpacity="0.4"
        stroke="#3B82F6"
        strokeWidth="2"
      />

      {/* Skill labels */}
      {skillNames.map((skill, i) => {
        const pos = getLabelPosition(i);
        return (
          <text
            key={skill}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#D1D5DB"
            fontSize="14"
            fontWeight="500"
            className="capitalize"
          >
            {skill}
          </text>
        );
      })}

      {/* Value labels on points */}
      {skillNames.map((skill, i) => {
        const point = getPoint(skills[skill], i);
        return (
          <g key={`value-${skill}`}>
            <circle cx={point.x} cy={point.y} r="4" fill="#3B82F6" />
            <text
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              fill="#3B82F6"
              fontSize="12"
              fontWeight="bold"
            >
              {skills[skill]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
