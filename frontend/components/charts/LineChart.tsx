
import React from 'react';

interface LineChartProps {
    data: number[];
}

export const LineChart: React.FC<LineChartProps> = ({ data }) => {
    if (!data || data.length < 2) {
        return (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
                <p>Complete at least two quizzes to see your progress.</p>
            </div>
        );
    }

    const width = 350;
    const height = 220;
    const padding = 30;

    const points = data
        .map((value, index) => {
            const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
            const y = height - padding - (value / 100) * (height - padding * 2);
            return `${x},${y}`;
        })
        .join(' ');
    
    return (
        <div className="w-full h-full flex items-center justify-center">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                {/* Y-Axis labels */}
                <text x={padding - 10} y={height - padding + 5} textAnchor="end" fill="#94a3b8" fontSize="10">0%</text>
                <text x={padding - 10} y={padding} textAnchor="end" fill="#94a3b8" fontSize="10">100%</text>

                {/* Axes */}
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#64748b" strokeWidth="1" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#64748b" strokeWidth="1" />

                {/* Data line */}
                <polyline
                    fill="none"
                    stroke="#0ea5e9" // sky-500
                    strokeWidth="2"
                    points={points}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data points */}
                {data.map((value, index) => {
                    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
                    const y = height - padding - (value / 100) * (height - padding * 2);
                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="3"
                            fill="#0ea5e9"
                            stroke="white"
                            strokeWidth="1.5"
                        />
                    );
                })}

                 <text x={width / 2} y={height - 5} textAnchor="middle" fill="#94a3b8" fontSize="10">Quizzes</text>
            </svg>
        </div>
    );
};
