import React from 'react';
import { Difficulty, PerformanceStats, GamificationStats } from '../types';
import { SparkleIcon } from './icons/SparkleIcon';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { TargetIcon } from './icons/TargetIcon';
import { ResetIcon } from './icons/ResetIcon';
import { FlashcardIcon } from './icons/FlashcardIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { TrophyIcon } from './icons/TrophyIcon';


interface ControlsProps {
    difficulty: Difficulty;
    onDifficultyChange: (difficulty: Difficulty) => void;
    onAction: (action: 'quiz' | 'summarize' | 'flashcards') => void;
    stats: PerformanceStats;
    onResetStats: () => void;
    onViewPerformance: () => void;
    userName: string;
    gamificationStats: GamificationStats;
    xpNeededForNextLevel: number;
}

const DifficultyButton: React.FC<{ level: Difficulty; current: Difficulty; onClick: (level: Difficulty) => void }> = ({ level, current, onClick }) => {
    const isActive = level === current;
    const baseClasses = "w-full text-left p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400";
    const activeClasses = "bg-sky-600 text-white font-semibold shadow-lg";
    const inactiveClasses = "bg-slate-700 hover:bg-slate-600";

    return (
        <button onClick={() => onClick(level)} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {level}
        </button>
    );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; colorClass: string }> = ({ icon, label, value, colorClass }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg bg-slate-700/50`}>
        <div className={`w-8 h-8 flex items-center justify-center rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <div className="text-sm text-slate-400">{label}</div>
            <div className="text-lg font-bold text-white">{value}</div>
        </div>
    </div>
);


export const Controls: React.FC<ControlsProps> = ({ 
    difficulty, 
    onDifficultyChange, 
    onAction, 
    stats, 
    onResetStats, 
    onViewPerformance,
    userName,
    gamificationStats,
    xpNeededForNextLevel,
}) => {
    const totalAnswers = stats.correct + stats.incorrect;
    const accuracy = totalAnswers > 0 ? Math.round((stats.correct / totalAnswers) * 100) : 0;
    const { xp, level } = gamificationStats;
    const progressPercent = xpNeededForNextLevel > 0 ? (xp / xpNeededForNextLevel) * 100 : 0;
    
    return (
        <aside className="w-full lg:w-72 xl:w-80 p-4 bg-slate-800/50 backdrop-blur-sm border-l border-slate-700 flex flex-col gap-6 overflow-y-auto">
            
            <div className="space-y-4 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-3">
                    <TrophyIcon className="w-8 h-8 text-yellow-400" />
                    <div>
                        <h2 className="text-lg font-bold text-white">{userName}</h2>
                        <p className="text-sm font-semibold text-yellow-400">Level {level}</p>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-400">
                        <span>Progress to Next Level</span>
                        <span>{xp} / {xpNeededForNextLevel} XP</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div 
                            className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="text-lg font-bold text-sky-300">Difficulty Level</h2>
                <p className="text-sm text-slate-400">Changing this will reset the chat.</p>
            </div>

            <div className="space-y-3">
                <DifficultyButton level={Difficulty.BEGINNER} current={difficulty} onClick={onDifficultyChange} />
                <DifficultyButton level={Difficulty.INTERMEDIATE} current={difficulty} onClick={onDifficultyChange} />
                <DifficultyButton level={Difficulty.EXPERT} current={difficulty} onClick={onDifficultyChange} />
            </div>
            
            <div className="border-t border-slate-700 pt-6 space-y-2">
                <h2 className="text-lg font-bold text-sky-300">Actions</h2>
                <p className="text-sm text-slate-400">Ask the tutor to perform a specific task on the current topic.</p>
            </div>

            <div className="space-y-3">
                <button 
                    onClick={() => onAction('quiz')}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400 transform hover:scale-105"
                >
                    <SparkleIcon className="w-5 h-5"/>
                    Quiz Me
                </button>
                 <button 
                    onClick={() => onAction('summarize')}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-green-600 hover:bg-green-700 transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-green-400 transform hover:scale-105"
                >
                    <SparkleIcon className="w-5 h-5"/>
                    Summarize
                </button>
                <button 
                    onClick={() => onAction('flashcards')}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-all font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 transform hover:scale-105"
                >
                    <FlashcardIcon className="w-5 h-5"/>
                    Create Flashcards
                </button>
            </div>

             <div className="border-t border-slate-700 pt-6 space-y-2">
                <h2 className="text-lg font-bold text-sky-300">Performance Tracker</h2>
                <p className="text-sm text-slate-400">Your quiz performance statistics.</p>
            </div>
            <div className="space-y-3">
                <StatCard icon={<CheckIcon className="w-5 h-5"/>} label="Correct" value={stats.correct} colorClass="bg-green-500/30 text-green-300" />
                <StatCard icon={<XIcon className="w-5 h-5"/>} label="Incorrect" value={stats.incorrect} colorClass="bg-red-500/30 text-red-300" />
                <StatCard icon={<TargetIcon className="w-5 h-5"/>} label="Accuracy" value={`${accuracy}%`} colorClass="bg-sky-500/30 text-sky-300" />
                 <button 
                    onClick={onViewPerformance}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-sky-800 hover:bg-sky-700 transition-all font-semibold text-sm text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                    <ChartBarIcon className="w-4 h-4" />
                    View Performance
                </button>
                <button 
                    onClick={onResetStats}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-600 hover:bg-slate-700 transition-all font-semibold text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                    <ResetIcon className="w-4 h-4" />
                    Reset Stats
                </button>
            </div>
            
            <div className="mt-auto text-center text-xs text-slate-500 pt-6">
                <p>Powered by Gemini</p>
            </div>
        </aside>
    );
};