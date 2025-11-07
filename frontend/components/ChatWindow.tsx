import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Role, Feedback } from '../types';
import { Message } from './Message';
import { LoadingIcon } from './icons/LoadingIcon';
import { SendIcon } from './icons/SendIcon';
import { SparkleIcon } from './icons/SparkleIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';
import { XIcon } from './icons/XIcon';

declare global {
    interface Window {

        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface ChatWindowProps {
    messages: ChatMessage[];
    isLoading: boolean;
    onSendMessage: (message: string, file: File | null) => void;
    onAnswerQuestion: (isCorrect: boolean) => void;
    onFeedback: (messageIndex: number, feedback: Feedback) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSendMessage, onAnswerQuestion, onFeedback }) => {
    const [input, setInput] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
        };

        recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setInput(transcript);
        };
        
        recognitionRef.current = recognition;

    }, []);

    const handleMicClick = () => {
        if (!recognitionRef.current) return;

        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setInput('');
            recognitionRef.current.start();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if ((input.trim() || file) && !isLoading) {
            onSendMessage(input.trim(), file);
            setInput('');
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <main className="flex-1 flex flex-col h-full bg-slate-800">
            <header className="p-4 border-b border-slate-700 flex items-center gap-3">
                <SparkleIcon className="w-6 h-6 text-sky-400" />
                <h1 className="text-xl font-bold">AI Virtual Tutor</h1>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messages.length === 0 && !isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
                        <SparkleIcon className="w-16 h-16 mb-4 text-slate-600" />
                        <h2 className="text-2xl font-bold text-slate-300">Welcome!</h2>
                        <p>Ask me anything to start learning.</p>
                        <p className="mt-2 text-sm">Try "Explain quantum computing" or "What was the Renaissance?"</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <Message
                            key={index}
                            message={msg}
                            onAnswerQuestion={onAnswerQuestion}
                            onFeedback={(feedbackValue) => onFeedback(index, feedbackValue)}
                        />
                    ))
                )}

                {isLoading && messages[messages.length - 1]?.role === Role.USER && (
                     <div className="flex gap-3 my-4 justify-start">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            AI
                        </div>
                        <div className="p-4 rounded-xl max-w-lg lg:max-w-2xl bg-slate-700 rounded-bl-none flex items-center gap-3">
                            <LoadingIcon className="w-5 h-5" />
                            <span className="text-slate-300 italic">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-slate-700 bg-slate-800">
                {file && (
                    <div className="mb-2 flex items-center justify-between bg-slate-700/50 p-2 rounded-lg">
                        <span className="text-sm text-slate-300 truncate px-2">
                            Attached: <span className="font-medium">{file.name}</span>
                        </span>
                        <button 
                            onClick={() => {
                                setFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="p-1 rounded-full hover:bg-slate-600"
                            aria-label="Remove attached file"
                        >
                            <XIcon className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/jpg, text/plain, text/markdown"
                    />
                     <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="p-3 rounded-lg transition-colors bg-slate-600 hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-600 disabled:opacity-50"
                        aria-label="Attach a file"
                    >
                        <PaperclipIcon className="w-6 h-6"/>
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isRecording ? "Listening..." : "Ask your question here..."}
                        disabled={isLoading}
                        className="flex-1 p-3 bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                    />
                    <button
                        type="button"
                        onClick={handleMicClick}
                        disabled={isLoading}
                        className={`p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-600 hover:bg-slate-500'} disabled:bg-slate-600 disabled:opacity-50`}
                        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                    >
                        <MicrophoneIcon className="w-6 h-6"/>
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || (!input.trim() && !file)}
                        className="p-3 bg-sky-600 rounded-lg hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                        aria-label="Send message"
                    >
                        {isLoading ? <LoadingIcon className="w-6 h-6"/> : <SendIcon className="w-6 h-6"/>}
                    </button>
                </form>
            </div>
        </main>
    );
};
