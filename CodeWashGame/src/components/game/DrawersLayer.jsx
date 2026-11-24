import React from 'react';
import CosmeticsDrawer from '../drawers/CosmeticsDrawer';
import SettingsDrawer from '../drawers/SettingsDrawer';
import MenuDrawer from '../drawers/MenuDrawer';
import ResetModal from '../modals/ResetModal';
import BugReportModal from '../modals/BugReportModal';
import { playClick } from '../../utils/soundManager';

const DrawersLayer = ({
    drawers,
    activeTheme,
    handleThemeChange,
    handleBorderChange,
    borders,
    unlockedBorders,
    unlockedAchievements,
    audio,
    currentProfile,
    handleSwitchProfile,
    profileNames,
    handleRenameProfile,
    getProfileStats,
    parentStatus,
    handleParentVerified,
    skills,
    stats,
    handleReset,
}) => (
    <>
        {/* Cosmetics drawer overlay - click to close */}
        {drawers.isCosmeticsOpen && (
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => {
                    drawers.setIsCosmeticsOpen(false);
                    playClick();
                }}
            />
        )}
        <CosmeticsDrawer
            isOpen={drawers.isCosmeticsOpen}
            activeTheme={activeTheme}
            setActiveTheme={handleThemeChange}
            selectedBorder={borders.selectedBorder}
            setSelectedBorder={handleBorderChange}
            borderColor={borders.borderColor}
            setBorderColor={borders.setBorderColor}
            unlockedBorders={unlockedBorders}
            unlockedAchievements={unlockedAchievements}
        />

        {/* Settings drawer overlay - click to close */}
        {drawers.isSettingsOpen && (
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => {
                    drawers.setIsSettingsOpen(false);
                    playClick();
                }}
            />
        )}
        <SettingsDrawer
            isOpen={drawers.isSettingsOpen}
            onReset={() => drawers.setIsResetOpen(true)}
            bgmVol={audio.bgmVol}
            setBgmVol={audio.setBgmVol}
            sfxVol={audio.sfxVol}
            setSfxVol={audio.setSfxVol}
            currentProfile={currentProfile}
            onSwitchProfile={handleSwitchProfile}
            profileNames={profileNames}
            onRenameProfile={handleRenameProfile}
            getProfileStats={(id, liveSkills) => getProfileStats(id, liveSkills, activeTheme)}
            parentStatus={parentStatus}
            onParentVerified={handleParentVerified}
            currentSkills={skills}
        />
        <ResetModal
            isOpen={drawers.isResetOpen}
            onClose={() => drawers.setIsResetOpen(false)}
            onConfirm={handleReset}
        />
        <BugReportModal
            isOpen={drawers.isBugReportOpen}
            onClose={() => drawers.setIsBugReportOpen(false)}
        />

        {/* Achievement drawer overlay - click to close */}
        {drawers.isMenuOpen && (
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => {
                    drawers.setIsMenuOpen(false);
                    playClick();
                }}
            />
        )}
        <MenuDrawer isOpen={drawers.isMenuOpen} skills={skills} stats={stats} />
    </>
);

export default DrawersLayer;
