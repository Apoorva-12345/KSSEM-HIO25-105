import React from 'react';
import type { Part } from '@google/genai';
import { ChatMessage, Role, Feedback } from '../types';
import { QuizQuestion } from './QuizQuestion';
import { ThumbsUpIcon } from './icons/ThumbsUpIcon';
import { ThumbsDownIcon } from './icons/ThumbsDownIcon';

interface MessageProps {
    message: ChatMessage;
    onAnswerQuestion?: (isCorrect: boolean) => void;
    onFeedback?: (feedback: Feedback) => void;
}

const Avatar: React.FC<{ role: Role }> = ({ role }) => {
    const isUser = role === Role.USER;
    const initial = isUser ? 'You' : 'AI';
    const bgColor = isUser ? 'bg-sky-500' : 'bg-purple-500';

    return (
        <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {initial.substring(0, 1)}
        </div>
    );
};

const MessageContent: React.FC<{ part: Part }> = ({ part }) => {
    if ('text' in part) {
        const formattedText = part.text.split(/(\`\`\`[\s\S]*?\`\`\`)/g).map((part, index) => {
            if (part.startsWith('```')) {
                const code = part.replace(/```/g, '');
                return (
                    <pre key={index} className="bg-slate-800 p-3 my-2 rounded-lg overflow-x-auto">
                        <code className="text-sm font-mono text-cyan-300">{code.trim()}</code>
                    </pre>
                );
            }
            return part.split(/(\`[^\`]+\`)/g).map((inlinePart, inlineIndex) => {
                if (inlinePart.startsWith('`') && inlinePart.endsWith('`')) {
                    const code = inlinePart.slice(1, -1);
                    return (
                        <code key={`${index}-${inlineIndex}`} className="bg-slate-700 text-amber-300 px-1 py-0.5 rounded text-sm font-mono">
                            {code}
                        </code>
                    );
                }
                return inlinePart;
            });
        });
        return <p className="text-white whitespace-pre-wrap">{formattedText}</p>
    }
    
    if ('inlineData' in part) {
        return (
            <img 
                src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                alt="Uploaded content"
                className="max-w-xs rounded-lg mt-2"
            />
        )
    }

    return null;
}


export const Message: React.FC<MessageProps> = ({ message, onAnswerQuestion, onFeedback }) => {
    const isUser = message.role === Role.USER;
    const firstTextPart = message.parts.find(p => 'text' in p) as { text: string } | undefined;

    const handleFeedbackClick = (newFeedback: 'like' | 'dislike') => {
        if (onFeedback) {
            const feedbackToSend = message.feedback === newFeedback ? null : newFeedback;
            onFeedback(feedbackToSend);
        }
    };

    return (
        <div className={`flex gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && <Avatar role={message.role} />}
            <div className="flex flex-col items-start">
                <div className={`p-4 rounded-xl max-w-lg lg:max-w-2xl ${isUser ? 'bg-sky-600 rounded-br-none' : 'bg-slate-700 rounded-bl-none'}`}>
                     {message.quiz ? (
                        <div>
                            <p className="text-white whitespace-pre-wrap font-bold text-lg mb-2">{firstTextPart?.text}</p>
                            <div className="space-y-1">
                                {message.quiz.map((q, index) => (
                                    <QuizQuestion key={index} questionData={q} onAnswer={onAnswerQuestion!} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {message.parts.map((part, index) => <MessageContent key={index} part={part} />)}
                        </div>
                    )}
                </div>
                {!isUser && onFeedback && message.parts.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            onClick={() => handleFeedbackClick('like')}
                            className={`p-1 rounded-md transition-colors ${
                                message.feedback === 'like'
                                    ? 'text-green-400 bg-green-500/10'
                                    : 'text-slate-400 hover:bg-slate-600/50 hover:text-white'
                            }`}
                            aria-label="Good response"
                            title="Good response"
                        >
                            <ThumbsUpIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleFeedbackClick('dislike')}
                            className={`p-1 rounded-md transition-colors ${
                                message.feedback === 'dislike'
                                    ? 'text-red-400 bg-red-500/10'
                                    : 'text-slate-400 hover:bg-slate-600/50 hover:text-white'
                            }`}
                            aria-label="Bad response"
                            title="Bad response"
                        >
                            <ThumbsDownIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
            {isUser && <Avatar role={message.role} />}
        </div>
    );
};
