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

const base = `${API_BASE_URL}/course`;

export const courseService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.level) params.set('level', filters.level);
    const q = params.toString();
    return request(`${base}${q ? `?${q}` : ''}`);
  },

  async getById(id) {
    return request(`${base}/${id}`);
  },

  async getMyCourses() {
    return request(`${base}/my`);
  },

  async uploadCover(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${base}/upload/cover`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = Array.isArray(data.message) ? data.message.join('. ') : data.message || data.error || 'Ошибка загрузки';
      throw new Error(msg);
    }
    return data;
  },

  async create(body) {
    const data = await request(base, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return data.course;
  },

  async update(id, body) {
    return request(`${base}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async archive(id) {
    return request(`${base}/${id}`, { method: 'DELETE' });
  },

  async deletePermanent(id) {
    return request(`${base}/permanent/${id}`, { method: 'DELETE' });
  },
};
