import React from 'react';
import { useTranslation } from '../../i18n/useTranslation';

const LoadWarning = ({ onDismiss }) => {
    const { t } = useTranslation();

    return (
        <div
            role="alert"
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 border-2 border-red-500 text-red-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-3"
        >
            <span>{t('alert.corruptData')}</span>
            <button
                onClick={onDismiss}
                className="font-bold text-red-200 hover:text-white"
                aria-label={t('alert.dismiss')}
            >
                ×
            </button>
        </div>
    );
};

export default LoadWarning;
