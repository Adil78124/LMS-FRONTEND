// Цветовая схема: сдержанный бежевый/кремовый
export const lightTheme = {
  // Основные цвета
  primary: '#C9A88E', // Основной бежевый
  primaryHover: '#B8967A',
  primaryActive: '#A68368',
  secondary: '#E8DDD4', // Светлый беж
  accent: '#D4B5A0', // Акцентный беж

  // Фоны
  background: '#FDF9F5', // Очень светлый кремовый
  surface: '#FFFFFF', // Белый
  surfaceElevated: '#FEFBF8', // Слегка приподнятая поверхность
  overlay: 'rgba(201, 168, 142, 0.1)', // Полупрозрачный оверлей

  // Текст
  text: '#2C2418', // Темно-коричневый для текста
  textSecondary: '#5C4A3A', // Средний коричневый
  textMuted: '#8B7565', // Приглушенный коричневый
  textDisabled: '#B5A899', // Отключенный текст

  // Границы и разделители
  border: '#E5DBD1',
  borderLight: '#F0E8E0',
  divider: '#EDE4DA',

  // Статусы
  success: '#9B8B6F',
  warning: '#C49B7A',
  error: '#C9876A',
  info: '#B8A189',

  // Тени
  shadow: 'rgba(44, 36, 24, 0.08)',
  shadowHover: 'rgba(44, 36, 24, 0.12)',
  shadowActive: 'rgba(44, 36, 24, 0.16)',

  // Градиенты
  gradientPrimary: 'linear-gradient(135deg, #C9A88E 0%, #D4B5A0 100%)',
  gradientBackground: 'linear-gradient(180deg, #FDF9F5 0%, #FAF5EF 100%)',
};

export const darkTheme = {
  // Основные цвета (темнее для темной темы)
  primary: '#B8967A', // Светлее для контраста в темной теме
  primaryHover: '#C9A88E',
  primaryActive: '#A68368',
  secondary: '#3A332C', // Темный коричневый
  accent: '#5C4A3A', // Акцентный темно-коричневый

  // Фоны
  background: '#1F1B17', // Очень темный коричнево-черный
  surface: '#2A2520', // Темная поверхность
  surfaceElevated: '#342F29', // Приподнятая темная поверхность
  overlay: 'rgba(184, 150, 122, 0.15)', // Полупрозрачный оверлей

  // Текст
  text: '#E8DDD4', // Светлый кремовый
  textSecondary: '#D4B5A0', // Средний кремовый
  textMuted: '#B5A899', // Приглушенный кремовый
  textDisabled: '#8B7565', // Отключенный текст

  // Границы и разделители
  border: '#3A332C',
  borderLight: '#2A2520',
  divider: '#342F29',

  // Статусы
  success: '#9B8B6F',
  warning: '#C49B7A',
  error: '#C9876A',
  info: '#B8A189',

  // Тени
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowHover: 'rgba(0, 0, 0, 0.4)',
  shadowActive: 'rgba(0, 0, 0, 0.5)',

  // Градиенты
  gradientPrimary: 'linear-gradient(135deg, #B8967A 0%, #C9A88E 100%)',
  gradientBackground: 'linear-gradient(180deg, #1F1B17 0%, #2A2520 100%)',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px',
};

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
};

export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
};
