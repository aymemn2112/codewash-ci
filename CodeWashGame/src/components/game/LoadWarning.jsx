import React from 'react';

const LoadWarning = ({ onDismiss }) => (
    <div
        role="alert"
        className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 border-2 border-red-500 text-red-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-3"
    >
        <span>Some saved data could not be read and was reset to defaults.</span>
        <button
            onClick={onDismiss}
            className="font-bold text-red-200 hover:text-white"
            aria-label="Dismiss warning"
        >
            ×
        </button>
    </div>
);

export default LoadWarning;
