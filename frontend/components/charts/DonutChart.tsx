
import React from 'react';

interface DonutChartProps {
    correct: number;
    incorrect: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ correct, incorrect }) => {
    const total = correct + incorrect;
    if (total === 0) {
        return <div className="text-center text-slate-400">No data available yet.</div>;
    }

    const correctPercentage = (correct / total) * 100;
    const incorrectPercentage = (incorrect / total) * 100;
    const accuracy = Math.round(correctPercentage);

    const radius = 80;
    const strokeWidth = 20;
    const innerRadius = radius - strokeWidth / 2;
    const circumference = 2 * Math.PI * innerRadius;

    const correctStrokeDashoffset = circumference - (correctPercentage / 100) * circumference;
    
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
                <circle
                    cx="100"
                    cy="100"
                    r={innerRadius}
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx="100"
                    cy="100"
                    r={innerRadius}
                    fill="transparent"
                    stroke="#ef4444" // red-500
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                />
                <circle
                    cx="100"
                    cy="100"
                    r={innerRadius}
                    fill="transparent"
                    stroke="#22c55e" // green-500
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={correctStrokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-in-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{accuracy}%</span>
                <span className="text-sm text-slate-400">Accuracy</span>
            </div>
        </div>
    );
};
