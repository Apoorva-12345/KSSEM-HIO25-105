import React from 'react';
import { ChatSession } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SparkleIcon } from './icons/SparkleIcon';

interface HistorySidebarProps {
    sessions: ChatSession[];
    activeSessionId: string | null;
    onNewChat: () => void;
    onSelectChat: (id: string) => void;
    onDeleteChat: (id: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
    sessions, 
    activeSessionId, 
    onNewChat, 
    onSelectChat, 
    onDeleteChat 
}) => {
    
    const handleDelete = (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this chat?')) {
            onDeleteChat(sessionId);
        }
    };

    return (
        <aside className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 flex flex-col p-2">
            <div className="p-2 mb-2">
                 <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-sky-600 hover:bg-sky-700 transition-all font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-400 transform hover:scale-105"
                >
                    <PlusIcon className="w-5 h-5" />
                    New Chat
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1">
                {sessions.map(session => {
                    const isActive = session.id === activeSessionId;
                    return (
                        <div
                            key={session.id}
                            onClick={() => onSelectChat(session.id)}
                            className={`group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                isActive ? 'bg-sky-700/50' : 'hover:bg-slate-700/70'
                            }`}
                        >
                            <span className="flex-1 truncate text-sm font-medium text-slate-200">
                                {session.title}
                            </span>
                             <button
                                onClick={(e) => handleDelete(e, session.id)}
                                className="absolute right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-opacity p-1 rounded-md"
                                aria-label="Delete chat"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
             <div className="mt-auto text-center text-xs text-slate-500 p-4 border-t border-slate-700/50">
                <p className="flex items-center justify-center gap-1.5">
                    <SparkleIcon className="w-3 h-3 text-sky-500" />
                    AI Virtual Tutor
                </p>
            </div>
        </aside>
    );
};
