import { API_BASE_URL } from '../config/api';

async function request(url, options = {}) {
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      credentials: 'include',
    });
  } catch (err) {
    if (err?.message === 'Failed to fetch' || err?.name === 'TypeError') {
      throw new Error('Сервер недоступен. Запустите бэкенд: в папке backend выполните pnpm run start:dev');
    }
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data.message) ? data.message.join('. ') : data.message || data.error || 'Ошибка запроса';
    throw new Error(msg);
  }
  return data;
}

const base = `${API_BASE_URL}/category`;

export const categoryService = {
  async getAll() {
    return request(base);
  },

  async getBySlug(slug) {
    return request(`${base}/slug/${slug}`);
  },
};
