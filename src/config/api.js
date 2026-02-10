// API base URL. В dev с proxy — пустая строка (запросы идут на тот же origin, proxy перенаправляет на бэкенд).
// Иначе бэкенд на порту 3001.
const defaultUrl =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
    ? ''
    : 'http://localhost:3001';
export const API_BASE_URL = process.env.REACT_APP_API_URL ?? defaultUrl;
