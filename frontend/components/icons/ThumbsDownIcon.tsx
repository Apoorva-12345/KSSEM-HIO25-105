import React from 'react';

export const ThumbsDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M17 14V2" />
        <path d="M5.5 14v5.5a3.5 3.5 0 0 0 7 0V14" />
        <path d="M14 14l1.39-9.34a2 2 0 0 0-2-2.33l-6.5 2.8a2 2 0 0 0-1.39 2V14h8.5z" />
    </svg>
);
