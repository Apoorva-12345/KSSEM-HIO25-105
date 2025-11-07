import React from 'react';
import { PerformanceStats } from '../types';
import { XIcon } from './icons/XIcon';
import { DonutChart } from './charts/DonutChart';
import { LineChart } from './charts/LineChart';
import { SparkleIcon } from './icons/SparkleIcon';

interface PerformanceModalProps {
    stats: PerformanceStats;
    onClose: () => void;
}

const StatBox: React.FC<{ label: string; value: string | number; description: string }> = ({ label, value, description }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg text-center h-full flex flex-col justify-center">
        <div className="text-3xl font-bold text-sky-300">{value}</div>
        <div className="text-sm font-semibold text-white mt-1">{label}</div>
        <div className="text-xs text-slate-400 mt-1">{description}</div>
    </div>
);

export const PerformanceModal: React.FC<PerformanceModalProps> = ({ stats, onClose }) => {
    const totalAnswers = stats.correct + stats.incorrect;
    const accuracy = totalAnswers > 0 ? Math.round((stats.correct / totalAnswers) * 100) : 0;

    let feedbackMessage: string;
    let feedbackSubtext: string;

    if (totalAnswers === 0) {
        feedbackMessage = "Ready to test your knowledge?";
        feedbackSubtext = "Complete your first quiz to see your performance analysis!";
    } else if (accuracy >= 70) {
        feedbackMessage = "Outstanding Performance!";
        feedbackSubtext = "Your high accuracy shows a strong grasp of the material. Keep up the great work!";
    } else {
        feedbackMessage = "Keep Pushing Forward!";
        feedbackSubtext = "Every master was once a beginner. Keep practicing and you'll see improvement!";
    }
    
    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-4 font-sans overflow-y-auto">
             <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                aria-label="Close performance dashboard"
            >
                <XIcon className="w-8 h-8" />
            </button>
            <div className="w-full max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-center text-white mb-8">Performance Dashboard</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="space-y-4">
                        <StatBox label="Correct Answers" value={stats.correct} description="Total correct responses." />
                        <StatBox label="Incorrect Answers" value={stats.incorrect} description="Total incorrect responses." />
                        <StatBox label="Quizzes Taken" value={stats.quizzesTaken} description="Total number of quizzes started." />
                    </div>
                    
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col">
                        <h2 className="text-xl font-bold text-center text-sky-300 mb-4">Overall Accuracy</h2>
                        <div className="flex-grow flex items-center justify-center">
                            <DonutChart correct={stats.correct} incorrect={stats.incorrect} />
                        </div>
                    </div>

                     <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-center flex flex-col justify-center">
                        <SparkleIcon className="w-12 h-12 text-sky-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-sky-300">{feedbackMessage}</h3>
                        <p className="text-slate-400 mt-1 text-sm">{feedbackSubtext}</p>
                    </div>
                </div>
                
                 <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <h2 className="text-xl font-bold text-center text-sky-300 mb-4">Quiz Accuracy Over Time</h2>
                    <div className="h-64">
                         <LineChart data={stats.accuracyHistory} />
                    </div>
                </div>
            </div>
        </div>
    );
};