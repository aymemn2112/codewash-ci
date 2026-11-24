import { useCallback, useState } from 'react';

/**
 * Drawer/modal visibility for the App shell.
 * `open*` helpers close the other drawers first, matching the previous behavior.
 */
export function useDrawers() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCosmeticsOpen, setIsCosmeticsOpen] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [isBugReportOpen, setIsBugReportOpen] = useState(false);

    const closeAll = useCallback(() => {
        setIsMenuOpen(false);
        setIsSettingsOpen(false);
        setIsCosmeticsOpen(false);
    }, []);

    const openSettings = useCallback(() => {
        closeAll();
        setIsSettingsOpen(true);
    }, [closeAll]);

    const openCosmetics = useCallback(() => {
        closeAll();
        setIsCosmeticsOpen(true);
    }, [closeAll]);

    const openMenu = useCallback(() => {
        closeAll();
        setIsMenuOpen(true);
    }, [closeAll]);

    const openBugReport = useCallback(() => {
        closeAll();
        setIsBugReportOpen(true);
    }, [closeAll]);

    return {
        isMenuOpen,
        isSettingsOpen,
        isCosmeticsOpen,
        isResetOpen,
        isBugReportOpen,
        setIsMenuOpen,
        setIsSettingsOpen,
        setIsCosmeticsOpen,
        setIsResetOpen,
        setIsBugReportOpen,
        closeAll,
        openSettings,
        openCosmetics,
        openMenu,
        openBugReport,
    };
}

export default useDrawers;
