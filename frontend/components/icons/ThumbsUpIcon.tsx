import React from 'react';

export const ThumbsUpIcon: React.FC<{ className?: string }> = ({ className }) => (
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
        <path d="M7 10v12" />
        <path d="M18.5 10V4.5a3.5 3.5 0 0 0-7 0V10" />
        <path d="M10 10l-1.39 9.34a2 2 0 0 0 2 2.33l6.5-2.8a2 2 0 0 0 1.39-2V10h-8.5z" />
    </svg>
);
