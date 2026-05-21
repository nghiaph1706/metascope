import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, EXHAUSTIVE_TRANSLATIONS, Translations } from '../data/translations';

interface LanguageContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const persisted = localStorage.getItem('metascope_lang');
      if (persisted === 'en' || persisted === 'vi') {
        return persisted;
      }
    } catch (e) {
      // Ignored
    }
    return 'en'; // default
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('metascope_lang', newLang);
    } catch (e) {
      // Ignored
    }
  };

  const t = EXHAUSTIVE_TRANSLATIONS[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
