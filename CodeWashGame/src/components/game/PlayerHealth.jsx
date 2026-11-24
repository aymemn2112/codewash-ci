import React from 'react';
import PixelHeart from '../ui/PixelHeart';

const MAX_HEALTH = 10;

const PlayerHealth = ({ health }) => (
    <div
        className="absolute z-40 flex gap-1.5"
        style={{ bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}
    >
        {Array(MAX_HEALTH)
            .fill(0)
            .map((_, index) => (
                <PixelHeart key={index} size={48} filled={index < health} />
            ))}
    </div>
);

export default PlayerHealth;
