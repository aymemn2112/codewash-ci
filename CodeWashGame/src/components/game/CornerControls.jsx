import React from 'react';
import { Bug, Maximize, Menu, Minimize, Settings, Sparkles } from 'lucide-react';
import { playClick } from '../../utils/soundManager';

const BUTTON_CLASS =
    'absolute z-40 bg-stone-800/90 text-white p-3 rounded-lg border-2 border-stone-600 hover:bg-stone-700 transition-all shadow-lg';

/**
 * The four corner buttons (settings, cosmetics, fullscreen, menu, bug report).
 * State transitions and sounds live in App; this component only renders.
 */
const CornerControls = ({
    isFullscreen,
    onOpenSettings,
    onOpenCosmetics,
    onToggleFullscreen,
    onOpenMenu,
    onOpenBugReport,
}) => (
    <>
        <button
            onClick={() => {
                onOpenSettings();
                playClick();
            }}
            className={BUTTON_CLASS}
            style={{ top: '24px', left: '24px' }}
            aria-label="Settings"
        >
            <Settings size={48} className="text-slate-400" />
        </button>
        <button
            onClick={() => {
                onOpenCosmetics();
                playClick();
            }}
            className={BUTTON_CLASS}
            style={{ top: '24px', left: 'calc(24px + 76px + 12px)' }}
            aria-label="Cosmetics"
        >
            <Sparkles size={48} className="text-purple-400" />
        </button>
        <button
            onClick={onToggleFullscreen}
            className={BUTTON_CLASS}
            style={{ top: '24px', right: 'calc(24px + 76px + 12px)' }}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
            {isFullscreen ? <Minimize size={48} /> : <Maximize size={48} />}
        </button>
        <button
            onClick={() => {
                onOpenMenu();
                playClick();
            }}
            className={BUTTON_CLASS}
            style={{ top: '24px', right: '24px' }}
            aria-label="Menu"
        >
            <Menu size={48} />
        </button>
        <button
            onClick={() => {
                onOpenBugReport();
                playClick();
            }}
            className={BUTTON_CLASS}
            style={{ bottom: '24px', right: '24px' }}
            aria-label="Report a bug"
        >
            <Bug size={48} className="text-red-400" />
        </button>
    </>
);

export default CornerControls;
