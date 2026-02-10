import { API_BASE_URL } from '../config/api';

const authApi = `${API_BASE_URL}/auth`;

async function request(url, options = {}) {
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      credentials: 'include',
    });
  } catch (err) {
    if (err?.message === 'Failed to fetch' || err?.name === 'TypeError') {
      throw new Error('Сервер недоступен. Запустите бэкенд: из корня проекта выполните npm run backend');
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

export const authService = {
  async login(email, password) {
    return request(`${authApi}/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register({ fullname, email, password, role = 'student' }) {
    return request(`${authApi}/register`, {
      method: 'POST',
      body: JSON.stringify({ fullname, email, password, role }),
    });
  },

  async logout() {
    return request(`${authApi}/logout`, { method: 'POST' });
  },

  async getMe() {
    return request(`${authApi}/me`);
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${authApi}/upload/avatar`, {
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

  async updateProfile(payload) {
    return request(`${authApi}/me`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
