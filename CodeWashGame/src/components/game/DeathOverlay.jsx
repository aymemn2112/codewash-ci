import React from 'react';

const DeathOverlay = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-red-900/60 animate-pulse pointer-events-none">
        <div className="text-center">
            <h1
                className="text-8xl font-bold text-red-500 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]"
                style={{ textShadow: '4px 4px 0 #000, -2px -2px 0 #000' }}
            >
                YOU DIED
            </h1>
            <p className="text-2xl text-red-300 mt-4">Level -1</p>
            <p className="text-lg text-stone-400 mt-2">Take a moment to rest...</p>
        </div>
    </div>
);

export default DeathOverlay;
