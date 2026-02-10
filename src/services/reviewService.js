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

const base = `${API_BASE_URL}/review`;

export const reviewService = {
  async create(courseId, { rating, comment }) {
    return request(`${base}/course/${courseId}`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },

  async getByCourse(courseId) {
    return request(`${base}/course/${courseId}`);
  },

  async getMyReview(courseId) {
    const data = await request(`${base}/course/${courseId}/my`);
    return data.review;
  },
};
