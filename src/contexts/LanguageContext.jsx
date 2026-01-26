import React, { createContext, useContext, useState, useEffect } from 'react';
import { t, translations } from '../config/i18n';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ru');

  useEffect(() => {
    // Загрузка языка из localStorage
    const savedLanguage = localStorage.getItem('language') || 'ru';
    setLanguage(savedLanguage);
    document.documentElement.setAttribute('lang', savedLanguage);
  }, []);

  const changeLanguage = (lang) => {
    if (['ru', 'en', 'kz'].includes(lang)) {
      setLanguage(lang);
      localStorage.setItem('language', lang);
      document.documentElement.setAttribute('lang', lang);
    }
  };

  const translate = (key) => {
    return t(key, language);
  };

  const value = {
    language,
    setLanguage: changeLanguage,
    t: translate,
    translations: translations[language],
    availableLanguages: ['ru', 'en', 'kz'],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
