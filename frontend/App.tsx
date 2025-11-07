import React, { useState, useEffect, useRef } from 'react';
import type { Chat, Part } from '@google/genai';
import { ChatWindow } from './components/ChatWindow';
import { Controls } from './components/Controls';
import { HistorySidebar } from './components/HistorySidebar';
import { FlashcardViewer } from './components/FlashcardViewer';
import { PerformanceModal } from './components/PerformanceModal';
import { LoginPage } from './components/auth/LoginPage';
import { WelcomePage } from './components/auth/WelcomePage';
import { DetailsPage, UserDetails } from './components/auth/DetailsPage';
import { ChatMessage, Difficulty, Role, PerformanceStats, Flashcard, Feedback, GamificationStats, ChatSession } from './types';
import { createChatSession, generateQuiz, generateFlashcards } from './services/geminiService';
import { ToastNotification } from './components/ToastNotification';

const STATS_STORAGE_KEY = 'ai-tutor-performance-stats';
const GAMIFICATION_STORAGE_KEY = 'ai-tutor-gamification-stats';
const SESSIONS_STORAGE_KEY = 'ai-tutor-chat-sessions';
const QUIZ_LENGTH = 3;

type AppState = 'login' | 'welcome' | 'details' | 'tutor';

declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        aistudio?: AIStudio;
    }
}

