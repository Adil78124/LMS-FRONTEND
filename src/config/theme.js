// Цветовая схема: Abai IT Valley (тёмно-синий + акцентный синий)
export const lightTheme = {
  primary: '#4285F4',
  primaryHover: '#3367D6',
  primaryActive: '#2854BA',
  onPrimary: '#FFFFFF',
  secondary: '#E8EEF5',
  accent: '#4285F4',

  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceElevated: '#F8FAFC',
  overlay: 'rgba(66, 133, 244, 0.08)',
  heroBg: '#1A2B40',

  text: '#333333',
  textSecondary: '#444444',
  textMuted: '#666666',
  textDisabled: '#999999',

  border: '#E0E5EB',
  borderLight: '#EEF1F5',
  divider: '#E8ECF0',

  success: '#34A853',
  warning: '#FBBC04',
  error: '#EA4335',
  info: '#4285F4',

  shadow: 'rgba(26, 43, 64, 0.06)',
  shadowHover: 'rgba(66, 133, 244, 0.15)',
  shadowActive: 'rgba(26, 43, 64, 0.12)',

  gradientPrimary: 'linear-gradient(135deg, #4285F4 0%, #5A9BF5 100%)',
  gradientBackground: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
};

export const darkTheme = {
  primary: '#5A9BF5',
  primaryHover: '#4285F4',
  primaryActive: '#3367D6',
  onPrimary: '#FFFFFF',
  secondary: '#2A3544',
  accent: '#5A9BF5',

  background: '#0F1419',
  surface: '#1A2B40',
  surfaceElevated: '#243B55',
  overlay: 'rgba(90, 155, 245, 0.12)',
  heroBg: '#0F1419',

  text: '#E8ECF0',
  textSecondary: '#B8C4D0',
  textMuted: '#8A9AAA',
  textDisabled: '#5C6B7A',

  border: '#2A3544',
  borderLight: '#1A2B40',
  divider: '#243B55',

  success: '#34A853',
  warning: '#FBBC04',
  error: '#EA4335',
  info: '#5A9BF5',

  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowHover: 'rgba(90, 155, 245, 0.2)',
  shadowActive: 'rgba(0, 0, 0, 0.5)',

  gradientPrimary: 'linear-gradient(135deg, #5A9BF5 0%, #4285F4 100%)',
  gradientBackground: 'linear-gradient(180deg, #0F1419 0%, #1A2B40 100%)',
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
