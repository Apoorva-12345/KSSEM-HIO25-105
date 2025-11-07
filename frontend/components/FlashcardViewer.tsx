
import React, { useState, useEffect } from 'react';
import { Flashcard } from '../types';
import { XIcon } from './icons/XIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { FlipIcon } from './icons/FlipIcon';

interface FlashcardViewerProps {
    cards: Flashcard[];
    onClose: () => void;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ cards, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleNext = () => {
        if (currentIndex < cards.length - 1) {
            setIsFlipped(false);
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === ' ') handleFlip();
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, cards.length]);

    const currentCard = cards[currentIndex];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center z-50 p-4 font-sans">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                aria-label="Close flashcard viewer"
            >
                <XIcon className="w-8 h-8" />
            </button>

            <div className="w-full max-w-2xl" style={{ perspective: '1000px' }}>
                <div
                    className="relative w-full h-80 md:h-96 transition-transform duration-700"
                    style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                    onClick={handleFlip}
                >
                    {/* Front of Card */}
                    <div className="absolute w-full h-full bg-slate-700 border border-slate-600 rounded-xl flex items-center justify-center p-6 text-center" style={{ backfaceVisibility: 'hidden' }}>
                        <p className="text-2xl md:text-3xl font-bold text-white">{currentCard.front}</p>
                    </div>
                    {/* Back of Card */}
                    <div className="absolute w-full h-full bg-sky-800 border border-sky-600 rounded-xl flex items-center justify-center p-6 text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        <p className="text-xl md:text-2xl text-white">{currentCard.back}</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-slate-300 font-semibold">{`Card ${currentIndex + 1} of ${cards.length}`}</p>
            </div>

            <div className="flex items-center justify-center gap-4 mt-4 w-full max-w-md">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-4 bg-slate-700 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                    aria-label="Previous card"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <button
                    onClick={handleFlip}
                    className="py-3 px-6 bg-sky-600 rounded-lg text-white font-bold flex items-center gap-2 hover:bg-sky-700 transition-all transform hover:scale-105"
                    aria-label="Flip card"
                >
                    <FlipIcon className="w-5 h-5" />
                    Flip Card
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentIndex === cards.length - 1}
                    className="p-4 bg-slate-700 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                    aria-label="Next card"
                >
                    <ArrowRightIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};
