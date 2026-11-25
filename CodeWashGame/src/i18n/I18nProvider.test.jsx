import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { STORAGE_KEYS } from '../services/storageKeys';
import { I18nProvider } from './I18nProvider';
import { useTranslation } from './useTranslation';

const memoryStorage = (initial = {}) => {
    const data = new Map(Object.entries(initial));
    return {
        getItem: vi.fn((key) => (data.has(key) ? data.get(key) : null)),
        setItem: vi.fn((key, value) => data.set(key, value)),
    };
};

const wrapperFor = (storage, initialLocale) =>
    function Wrapper({ children }) {
        return (
            <I18nProvider storage={storage} initialLocale={initialLocale}>
                {children}
            </I18nProvider>
        );
    };

describe('I18nProvider', () => {
    it('restores a valid stored locale', () => {
        const storage = memoryStorage({ [STORAGE_KEYS.LOCALE]: 'fr' });
        const { result } = renderHook(() => useTranslation(), {
            wrapper: wrapperFor(storage),
        });

        expect(result.current.locale).toBe('fr');
        expect(result.current.t('menu.title')).toBe('Succès');
        expect(storage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.LOCALE, 'fr');
    });

    it('ignores an unsupported stored locale', () => {
        const storage = memoryStorage({ [STORAGE_KEYS.LOCALE]: 'de' });
        const { result } = renderHook(() => useTranslation(), {
            wrapper: wrapperFor(storage),
        });

        expect(result.current.locale).toBe('en');
        expect(storage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.LOCALE, 'en');
    });

    it('prefers a valid initial locale over the stored one', () => {
        const storage = memoryStorage({ [STORAGE_KEYS.LOCALE]: 'en' });
        const { result } = renderHook(() => useTranslation(), {
            wrapper: wrapperFor(storage, 'fr'),
        });

        expect(result.current.locale).toBe('fr');
    });

    it('falls back to storage when the initial locale is unsupported', () => {
        const storage = memoryStorage({ [STORAGE_KEYS.LOCALE]: 'fr' });
        const { result } = renderHook(() => useTranslation(), {
            wrapper: wrapperFor(storage, 'xx'),
        });

        expect(result.current.locale).toBe('fr');
    });

    it('persists valid switches and ignores invalid ones', () => {
        const storage = memoryStorage();
        const { result } = renderHook(() => useTranslation(), {
            wrapper: wrapperFor(storage),
        });

        act(() => result.current.setLocale('fr'));
        expect(result.current.locale).toBe('fr');
        expect(storage.setItem).toHaveBeenLastCalledWith(STORAGE_KEYS.LOCALE, 'fr');

        act(() => result.current.setLocale('xx'));
        expect(result.current.locale).toBe('fr');
        expect(storage.setItem).toHaveBeenCalledTimes(2);
    });

    it('uses browser storage and exposes a safe fallback outside the provider', () => {
        localStorage.clear();
        const { result: inside } = renderHook(() => useTranslation(), {
            wrapper: function Wrapper({ children }) {
                return <I18nProvider>{children}</I18nProvider>;
            },
        });

        act(() => inside.current.setLocale('fr'));
        expect(inside.current.locale).toBe('fr');
        expect(localStorage.getItem(STORAGE_KEYS.LOCALE)).toBe('fr');

        const { result: outside } = renderHook(() => useTranslation());
        expect(outside.current.locale).toBe('en');
        expect(outside.current.t('menu.skillLevel', { level: 3 })).toBe('Lvl 3');
        act(() => outside.current.setLocale('fr'));
        expect(outside.current.locale).toBe('en');
    });
});
