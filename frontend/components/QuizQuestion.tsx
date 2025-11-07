
import React, { useState } from 'react';
import { QuizQuestion as QuizQuestionData } from '../types';

interface QuizQuestionProps {
    questionData: QuizQuestionData;
    onAnswer: (isCorrect: boolean) => void;
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({ questionData, onAnswer }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const handleSelectAnswer = (index: number) => {
        if (isAnswered) return;

        const isCorrect = index === questionData.correctAnswerIndex;
        onAnswer(isCorrect);

        setSelectedAnswer(index);
        setIsAnswered(true);
    };

    const getButtonClass = (index: number) => {
        const baseClass = "w-full text-left p-3 my-2 rounded-lg transition-all border text-sm";
        if (!isAnswered) {
            return `${baseClass} bg-slate-600 border-slate-500 hover:bg-slate-500 hover:border-sky-400`;
        }

        const isCorrect = index === questionData.correctAnswerIndex;
        const isSelected = index === selectedAnswer;

        if (isCorrect) {
            return `${baseClass} bg-green-800 border-green-500 font-semibold cursor-default`;
        }
        if (isSelected && !isCorrect) {
            return `${baseClass} bg-red-800 border-red-500 font-semibold cursor-default`;
        }
        return `${baseClass} bg-slate-700 border-slate-600 text-slate-400 cursor-default`;
    };

    return (
        <div className="bg-slate-800 p-4 rounded-lg my-2 border border-slate-700/50">
            <p className="font-semibold mb-3 text-slate-200">{questionData.question}</p>
            <div>
                {questionData.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleSelectAnswer(index)}
                        disabled={isAnswered}
                        className={getButtonClass(index)}
                        aria-pressed={selectedAnswer === index}
                    >
                        {option}
                    </button>
                ))}
            </div>
            {isAnswered && (
                <div className="mt-4 p-3 bg-slate-900/70 rounded-md border border-sky-700/50">
                    <p className="text-sky-300 font-bold text-sm">Explanation</p>
                    <p className="text-slate-300 mt-1 text-sm">{questionData.explanation}</p>
                </div>
            )}
        </div>
    );
};
