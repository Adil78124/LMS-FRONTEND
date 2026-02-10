import { API_BASE_URL } from '../config/api';

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(data.message) ? data.message.join('. ') : data.message || data.error || 'Ошибка запроса';
    throw new Error(msg);
  }
  return data;
}

const base = `${API_BASE_URL}/lesson`;

export const lessonService = {
  async create(courseId, body) {
    const data = await request(`${base}/course/${courseId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return data.lesson;
  },

  async getById(id) {
    return request(`${base}/${id}`);
  },

  async update(id, body) {
    return request(`${base}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async delete(id) {
    return request(`${base}/${id}`, { method: 'DELETE' });
  },
};
