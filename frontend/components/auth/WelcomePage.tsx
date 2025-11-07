import React from 'react';

interface WelcomePageProps {
    name: string;
    onGetStarted: () => void;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({ name, onGetStarted }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
                Welcome, <span className="text-sky-400">{name}!</span>
            </h1>
            <p className="text-slate-300 mt-4 text-lg max-w-xl">
                You're just a few steps away from starting your personalized learning adventure with the AI Virtual Tutor.
            </p>
            <button
                onClick={onGetStarted}
                className="mt-10 px-8 py-4 bg-sky-600 rounded-lg text-white font-bold text-lg hover:bg-sky-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500"
            >
                Get Started
            </button>
        </div>
    );
};