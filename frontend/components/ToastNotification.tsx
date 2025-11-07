import React, { useEffect, useState } from 'react';

interface ToastNotificationProps {
    id: number;
    message: string;
    type: 'xp' | 'levelup';
    onClose: (id: number) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ id, message, type, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, 3000);

        const removeTimer = setTimeout(() => {
            onClose(id);
        }, 3500); // 500ms for exit animation

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [id, onClose]);

    const baseClasses = "text-white font-bold px-4 py-2 rounded-full shadow-lg transition-all duration-500 ease-in-out transform";
    const typeClasses = type === 'xp'
        ? "bg-green-500"
        : "bg-yellow-500 text-slate-900 text-lg px-6 py-3";
    const animationClasses = isExiting ? "opacity-0 translate-y-4 scale-90" : "opacity-100 translate-y-0 scale-100";

    return (
        <div className={`${baseClasses} ${typeClasses} ${animationClasses}`}>
            {message}
        </div>
    );
};
