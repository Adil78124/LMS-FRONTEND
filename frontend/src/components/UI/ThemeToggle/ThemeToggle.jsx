import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? t('theme.light') : t('theme.dark')}
      title={isDark ? t('theme.light') : t('theme.dark')}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;
