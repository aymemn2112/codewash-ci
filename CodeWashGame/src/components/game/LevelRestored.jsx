import React from 'react';

const LevelRestored = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
        <div className="text-center animate-bounce">
            <h1
                className="text-6xl font-bold text-green-400 drop-shadow-[0_0_20px_rgba(0,255,0,0.8)]"
                style={{ textShadow: '4px 4px 0 #000' }}
            >
                LEVEL RESTORED!
            </h1>
            <p className="text-2xl text-yellow-400 mt-4">Welcome back, hero!</p>
        </div>
    </div>
);

export default LevelRestored;
