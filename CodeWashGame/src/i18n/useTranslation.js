import { useContext } from 'react';
import { FALLBACK_TRANSLATION, I18nContext } from './I18nContext';

/** Returns the active locale, its setter and the `t` translator. */
export const useTranslation = () => useContext(I18nContext) ?? FALLBACK_TRANSLATION;
