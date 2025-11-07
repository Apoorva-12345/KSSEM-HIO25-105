
import React from 'react';

export const FlipIcon: React.FC<{ className?: string }> = ({ className }) => (
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
        <path d="M12 2v20"></path>
        <path d="M16 4h3a1 1 0 0 1 1 1v2"></path>
        <path d="M8 4H5a1 1 0 0 0-1 1v2"></path>
        <path d="M16 20h3a1 1 0 0 0 1-1v-2"></path>
        <path d="M8 20H5a1 1 0 0 1-1-1v-2"></path>
    </svg>
);