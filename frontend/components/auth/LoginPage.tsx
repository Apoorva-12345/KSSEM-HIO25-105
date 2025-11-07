import React, { useState } from 'react';
import { SparkleIcon } from '../icons/SparkleIcon';
import { UserIcon } from '../icons/UserIcon';
import { LockIcon } from '../icons/LockIcon';

interface LoginPageProps {
    onLogin: (name: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !password.trim()) {
            setError('Please enter both name and password.');
            return;
        }
        setError('');
        onLogin(name);
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4 bg-slate-900">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <SparkleIcon className="w-16 h-16 text-sky-400 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white">LearnMate</h1>
                    <p className="text-slate-400 mt-2">Sign in to begin your learning journey.</p>
                </div>
                
                <form 
                    onSubmit={handleSubmit}
                    className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl shadow-lg"
                >
                    <div className="space-y-6">
                        <div className="relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserIcon className="w-5 h-5 text-slate-400"/>
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full pl-10 p-3 bg-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 border border-transparent focus:border-sky-500"
                                aria-label="Your Name"
                            />
                        </div>
                         <div className="relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockIcon className="w-5 h-5 text-slate-400"/>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full pl-10 p-3 bg-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 border border-transparent focus:border-sky-500"
                                aria-label="Password"
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full mt-8 p-3 bg-sky-600 rounded-lg text-white font-bold hover:bg-sky-700 disabled:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
                    >
                        Login
                    </button>
                    
                    <p className="text-xs text-slate-500 mt-6 text-center">
                        Don't have an account? No problem, just enter any details to proceed.
                    </p>
                </form>
            </div>
        </div>
    );
};