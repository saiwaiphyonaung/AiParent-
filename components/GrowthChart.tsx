import React, { useState, useMemo } from 'react';
import type { HealthRecord } from '../types';

interface GrowthChartProps {
  records: HealthRecord[];
  translations: {
    weightLabel: string;
    heightLabel: string;
    date: string;
    bmi: string;
  };
}

interface Point {
  x: number;
  y: number;
  record: HealthRecord;
}

export const GrowthChart: React.FC<GrowthChartProps> = ({ records, translations }) => {
  const [activePoint, setActivePoint] = useState<Point | null>(null);

  const WIDTH = 300;
  const HEIGHT = 150;
  const PADDING = 20;

  const data = useMemo(() => {
    if (records.length < 2) return null;

    const weights = records.map(r => r.weight);
    const heights = records.map(r => r.height);

    const minWeight = Math.min(...weights) * 0.95;
    const maxWeight = Math.max(...weights) * 1.05;
    const minHeight = Math.min(...heights) * 0.95;
    const maxHeight = Math.max(...heights) * 1.05;

    const getX = (index: number) => PADDING + (index / (records.length - 1)) * (WIDTH - PADDING * 2);
    const getWeightY = (weight: number) => HEIGHT - PADDING - ((weight - minWeight) / (maxWeight - minWeight)) * (HEIGHT - PADDING * 2);
    const getHeightY = (height: number) => HEIGHT - PADDING - ((height - minHeight) / (maxHeight - minHeight)) * (HEIGHT - PADDING * 2);
    
    const weightPoints: Point[] = records.map((r, i) => ({ x: getX(i), y: getWeightY(r.weight), record: r }));
    const heightPoints: Point[] = records.map((r, i) => ({ x: getX(i), y: getHeightY(r.height), record: r }));

    const weightPath = weightPoints.map(p => `${p.x},${p.y}`).join(' ');
    const heightPath = heightPoints.map(p => `${p.x},${p.y}`).join(' ');

    return { weightPoints, heightPoints, weightPath, heightPath };
  }, [records]);

  if (records.length < 2) {
    return (
      <div className="flex items-center justify-center h-[188px] text-sm text-center bg-slate-50 rounded-lg">
        <p className="text-slate-500">Need at least two records to display a chart.</p>
      </div>
    );
  }
  if (!data) return null;

  const { weightPoints, heightPoints, weightPath, heightPath } = data;

  const handleMouseEnter = (point: Point) => {
    const weightPoint = weightPoints.find(p => p.record.id === point.record.id)!;
    const heightPoint = heightPoints.find(p => p.record.id === point.record.id)!;
    // For tooltip positioning, just use the point that was hovered
    setActivePoint(point);
  };
  
  const handleMouseLeave = () => {
    setActivePoint(null);
  };

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto" onMouseLeave={handleMouseLeave}>
        {/* Grid lines */}
        {[...Array(4)].map((_, i) => (
          <line
            key={i}
            x1={PADDING}
            y1={PADDING + (i * (HEIGHT - PADDING * 2)) / 3}
            x2={WIDTH - PADDING}
            y2={PADDING + (i * (HEIGHT - PADDING * 2)) / 3}
            strokeDasharray="2,2"
            className="stroke-slate-300"
            strokeWidth="0.5"
          />
        ))}

        {/* Height Line */}
        <polyline fill="none" className="stroke-sky-500" strokeWidth="1.5" points={heightPath} />
        {heightPoints.map((p, i) => (
          <circle
            key={`h-${i}`}
            cx={p.x}
            cy={p.y}
            r="3"
            className="fill-sky-500 cursor-pointer"
            onMouseEnter={() => handleMouseEnter(p)}
          />
        ))}
        
        {/* Weight Line */}
        <polyline fill="none" className="stroke-slate-600" strokeWidth="1.5" points={weightPath} />
        {weightPoints.map((p, i) => (
          <circle
            key={`w-${i}`}
            cx={p.x}
            cy={p.y}
            r="3"
            className="fill-slate-600 cursor-pointer"
            onMouseEnter={() => handleMouseEnter(p)}
          />
        ))}

        {/* Tooltip */}
        {activePoint && (
          <g transform={`translate(${activePoint.x}, ${activePoint.y})`}>
            <g transform={`translate(${activePoint.x > WIDTH / 2 ? -95 : 8}, -48)`}>
              <rect x="0" y="0" width="85" height="40" rx="4" fill="rgba(0,0,0,0.7)" />
              <text x="5" y="12" fill="white" fontSize="8">
                {`${translations.date}: ${activePoint.record.date}`}
              </text>
              <text x="5" y="22" fill="white" fontSize="8">
                {`${translations.weightLabel}: ${activePoint.record.weight}kg, ${translations.heightLabel}: ${activePoint.record.height}cm`}
              </text>
              <text x="5" y="32" fill="white" fontSize="8">
                {`${translations.bmi}: ${activePoint.record.bmi}`}
              </text>
            </g>
          </g>
        )}
      </svg>
      <div className="flex justify-center items-center space-x-4 mt-2 text-xs">
         <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-1.5 bg-slate-600`}></span>
            <span className="text-slate-600">{translations.weightLabel}</span>
         </div>
         <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-sky-500 mr-1.5"></span>
            <span className="text-slate-600">{translations.heightLabel}</span>
         </div>
      </div>
    </div>
  );
};