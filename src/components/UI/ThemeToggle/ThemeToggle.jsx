import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { IconSun, IconMoon } from '../Icons/Icons';
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
      {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
    </button>
  );
};

export default ThemeToggle;
