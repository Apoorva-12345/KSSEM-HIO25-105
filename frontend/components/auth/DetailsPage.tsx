import React, { useState } from 'react';
import { SparkleIcon } from '../icons/SparkleIcon';

export interface UserDetails {
    role: string;
    dob: string;
    gender: string;
}

interface DetailsPageProps {
    onSubmit: (details: UserDetails) => void;
}

export const DetailsPage: React.FC<DetailsPageProps> = ({ onSubmit }) => {
    const [details, setDetails] = useState<UserDetails>({
        role: '',
        dob: '',
        gender: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setDetails({
            ...details,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!details.role || !details.dob || !details.gender) {
            setError('Please fill out all fields.');
            return;
        }
        setError('');
        onSubmit(details);
    };

    const commonInputClasses = "w-full p-3 bg-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 border border-transparent focus:border-sky-500";

    return (
        <div className="w-full h-full flex items-center justify-center p-4 bg-slate-900">
            <div className="w-full max-w-sm">
                 <div className="text-center mb-8">
                    <SparkleIcon className="w-12 h-12 text-sky-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white">Tell Us a Little More</h1>
                    <p className="text-slate-400 mt-2">This helps us personalize your experience.</p>
                </div>

                <form 
                    onSubmit={handleSubmit}
                    className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl shadow-lg"
                >
                    <div className="space-y-6">
                        <div>
                             <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">Your Role</label>
                             <select
                                id="role"
                                name="role"
                                value={details.role}
                                onChange={handleChange}
                                className={commonInputClasses}
                             >
                                <option value="" disabled>Select a role...</option>
                                <option value="student">Student</option>
                                <option value="professional">Professional</option>
                                <option value="hobbyist">Hobbyist</option>
                                <option value="other">Other</option>
                             </select>
                        </div>
                        <div>
                            <label htmlFor="dob" className="block text-sm font-medium text-slate-300 mb-2">Date of Birth</label>
                             <input
                                type="date"
                                id="dob"
                                name="dob"
                                value={details.dob}
                                onChange={handleChange}
                                className={`${commonInputClasses} [color-scheme:dark]`}
                             />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
                             <select
                                id="gender"
                                name="gender"
                                value={details.gender}
                                onChange={handleChange}
                                className={commonInputClasses}
                             >
                                <option value="" disabled>Select a gender...</option>
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                             </select>
                        </div>
                    </div>
                     {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full mt-8 p-3 bg-sky-600 rounded-lg text-white font-bold hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
                    >
                        Finish Setup
                    </button>
                </form>
            </div>
        </div>
    );
};