async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('login');
    const [userName, setUserName] = useState<string>('');
    
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [performanceStats, setPerformanceStats] = useState<PerformanceStats>(() => {
        try {
            const savedStats = localStorage.getItem(STATS_STORAGE_KEY);
            const initialStats = { correct: 0, incorrect: 0, quizzesTaken: 0, accuracyHistory: [] };
            return savedStats ? { ...initialStats, ...JSON.parse(savedStats) } : initialStats;
        } catch (e) {
            console.error("Failed to parse stats from localStorage", e);
            return { correct: 0, incorrect: 0, quizzesTaken: 0, accuracyHistory: [] };
        }
    });
    const [gamificationStats, setGamificationStats] = useState<GamificationStats>(() => {
        try {
            const savedStats = localStorage.getItem(GAMIFICATION_STORAGE_KEY);
            return savedStats ? JSON.parse(savedStats) : { xp: 0, level: 1 };
        } catch (e) {
            console.error("Failed to parse gamification stats from localStorage", e);
            return { xp: 0, level: 1 };
        }
    });

    const [toasts, setToasts] = useState<{ id: number; message: string; type: 'xp' | 'levelup' }[]>([]);
    const [currentQuizStats, setCurrentQuizStats] = useState({ correct: 0, answered: 0 });
    const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
    const [isFlashcardViewerVisible, setIsFlashcardViewerVisible] = useState<boolean>(false);
    const [isPerformanceModalVisible, setIsPerformanceModalVisible] = useState<boolean>(false);

    const chatRef = useRef<Chat | null>(null);
    
    const activeSession = sessions.find(s => s.id === activeSessionId) || null;
    const xpNeededForNextLevel = gamificationStats.level * 150;
    
    useEffect(() => {
        try {
            const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
            if (savedSessions) {
                const parsedSessions = JSON.parse(savedSessions);
                setSessions(parsedSessions);
                if (parsedSessions.length > 0) {
                    setActiveSessionId(parsedSessions[0].id);
                } else {
                     handleNewChat();
                }
            } else {
                 handleNewChat();
            }
        } catch (e) {
            console.error("Failed to parse sessions from localStorage", e);
            handleNewChat();
        }
    }, []);

    useEffect(() => {
        if (sessions.length > 0) {
            try {
                localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
            } catch (e) {
                console.error("Failed to save sessions to localStorage", e);
            }
        }
    }, [sessions]);
    
    useEffect(() => {
        try {
            localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(performanceStats));
        } catch (e) {
            console.error("Failed to save stats to localStorage", e);
        }
    }, [performanceStats]);

    useEffect(() => {
        try {
            localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(gamificationStats));
        } catch (e) {
            console.error("Failed to save gamification stats to localStorage", e);
        }
    }, [gamificationStats]);

    useEffect(() => {
        if (appState === 'tutor' && activeSession) {
            chatRef.current = createChatSession(activeSession.difficulty, activeSession.messages);
            setError(null);
        }
    }, [activeSession, appState]);

    const showToast = (message: string, type: 'xp' | 'levelup') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
    };
    
    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const addXp = (amount: number, reason: string) => {
        showToast(`+${amount} XP: ${reason}`, 'xp');
    
        setGamificationStats(prevStats => {
            let newXp = prevStats.xp + amount;
            let newLevel = prevStats.level;
            let xpForLevelUp = newLevel * 150;
    
            if (newXp >= xpForLevelUp) {
                newLevel += 1;
                newXp -= xpForLevelUp;
                showToast(`LEVEL UP! You are now Level ${newLevel}!`, 'levelup');
            }
    
            return { xp: newXp, level: newLevel };
        });
    };
    
    const handleDifficultyChange = (newDifficulty: Difficulty) => {
        if (!activeSession || newDifficulty === activeSession.difficulty) return;
        
        const updatedSession: ChatSession = {
            ...activeSession,
            difficulty: newDifficulty,
            messages: [], 
        };
        
        setSessions(prev => prev.map(s => s.id === activeSessionId ? updatedSession : s));
    };
    
    const handleSendMessage = async (text: string, file: File | null) => {
        if (!chatRef.current || !activeSessionId) return;

        setIsLoading(true);
        setError(null);
        
        const userParts: Part[] = [{ text }];
        if (file) {
            const filePart = await fileToGenerativePart(file);
            userParts.push(filePart);
        }
        
        const userMessage: ChatMessage = { role: Role.USER, parts: userParts };

        const isFirstMessage = activeSession?.messages.length === 0;
        const newTitle = isFirstMessage ? (text.substring(0, 30) + (text.length > 30 ? '...' : '')) : activeSession?.title;

        setSessions(prev => prev.map(s => 
            s.id === activeSessionId 
                ? { ...s, title: newTitle || 'New Chat', messages: [...s.messages, userMessage] } 
                : s
        ));
        addXp(5, "Sent a message");
       
        try {
            const currentSession = sessions.find(s => s.id === activeSessionId);
            chatRef.current = createChatSession(currentSession!.difficulty, currentSession!.messages);
            const stream = await chatRef.current.sendMessageStream({ message: userParts });
            
            let modelResponse = '';
            setSessions(prev => prev.map(s => 
                s.id === activeSessionId 
                    ? { ...s, messages: [...s.messages, { role: Role.MODEL, parts: [{ text: '' }] }] } 
                    : s
            ));
            
            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setSessions(prev => prev.map(s => {
                    if (s.id === activeSessionId) {
                        const updatedMessages = [...s.messages];
                        const lastMessage = updatedMessages[updatedMessages.length - 1];
                        lastMessage.parts = [{ text: modelResponse }];
                        return { ...s, messages: updatedMessages };
                    }
                    return s;
                }));
            }
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
            const errorMsg: ChatMessage = { role: Role.MODEL, parts: [{ text: `Sorry, something went wrong: ${errorMessage}` }] };
            setSessions(prev => prev.map(s => 
                s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s
            ));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAction = async (action: 'quiz' | 'summarize' | 'flashcards') => {
        if (!activeSession) return;
        const lastModelMessage = activeSession.messages.slice().reverse().find(m => m.role === Role.MODEL);
        const lastMessageText = lastModelMessage?.parts.reduce((acc, part) => {
            if ('text' in part) return acc + part.text;
            return acc;
        }, '') || "the current topic";
        
        if (action === 'summarize') {
            const prompt = `Please provide a concise summary of the last topic. Use bullet points.`;
            handleSendMessage(prompt, null);
            return;
        }

        setIsLoading(true);
        setError(null);
        
        const userMessage: ChatMessage = { role: Role.USER, parts: [{ text: `Can you ${action} for me?` }] };
        setSessions(prev => prev.map(s => 
            s.id === activeSessionId ? { ...s, messages: [...s.messages, userMessage] } : s
        ));
        
        try {
            if (action === 'quiz') {
                const quizQuestions = await generateQuiz(lastMessageText);
                if (quizQuestions && quizQuestions.length > 0) {
                    const quizMessage: ChatMessage = {
                        role: Role.MODEL,
                        parts: [{ text: `Here's a quiz on the topic:` }],
                        quiz: quizQuestions,
                    };
                    setSessions(prev => prev.map(s => 
                        s.id === activeSessionId ? { ...s, messages: [...s.messages, quizMessage] } : s
                    ));
                    setPerformanceStats(prev => ({ ...prev, quizzesTaken: prev.quizzesTaken + 1 }));
                    setCurrentQuizStats({ correct: 0, answered: 0 });
                } else {
                    throw new Error("Failed to generate a quiz.");
                }
            } else if (action === 'flashcards') {
                const generatedFlashcards = await generateFlashcards(lastMessageText);
                if (generatedFlashcards && generatedFlashcards.length > 0) {
                    setFlashcards(generatedFlashcards);
                    setIsFlashcardViewerVisible(true);
                    const flashcardMsg: ChatMessage = { role: Role.MODEL, parts: [{ text: `I've created flashcards for you.` }] };
                    setSessions(prev => prev.map(s => 
                        s.id === activeSessionId ? { ...s, messages: [...s.messages, flashcardMsg] } : s
                    ));
                    addXp(30, "Flashcards created");
                } else {
                    throw new Error("Failed to generate flashcards.");
                }
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            const errorMsg: ChatMessage = { role: Role.MODEL, parts: [{ text: `Sorry, something went wrong: ${errorMessage}` }] };
            setSessions(prev => prev.map(s => 
                s.id === activeSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s
            ));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAnswerQuestion = (isCorrect: boolean) => {
        if (isCorrect) {
            addXp(25, "Correct answer");
        }
        setPerformanceStats(prev => ({
            ...prev,
            correct: isCorrect ? prev.correct + 1 : prev.correct,
            incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect,
        }));
        const newCorrect = isCorrect ? currentQuizStats.correct + 1 : currentQuizStats.correct;
        const newAnswered = currentQuizStats.answered + 1;
        setCurrentQuizStats({ correct: newCorrect, answered: newAnswered });
        if (newAnswered === QUIZ_LENGTH) {
            addXp(50, "Quiz completed!");
            const accuracy = Math.round((newCorrect / QUIZ_LENGTH) * 100);
            setPerformanceStats(prev => ({
                ...prev,
                accuracyHistory: [...(prev.accuracyHistory || []), accuracy],
            }));
            setCurrentQuizStats({ correct: 0, answered: 0 });
        }
    };

    const handleResetStats = () => {
        setPerformanceStats({ correct: 0, incorrect: 0, quizzesTaken: 0, accuracyHistory: [] });
        setCurrentQuizStats({ correct: 0, answered: 0 });
        setGamificationStats({ xp: 0, level: 1});
    };

    const handleFeedback = (messageIndex: number, feedback: Feedback) => {
        if (!activeSessionId) return;
        setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
                const newMessages = [...s.messages];
                const msgToUpdate = newMessages[messageIndex];
                if (msgToUpdate && msgToUpdate.role === Role.MODEL) {
                    newMessages[messageIndex] = { ...msgToUpdate, feedback };
                }
                return { ...s, messages: newMessages };
            }
            return s;
        }));
    };
    
    const handleLogin = (name: string) => {
        setUserName(name);
        setAppState('welcome');
    };

    const handleGetStarted = () => {
        setAppState('details');
    };
    
    const handleDetailsSubmit = (details: UserDetails) => {
        console.log('User Details:', details);
        setAppState('tutor');
    };

    const handleNewChat = () => {
        const newSession: ChatSession = {
            id: `session_${Date.now()}`,
            title: 'New Chat',
            messages: [],
            difficulty: Difficulty.INTERMEDIATE,
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
    };

    const handleDeleteChat = (sessionId: string) => {
        setSessions(prev => {
            const remainingSessions = prev.filter(s => s.id !== sessionId);
            if (activeSessionId === sessionId) {
                if (remainingSessions.length > 0) {
                    setActiveSessionId(remainingSessions[0].id);
                } else {
                    const newSession: ChatSession = { id: `session_${Date.now()}`, title: 'New Chat', messages: [], difficulty: Difficulty.INTERMEDIATE };
                    setActiveSessionId(newSession.id);
                    return [newSession];
                }
            }
            return remainingSessions;
        });
    };

    const renderContent = () => {
        switch (appState) {
            case 'login':
                return <LoginPage onLogin={handleLogin} />;
            case 'welcome':
                return <WelcomePage name={userName} onGetStarted={handleGetStarted} />;
            case 'details':
                 return <DetailsPage onSubmit={handleDetailsSubmit} />;
            case 'tutor':
                return (
                    <div className="h-full w-full flex font-sans overflow-hidden">
                         {isFlashcardViewerVisible && flashcards && (
                            <FlashcardViewer 
                                cards={flashcards} 
                                onClose={() => setIsFlashcardViewerVisible(false)} 
                            />
                        )}
                        {isPerformanceModalVisible && (
                            <PerformanceModal
                                stats={performanceStats}
                                onClose={() => setIsPerformanceModalVisible(false)}
                            />
                        )}
                        <HistorySidebar 
                            sessions={sessions}
                            activeSessionId={activeSessionId}
                            onNewChat={handleNewChat}
                            onSelectChat={setActiveSessionId}
                            onDeleteChat={handleDeleteChat}
                        />
                        <ChatWindow 
                            messages={activeSession?.messages || []} 
                            isLoading={isLoading} 
                            onSendMessage={handleSendMessage} 
                            onAnswerQuestion={handleAnswerQuestion}
                            onFeedback={handleFeedback}
                            key={activeSessionId} // Force re-mount on session change
                        />
                        <Controls 
                            difficulty={activeSession?.difficulty || Difficulty.INTERMEDIATE} 
                            onDifficultyChange={handleDifficultyChange} 
                            onAction={handleAction}
                            stats={performanceStats}
                            onResetStats={handleResetStats}
                            onViewPerformance={() => setIsPerformanceModalVisible(true)}
                            userName={userName}
                            gamificationStats={gamificationStats}
                            xpNeededForNextLevel={xpNeededForNextLevel}
                        />
                    </div>
                );
            default:
                return null;
        }
    }


    return (
        <div className="h-screen w-screen bg-slate-900">
            {error && (
                <div 
                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 border border-red-500 text-white p-3 rounded-lg shadow-lg text-center w-auto max-w-md z-50 animate-pulse"
                    onClick={() => setError(null)}
                >
                    <p className="font-bold">An Error Occurred</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}
             <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[60]">
                {toasts.map(toast => (
                    <ToastNotification
                        key={toast.id}
                        id={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={removeToast}
                    />
                ))}
            </div>
            {renderContent()}
        </div>
    );
};

export default App;