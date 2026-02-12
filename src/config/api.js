// API base URL.
// Dev: '' = запросы через proxy на backend:3001 (при backend «pnpm run start:dev» и proxy в package.json).
// Dev с Netlify: задай REACT_APP_API_URL=http://localhost:8888 (backend «pnpm run netlify:dev»).
const defaultUrl =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development'
    ? ''
    : 'http://localhost:3001';
export const API_BASE_URL = process.env.REACT_APP_API_URL ?? defaultUrl;
