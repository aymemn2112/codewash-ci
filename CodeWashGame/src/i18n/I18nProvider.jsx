import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { browserStorage } from '../services/storage';
import { STORAGE_KEYS } from '../services/storageKeys';
import { I18nContext } from './I18nContext';
import { DEFAULT_LOCALE, isLocaleSupported, translate } from './translations';

const readStoredLocale = (storage) => {
    const stored = storage.getItem(STORAGE_KEYS.LOCALE);
    return isLocaleSupported(stored) ? stored : DEFAULT_LOCALE;
};

export const I18nProvider = ({ children, storage = browserStorage, initialLocale }) => {
    const [locale, setLocaleState] = useState(() =>
        initialLocale && isLocaleSupported(initialLocale)
            ? initialLocale
            : readStoredLocale(storage),
    );

    useEffect(() => {
        storage.setItem(STORAGE_KEYS.LOCALE, locale);
    }, [locale, storage]);

    const setLocale = useCallback((nextLocale) => {
        if (isLocaleSupported(nextLocale)) setLocaleState(nextLocale);
    }, []);

    const t = useCallback((key, vars) => translate(locale, key, vars), [locale]);

    const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
