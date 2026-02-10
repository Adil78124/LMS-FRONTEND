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

const base = `${API_BASE_URL}/enrollment`;

export const enrollmentService = {
  async enroll(courseId) {
    return request(`${base}/course/${courseId}`, { method: 'POST' });
  },

  async getMyEnrollments() {
    return request(`${base}/my`);
  },

  async updateProgress(courseId, progressPercent) {
    return request(`${base}/course/${courseId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progressPercent }),
    });
  },

  async checkEnrollment(courseId) {
    const data = await request(`${base}/course/${courseId}/check`);
    return data.enrolled ?? false;
  },
};
