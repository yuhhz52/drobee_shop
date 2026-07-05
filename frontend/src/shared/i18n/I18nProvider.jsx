import React, { useCallback, useEffect, useMemo, useState } from 'react';
import en from './locales/en.json';
import vi from './locales/vi.json';
import { I18nContext } from './useTranslation.js';

const STORAGE_KEY = 'horizon.lang';
const DEFAULT_LANG = 'en';

const DICTIONARIES = { en, vi };

const getInitialLang = () => {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && DICTIONARIES[stored]) return stored;
  } catch {
    // Ignore storage errors (e.g. SSR or privacy mode).
  }
  const nav = window.navigator?.language?.toLowerCase() || '';
  if (nav.startsWith('vi')) return 'vi';
  return DEFAULT_LANG;
};

const resolveKey = (dictionary, key) => {
  if (!key || typeof key !== 'string') return undefined;
  return key.split('.').reduce((acc, segment) => {
    if (acc && Object.prototype.hasOwnProperty.call(acc, segment)) {
      return acc[segment];
    }
    return undefined;
  }, dictionary);
};

const interpolate = (template, params) => {
  if (typeof template !== 'string' || !params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) => {
    if (Object.prototype.hasOwnProperty.call(params, name)) {
      return String(params[name]);
    }
    return match;
  });
};

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(getInitialLang);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      // Ignore persistence failures.
    }
  }, [lang]);

  const setLanguage = useCallback((next) => {
    if (next && DICTIONARIES[next]) {
      setLang(next);
    }
  }, []);

  const t = useCallback(
    (key, params) => {
      const dictionary = DICTIONARIES[lang] || DICTIONARIES[DEFAULT_LANG];
      const resolved = resolveKey(dictionary, key);
      if (resolved !== undefined) return interpolate(resolved, params);
      // Fallback to English, then to the key itself.
      const fallback = resolveKey(DICTIONARIES[DEFAULT_LANG], key);
      if (fallback !== undefined) return interpolate(fallback, params);
      return key;
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLanguage, t, languages: Object.keys(DICTIONARIES) }),
    [lang, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export default I18nProvider;
