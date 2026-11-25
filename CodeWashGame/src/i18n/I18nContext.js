import { createContext } from 'react';
import { DEFAULT_LOCALE, translate } from './translations';

export const I18nContext = createContext(null);

// Components rendered in isolation (storybooks, unit tests) keep English copy.
export const FALLBACK_TRANSLATION = Object.freeze({
    locale: DEFAULT_LOCALE,
    setLocale: () => {},
    t: (key, vars) => translate(DEFAULT_LOCALE, key, vars),
});
