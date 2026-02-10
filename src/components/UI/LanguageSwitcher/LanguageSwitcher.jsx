import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languageNames = {
    ru: 'Русский',
    en: 'English',
    kz: 'Қазақша',
  };

  const languageFlags = {
    ru: '🇷🇺',
    en: '🇬🇧',
    kz: '🇰🇿',
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="language-switcher__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <span className="language-switcher__flag">{languageFlags[language]}</span>
        <span className="language-switcher__name">{languageNames[language]}</span>
        <span className={`language-switcher__arrow ${isOpen ? 'language-switcher__arrow--open' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="language-switcher__dropdown">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              className={`language-switcher__option ${
                lang === language ? 'language-switcher__option--active' : ''
              }`}
              onClick={() => handleLanguageChange(lang)}
            >
              <span className="language-switcher__flag">{languageFlags[lang]}</span>
              <span className="language-switcher__name">{languageNames[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
