import { createContext, useContext } from 'react';

export const I18nContext = createContext({
  lang: 'en',
  setLanguage: () => {},
  t: (key) => key,
  languages: ['en', 'vi'],
});

export const useTranslation = () => useContext(I18nContext);
